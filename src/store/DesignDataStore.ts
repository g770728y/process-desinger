import { PNode, PEdge, DesignData } from '../index.type';
import { observable, computed, action } from 'mobx';
import ConfigStore from './ConfigStore';

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

  // 加入新节点, 注意需要重新分配id
  @action
  addNode(node: PNode): void {
    this.nodes.push({ ...node, id: nextNodeId(this.nodes) });
  }
}
