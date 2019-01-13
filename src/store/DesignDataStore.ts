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
  Identity,
  ElementType,
  PAnchor,
  Shape,
  RectSize,
  CircleSize,
  SnappableGrid,
  DesignerEvents
} from '../index.type';
import { observable, computed, action, toJS, extendObservable } from 'mobx';
import ConfigStore from './ConfigStore';
import {
  nodeAnchorXY,
  nodeAnchorXYByNodeId,
  edgeAnchorXY,
  rearrange
} from '../helper';
import { flatten, distance } from '../util';
import { GripSnapThreshold, StartId, EndId } from '../global';
import { Omit } from 'ts-type-ext';

function nextElementId(identities: Identity[]): number {
  if (!identities || identities.length === 0) return 1;
  return (
    identities.reduce(
      (acc: number, item: PNode) => (acc < item.id ? item.id : acc),
      -10000
    ) + 1
  );
}

export default class DesignDataStore {
  configStore: ConfigStore;

  events: DesignerEvents;

  @observable
  context: PContext = {
    snappableGrid: {
      xs: [],
      ys: []
    }
  };

  @observable
  nodes: PNode[] = [];

  @observable
  edges: PEdge[] = [];

  @observable
  orphanEdges: OrphanEdge[] = [];

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

    this.nodes = (designData.nodes || [])
      .sort((a, b) => a.id - b.id)
      .map((node: PNode) => {
        const { templateId } = node;
        const tNode = nodeTemplates.find(({ id }) => id === templateId);
        return {
          id: node.id,
          type: node.type,
          label: node.label || tNode!.label,
          shape: tNode!.shape,
          templateId,
          dim: {
            ...tNode!.dim!,
            ...node.dim!
          }
        };
      });
    this.edges = (designData.edges || []).sort((a, b) => a.id - b.id);
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

    this.context.selectedNodeIds = [newNode.id];

    if (node.templateId !== StartId && node.templateId !== EndId) {
      this.events.onAddNode!(newNode.id);
    }
  }

  @action
  addEdge(edge: Omit<PEdge, 'id'>): void {
    const { from, to } = edge;

    if (from.id !== to.id && !this.findEdgeByStartAndEndNode(from.id, to.id)) {
      // 仅当两个node间没有edge时, 才创建新edge
      this.edges.push({ ...edge, id: nextElementId(this.edges) });
    }
  }

  @action
  patchNode(nodePatch: Partial<PNode>): void {
    const id = nodePatch.id!;
    const node = this.getNode(id)!;
    Object.assign(node, nodePatch);
  }

  @action
  patchEdge(edgePatch: Partial<PEdge>): void {
    const id = edgePatch.id!;
    const edge = this.getEdge(id)!;
    Object.assign(edge, edgePatch);
  }

  @action
  resetEdgeFlag(edgeId: PEdgeId): void {
    const edge = this.getEdge(edgeId)!;
    delete edge.flag;
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
    this.nodes = this.nodes.map(node => {
      const [_, nodePosition] = pos0.find(([nodeId, _]) => nodeId === node.id)!;
      return {
        ...node,
        dim: { ...node.dim, cx: nodePosition.cx + dx, cy: nodePosition.cy + dy }
      };
    });
  }

  // 增加孤立边
  @action
  upsetOrphanEdge(oedge: OrphanEdge) {
    const oldOrphanEdge = this.getOrphanEdge(oedge.id);
    if (!oldOrphanEdge) {
      this.orphanEdges.push(oedge);
    } else {
      Object.assign(oldOrphanEdge, oedge);
    }
  }

  // 选择某个node
  @action
  selectNode(id: PNodeId) {
    this.context.selectedEdgeIds = [];
    this.context.selectedOrphanEdgeIds = [];
    this.context.selectedNodeIds = [id];
  }

  @action
  selectEdge(id: PEdgeId) {
    this.context.selectedOrphanEdgeIds = [];
    this.context.selectedNodeIds = [];
    this.context.selectedEdgeIds = [id];
  }

  @action
  selectOrphanEdge(id: PEdgeId) {
    this.context.selectedOrphanEdgeIds = [id];
    this.context.selectedNodeIds = [];
    this.context.selectedEdgeIds = [];
  }

  @action
  unselectAll() {
    this.context.selectedOrphanEdgeIds = [];
    this.context.selectedNodeIds = [];
    this.context.selectedEdgeIds = [];
    this.context.snappableGrid = { xs: [], ys: [] };
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

    this.nodes = this.nodes.filter(node => node.id !== id);

    this.delEdgeOnNode(id);
    if (node.templateId !== StartId && node.templateId !== EndId) {
      this.events.onDelNode!(id);
    }
  }

  @action
  delEdge(id: PEdgeId) {
    this.edges = this.edges.filter(edge => edge.id !== id);
  }

  // 删除特定node上的所有edge
  @action
  delEdgeOnNode(id: PNodeId) {
    this.edges = this.edges.filter(
      edge => edge.from.id !== id && edge.to.id !== id
    );
  }

  @action
  delOrphanEdge(id: PEdgeId) {
    this.orphanEdges = (this.orphanEdges || []).filter(
      oedge => oedge.id !== id
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
    delete this.context.snappableGrid;
  }

  @action rearrange() {
    const { hGap, vGap } = this.configStore.rearrange!;
    this.nodes = rearrange(this.nodes, this.edges, this.startNode, hGap, vGap);
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

  getNode(_id: PNodeId) {
    return this.nodes.find(({ id }) => id === _id);
  }

  getEdge(_id: PEdgeId) {
    return this.edges.find(({ id }) => _id === id);
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
