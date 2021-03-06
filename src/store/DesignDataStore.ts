import {
  PNode,
  PEdge,
  DesignerData,
  PElement,
  PPosition,
  PNodeId,
  PContext,
  PAnchorType,
  OrphanEdge,
  PEdgeId,
  ElementType,
  PAnchor,
  Shape,
  RectSize,
  CircleSize,
  SnappableGrid,
  DesignerEvents
} from '../index.type';
import { observable, computed, action, toJS, IObservableArray } from 'mobx';
import ConfigStore from './ConfigStore';
import {
  nodeAnchorXY,
  nodeAnchorXYByNodeId,
  edgeAnchorXY,
  rearrange,
  getNode,
  getEdge,
  nextElementId
} from '../helper';
import { flatten, distance } from '../util';
import { GripSnapThreshold, StartId, EndId } from '../global';
import { Omit } from 'ts-type-ext';

export default class DesignDataStore {
  configStore: ConfigStore;

  events: DesignerEvents;

  @observable
  context: PContext = observable({
    snappableGrid: {
      xs: [],
      ys: []
    },
    selectedOrphanEdgeIds: [],
    selectedNodeIds: [],
    selectedEdgeIds: []
  });

  nodes: IObservableArray<PNode> = observable([]);

  edges: IObservableArray<PEdge> = observable([]);

  orphanEdges: IObservableArray<OrphanEdge> = observable([]);

  @computed
  get startNode(): PNode {
    return this.nodes.find(({ templateId }) => templateId === StartId)!;
  }

  @computed
  get endNode(): PNode {
    return this.nodes.find(({ templateId }) => templateId === EndId)!;
  }

  // 全部node的anchors
  @computed
  get anchors(): PAnchor[] {
    const anchorss = this.nodes.map(node => {
      return ['lc', 'tc', 'rc', 'bc'].map((p: PAnchorType) => {
        return {
          host: node,
          anchor: p,
          xy: this.anchorXY(node, p)
        };
      });
    });

    return flatten<PAnchor>(anchorss);
  }

  @computed
  get data(): DesignerData {
    return {
      nodes: this.nodes,
      edges: this.edges
    };
  }

  constructor(
    designData: DesignerData,
    configStore: ConfigStore,
    events: DesignerEvents
  ) {
    this.events = events;
    this.configStore = configStore;

    const nodeTemplates = configStore.nodeTemplates;

    this.nodes.replace(
      (designData.nodes || [])
        .sort((a, b) => a.id - b.id)
        .map((node: PNode) => {
          const { templateId } = node;
          const tNode = nodeTemplates.find(({ id }) => id === templateId)!;
          return {
            ...tNode,
            ...node,
            dim: { ...tNode.dim!, cx: node.dim!.cx, cy: node.dim!.cy }
          };
        })
    );

    this.edges.replace((designData.edges || []).sort((a, b) => a.id - b.id));
  }

  //////////////////////////////////////////////  actions  /////////////////////////////////////////////////////

  // 加入新节点, 注意需要重新分配id
  @action
  addNode(node: PNode): void {
    // 不可重复添加start
    if (node.templateId === StartId && this.getNode(StartId)) return;

    // 不可重复添加end
    if (node.templateId === EndId && this.getNode(EndId)) return;

    if (node.templateId === EndId) {
      // 如果新增结束结点, 强制其与开始结点在同一竖直线上
      const cx = this.startNode.dim!.cx;
      node = { ...node, dim: { ...node.dim!, cx } };
    }

    const newNode = { ...toJS(node), id: nextElementId(this.nodes) };

    this.nodes.push(newNode);

    if (node.templateId !== StartId && node.templateId !== EndId) {
      this.events.onAddNode!(newNode.id, toJS(newNode.data) || {});
    }

    this.selectNode(newNode.id);
  }

  @action
  addEdge(edge: Omit<PEdge, 'id'>): void {
    const { from, to } = edge;

    if (from.id !== to.id && !this.findEdgeByStartAndEndNode(from.id, to.id)) {
      // 仅当两个node间没有edge时, 才创建新edge
      const newEdge = { ...edge, id: nextElementId(this.edges) };
      this.edges.push(newEdge);
      this.selectEdge(newEdge.id);
    }
  }

  @action
  patchNode(nodePatch: Partial<PNode>): void {
    const id = nodePatch.id!;
    const idx = this.nodes.findIndex(n => n.id === id);
    this.nodes[idx] = { ...this.nodes[idx], ...nodePatch };
  }

  @action
  patchEdge(edgePatch: Partial<PEdge>): void {
    const id = edgePatch.id!;
    const idx = this.edges.findIndex(e => e.id === id);
    this.edges[idx] = { ...this.edges[idx], ...edgePatch };
  }

  @action
  resetEdgeFlag(edgeId: PEdgeId): void {
    const idx = this.edges.findIndex(e => e.id === edgeId);
    const { flag, ...newEdge } = this.edges[idx];
    this.edges[idx] = newEdge;
  }

  // 移动节点或边
  @action
  repositionNode(attrs: { element: PElement; newPos: PPosition }): void {
    const { element, newPos } = attrs;
    if (element.type === ElementType.Node) {
      this.nodes.forEach(node => {
        if (node.id === element.id) {
          node.dim = { ...node.dim, ...newPos };
        }
      });
    } else {
      throw new Error(`错误的element type类型:${element.type}`);
    }
  }

  @action
  moveAllNodes(pos0: [PNodeId, PPosition][], dx: number, dy: number) {
    this.nodes.replace(
      this.nodes.map(node => {
        const [_, nodePosition] = pos0.find(
          ([nodeId, _]) => nodeId === node.id
        )!;
        return {
          ...node,
          dim: {
            ...node.dim,
            cx: nodePosition.cx + dx,
            cy: nodePosition.cy + dy
          }
        };
      })
    );
  }

  // 增加孤立边
  @action
  upsetOrphanEdge(oedge: OrphanEdge) {
    const idx = this.orphanEdges.findIndex(o => o.id === oedge.id);
    if (idx < 0) {
      this.orphanEdges.push(oedge);
    } else {
      this.orphanEdges[idx] = { ...this.orphanEdges[idx], ...oedge };
    }
  }

  // 选择某个node
  @action
  selectNode(id: PNodeId) {
    this.unselectAll();
    setTimeout(
      action(() => {
        this.context.selectedNodeIds = [id];
        const node = this.getNode(id)!;
        if (node.templateId !== StartId && node.templateId !== EndId) {
          this.events.onActiveNode &&
            this.events.onActiveNode(id, toJS(node.data) || {});
        }
      }),
      0
    );
  }

  @action
  selectEdge(id: PEdgeId) {
    this.unselectAll();
    setTimeout(
      action(() => {
        this.context.selectedEdgeIds = [id];
      }),
      0
    );
  }

  @action
  selectOrphanEdge(id: PEdgeId) {
    this.unselectAll();
    setTimeout(
      action(() => {
        this.context.selectedOrphanEdgeIds = [id];
      }),
      0
    );
  }

  @action
  unselectAll() {
    this.context.selectedOrphanEdgeIds = [];
    this.context.selectedNodeIds = [];
    this.context.selectedEdgeIds = [];
    this.context.snappableGrid = { xs: [], ys: [] };
    this.events.onActiveNode && this.events.onActiveNode();
  }

  @action
  delSelected() {
    const {
      selectedOrphanEdgeIds,
      selectedNodeIds,
      selectedEdgeIds
    } = this.context;
    (selectedOrphanEdgeIds || []).forEach(id => this.delOrphanEdge(id));
    (selectedEdgeIds || []).forEach(id => this.delEdge(id));
    (selectedNodeIds || []).forEach(id => this.delNode(id));
    this.unselectAll();
  }

  @action
  delNode(id: PNodeId) {
    if (id === StartId) return;
    // 要被删除的node
    const node = this.nodes.find(node => node.id === id)!;
    const templateId = node.templateId;

    this.nodes.replace(this.nodes.filter(node => node.id !== id));

    this.delEdgeOnNode(id);
    if (templateId !== StartId && templateId !== EndId) {
      this.events.onDelNode!(id);
    }
    this.unselectAll();
  }

  @action
  delEdge(id: PEdgeId) {
    this.edges.replace(this.edges.filter(edge => edge.id !== id));
    this.unselectAll();
  }

  // 删除特定node上的所有edge
  @action
  delEdgeOnNode(id: PNodeId) {
    this.edges.replace(
      this.edges.filter(edge => edge.from.id !== id && edge.to.id !== id)
    );
  }

  @action
  delOrphanEdge(id: PEdgeId) {
    this.orphanEdges.replace(
      (this.orphanEdges || []).filter(oedge => oedge.id !== id)
    );
    this.context.selectedOrphanEdgeIds = (
      this.context.selectedOrphanEdgeIds || []
    ).filter(_id => id !== id);
  }

  @action hideEdge(id: PEdgeId) {
    this.context.hidedEdgeId = id;
  }

  @action showEdge(id: PEdgeId) {
    if (this.context.hidedEdgeId === id) {
      delete this.context.hidedEdgeId;
    }
  }

  @action showSnappableGrid(sb: SnappableGrid) {
    this.context.snappableGrid = sb;
  }

  @action hideSnappableGrid() {
    this.context.snappableGrid = {};
  }

  @action rearrange() {
    const { hGap, vGap } = this.configStore.rearrange!;
    const { nodes, edges } = rearrange(
      toJS(this.nodes),
      toJS(this.edges),
      this.startNode,
      hGap,
      vGap
    );
    this.nodes.replace(nodes);
    this.edges.replace(edges);
  }

  //////////////////////////////////////////////  工具方法  /////////////////////////////////////////////////////
  findEdgeByStartAndEndNode(
    fromNodeId: PNodeId,
    toNodeId: PNodeId
  ): PEdge | undefined {
    return this.edges.find(
      edge => edge.from.id === fromNodeId && edge.to.id === toNodeId
    );
  }

  // 根据类型和id反推节点或边
  getElement(type: string, id: number): PElement {
    if (type === ElementType.Node) {
      return this.nodes.find(node => node.id === id)!;
    } else if (type === ElementType.Edge) {
      return this.edges.find(edge => edge.id === id)!;
    } else {
      throw new Error(`错误的element type类型:${type}`);
    }
  }

  // 根据element获取原始cx 与 cy
  // 注意只针对 可移动实体
  getElementPos(element: PElement) {
    if (element.type === ElementType.Node) {
      const node = element as PNode;
      return { cx: node.dim!.cx, cy: node!.dim!.cy };
    } else {
      throw new Error(`错误的element type类型:${element.type}`);
    }
  }

  // 获得node或edge上anchor的位置
  anchorXY(element: PElement, anchor: PAnchorType): PPosition {
    if (element.type === ElementType.Node) {
      return nodeAnchorXY(element as PNode, anchor);
    } else if (element.type === ElementType.Edge) {
      return edgeAnchorXY(element as PEdge, anchor, this.nodes);
    } else {
      throw new Error(`错误的hostType:${element.type}`);
    }
  }

  isSelectedNode(id: PNodeId) {
    return ~(this.context.selectedNodeIds || []).indexOf(id);
  }

  isSelectedEdge(id: PEdgeId) {
    return ~(this.context.selectedEdgeIds || []).indexOf(id);
  }

  getNode(_id: PNodeId) {
    return getNode(this.nodes, _id);
  }

  getEdge(_id: PEdgeId) {
    return getEdge(this.edges, _id);
  }

  getOrphanEdge(_id: PEdgeId) {
    return this.orphanEdges.find(({ id }) => _id === id);
  }

  // 计算孤立边两个端点的坐标
  getOrphanEdgeEndPoints(
    oedgeId: PEdgeId
  ): { fromXY: PPosition; toXY: PPosition } {
    const oedge = this.orphanEdges.find(({ id }) => oedgeId === id);
    if (!oedge) {
      throw new Error(`oedgeId无效:${oedgeId}`);
    }

    const { from, to } = oedge;

    let fromXY;
    // 不能用id, id可能=0
    if ((from as any).anchor) {
      fromXY = nodeAnchorXYByNodeId(
        this.nodes,
        (from as any).id,
        (from as any).anchor
      );
    } else {
      fromXY = from as PPosition;
    }

    let toXY;
    if ((to as any).anchor) {
      toXY = nodeAnchorXYByNodeId(
        this.nodes,
        (to as any).id,
        (to as any).anchor
      );
    } else {
      toXY = to as PPosition;
    }

    return {
      fromXY,
      toXY
    };
  }

  // 计算有效边 两个端点的 坐标
  getEdgeEndPoints(edgeId: PEdgeId): { fromXY: PPosition; toXY: PPosition } {
    const edge = this.edges.find(({ id }) => edgeId === id);
    if (!edge) {
      throw new Error(`edgeId无效:${edgeId}`);
    }

    const { from, to } = edge;

    return {
      fromXY: nodeAnchorXYByNodeId(this.nodes, from.id, from.anchor),
      toXY: nodeAnchorXYByNodeId(this.nodes, to.id, to.anchor)
    };
  }

  // 生成下一个孤立边的id
  nextOrphanEdgeId() {
    return nextElementId(this.orphanEdges);
  }

  // xy靠近anchor时, 如果小于特定距离, 将被此anchor捕捉
  findSnappedAnchor(x: number, y: number) {
    return this.anchors.find(
      ({ xy }: PAnchor) =>
        distance({ x: xy.cx, y: xy.cy }, { x, y }) <= GripSnapThreshold
    );
  }

  // xy点在哪个node里
  xyInWhichNode(x: number, y: number): PNode | undefined {
    return this.nodes.find(node => {
      const { dim, shape } = node;
      const { cx, cy } = dim as PPosition;
      if (shape === Shape.Rect) {
        const { w, h } = dim as RectSize;
        return (
          x >= cx - w! / 2 &&
          x <= cx + w! / 2 &&
          y >= cy - h! / 2 &&
          y <= cy + h! / 2
        );
      } else if (shape === Shape.Circle) {
        const { r } = dim as CircleSize;
        return distance({ x, y }, { x: cx, y: cy }) <= r!;
      } else {
        throw new Error(`错误的shape: ${shape}`);
      }
    });
  }
}
