import { observable, computed } from 'mobx';
import { PNodeTemplate, PConfig } from '../index.type';
import { defaultNodeTemplates, StartId, EndId } from '../global';

export default class ConfigStore {
  @observable canvas: { background?: string };

  @observable rearrange: { vGap: number; hGap: number };

  @observable nodeTemplates: PNodeTemplate[];

  @computed get config(): PConfig {
    return {
      canvas: this.canvas,
      nodeTemplates: this.nodeTemplates
    };
  }

  // 返回全部节点, 排除 开始节点与结束节点
  @computed get bizNodeTemplates(): PNodeTemplate[] {
    return this.nodeTemplates.filter(
      nodeTemplate => !~[StartId, EndId].indexOf(nodeTemplate.id)
    );
  }

  constructor(config: PConfig) {
    this.canvas = config.canvas || {};
    this.rearrange = config.rearrange!;
    this.nodeTemplates = [
      ...defaultNodeTemplates,
      ...config.nodeTemplates
    ].sort((a, b) => a.id - b.id);
  }
}
