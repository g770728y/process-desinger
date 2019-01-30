import { observable, computed, action, IObservableArray, toJS } from 'mobx';
import { PNodeTemplate, PConfig } from '../index.type';
import { defaultNodeTemplates, StartId, EndId } from '../global';

export default class ConfigStore {
  @observable canvas: { background?: string };

  @observable rearrange: { vGap: number; hGap: number };

  @observable ui: { nodeTemplatesPanelTop: number };

  nodeTemplates: IObservableArray<PNodeTemplate> = observable([]);

  @computed get config(): PConfig {
    return {
      canvas: this.canvas,
      nodeTemplates: this.nodeTemplates,
      ui: this.ui
    };
  }

  // 返回全部节点, 排除 开始节点与结束节点
  @computed get bizNodeTemplates(): PNodeTemplate[] {
    return this.nodeTemplates.filter(
      nodeTemplate => !~[StartId, EndId].indexOf(nodeTemplate.id)
    );
  }

  // 重置全部nodeTemplates
  @action
  resetNodeTemplates(nodeTemplates: PNodeTemplate[]) {
    if (
      nodeTemplates.filter(n => n.id === StartId || n.id === EndId).length >= 1
    ) {
      throw new Error(`节点模板nodeTemplater的id不能为 ${StartId} 或 ${EndId}`);
    }

    this.nodeTemplates.replace(
      [...defaultNodeTemplates, ...nodeTemplates].sort((a, b) => a.id - b.id)
    );
  }

  constructor(config: PConfig) {
    this.canvas = config.canvas || {};
    this.rearrange = config.rearrange!;
    this.resetNodeTemplates(config.nodeTemplates);
    this.ui = config.ui || { nodeTemplatesPanelTop: 0 };
  }
}
