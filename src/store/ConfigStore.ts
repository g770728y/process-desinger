import { observable, computed } from 'mobx';
import { PNodeTemplate, PConfig } from '../index.type';
import { defaultNodeTemplates } from '../global';

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

  constructor(config: PConfig) {
    this.canvas = config.canvas || {};
    this.rearrange = config.rearrange!;
    this.nodeTemplates = [
      ...defaultNodeTemplates,
      ...config.nodeTemplates
    ].sort((a, b) => a.id - b.id);
  }
}
