import {
  PNode,
  PEdge,
  DesignData,
  PElement,
  Position,
  PNodeId,
  PContext
} from '../index.type';
import { observable, computed, action } from 'mobx';
import ConfigStore from './ConfigStore';
import { DataNodeType, DataEdgeType } from '../global';

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
  move(attrs: { dataType: string; element: PElement; newPos: Position }): void {
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
    this.context.selectedNodeIds = [id];
  }

  //////////////////////////////////////////////  工具方法  /////////////////////////////////////////////////////
  // 根据类型和id反推节点或边
  getElement(type: string, id: number): PElement | undefined {
    if (type === DataNodeType) {
      return this.nodes.find(node => node.id === id);
    } else if (type === DataEdgeType) {
      return this.edges.find(edge => edge.id === id);
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
}
