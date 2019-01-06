import {
  PNode,
  PEdge,
  DesignData,
  PElement,
  PPosition,
  PNodeId,
  PContext,
  PAnchorType,
  OrphanEdge,
  PEdgeId,
  Identity,
  ElementType,
  PAnchor
} from '../index.type';
import { observable, computed, action } from 'mobx';
import ConfigStore from './ConfigStore';
import { nodeAnchorXY } from '../helper';
import { flatten, distance } from '../util';
import { SnapRadius } from '../global';
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

  @observable
  context: PContext = {};

  @observable
  nodes: PNode[] = [];

  @observable
  edges: PEdge[] = [];

  @observable
  orphanEdges: OrphanEdge[] = [];

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
  get data(): DesignData {
    return {
      nodes: this.nodes,
      edges: this.edges
    };
  }

  constructor(designData: DesignData, configStore: ConfigStore) {
    const nodeTemplates = configStore.nodeTemplates;

    this.nodes = (designData.nodes || [])
      .sort((a, b) => a.id - b.id)
      .map((node: PNode) => {
        const { templateId } = node;
        const tNode = nodeTemplates.find(({ id }) => id === templateId);
        return {
          id: node.id,
          type: node.type,
          name: node.name || tNode!.name,
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
    this.nodes.push({ ...node, id: nextElementId(this.nodes) });
  }

  @action
  addEdge(edge: Omit<PEdge, 'id'>): void {
    this.edges.push({ ...edge, id: nextElementId(this.edges) });
  }

  // 移动节点或边
  @action
  moveNode(attrs: { element: PElement; newPos: PPosition }): void {
    const { element, newPos } = attrs;
    if (element.type === ElementType.Node) {
      const { id } = element;
      this.nodes.forEach(node => {
        if (node.id === element.id) {
          node.dim = { ...node.dim, ...newPos };
        }
      });
    } else {
      throw new Error(`错误的element type类型:${element.type}`);
    }
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
    this.nodes = this.nodes.filter(node => node.id !== id);
    this.delEdgeOnNode(id);
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
    this.context.selectedOrphanEdgeIds = (
      this.context.selectedOrphanEdgeIds || []
    ).filter(_id => id !== id);
    this.orphanEdges = (this.orphanEdges || []).filter(
      oedge => oedge.id !== id
    );
  }

  //////////////////////////////////////////////  工具方法  /////////////////////////////////////////////////////
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
      const edge = element as PEdge;
      if (anchor === '0') {
        // 边的起点
        const { id, anchor } = edge.from;
        const node = this.getNode(id);
        return nodeAnchorXY(node!, anchor);
      } else {
        const { id, anchor } = edge.to;
        const node = this.getNode(id);
        return nodeAnchorXY(node!, anchor);
      }
    } else {
      throw new Error(`错误的hostType:${element.type}`);
    }
  }

  getNode(_id: PNodeId) {
    return this.nodes.find(({ id }) => id === _id);
  }

  getOrphanEdge(_id: PEdgeId) {
    return this.orphanEdges.find(({ id }) => _id === id);
  }

  getEdgeEndPoints(edgeId: PEdgeId): { fromXY: PPosition; toXY: PPosition } {
    const edge = this.edges.find(({ id }) => edgeId === id);
    if (!edge) {
      throw new Error(`edgeId无效:${edgeId}`);
    }

    const { from, to } = edge;

    const fromNode = this.nodes.find(({ id }) => id === from.id);
    const toNode = this.nodes.find(({ id }) => id === to.id);

    const fromXY = nodeAnchorXY(fromNode!, from.anchor);
    const toXY = nodeAnchorXY(toNode!, to.anchor);

    return {
      fromXY,
      toXY
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
        distance({ x: xy.cx, y: xy.cy }, { x, y }) <= SnapRadius
    );
  }
}
