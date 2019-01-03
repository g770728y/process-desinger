import { PNode, PEdge, DesignData } from '../index.type';
import { observable, computed } from 'mobx';
import ConfigStore from './ConfigStore';

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
}
