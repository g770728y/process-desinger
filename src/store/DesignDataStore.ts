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
  PEdgeId
} from '../index.type';
import { observable, computed, action } from 'mobx';
import ConfigStore from './ConfigStore';
import { DataNodeType, DataEdgeType } from '../global';
import { nodeAnchorXY, xyOfCircleAnchor, xyOfRectAnchor } from '../helper';

function nextNodeId(nodes: PNode[]): number {
  return (
    nodes.reduce(
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
  nodes: PNode[];

  @observable
  edges: PEdge[];

  @observable
  orphanEdges: OrphanEdge[];

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
    this.nodes.push({ ...node, id: nextNodeId(this.nodes) });
  }

  // 移动节点或边
  @action
  moveNode(attrs: {
    dataType: string;
    element: PElement;
    newPos: PPosition;
  }): void {
    const { dataType, element, newPos } = attrs;
    if (dataType === DataNodeType) {
      const { id } = element;
      this.nodes.forEach(node => {
        if (node.id === element.id) {
          node.dim = { ...node.dim, ...newPos };
        }
      });
    } else {
      throw new Error(`错误的element type类型:${dataType}`);
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

  //////////////////////////////////////////////  工具方法  /////////////////////////////////////////////////////
  // 根据类型和id反推节点或边
  getElement(type: string, id: number): PElement {
    if (type === DataNodeType) {
      return this.nodes.find(node => node.id === id)!;
    } else if (type === DataEdgeType) {
      return this.edges.find(edge => edge.id === id)!;
    } else {
      throw new Error(`错误的element type类型:${type}`);
    }
  }

  // 根据element获取原始cx 与 cy
  // 注意只针对 可移动实体
  getElementPos(element: PElement, type: string) {
    if (type === DataNodeType) {
      const node = element as PNode;
      return { cx: node.dim!.cx, cy: node!.dim!.cy };
    } else {
      throw new Error(`错误的element type类型:${type}`);
    }
  }

  // 获得node或edge上anchor的位置
  anchorXY(
    element: PElement,
    hostType: string,
    anchor: PAnchorType
  ): PPosition {
    if (hostType === DataNodeType) {
      return nodeAnchorXY(element as PNode, anchor);
    } else if (hostType === DataEdgeType) {
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
      throw new Error(`错误的hostType:${hostType}`);
    }
  }

  getNode(_id: PNodeId) {
    return this.nodes.find(({ id }) => id === _id);
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
}
