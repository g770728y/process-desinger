import { observable, computed, action, IObservableArray, toJS } from 'mobx';
import {
  PNodeCandidate,
  PConfig,
  PNodeTemplate,
  ElementType
} from '../index.type';
import {
  defaultNodeTemplates,
  StartId,
  EndId,
  defaultNodeCandidates
} from '../global';

export default class ConfigStore {
  @observable canvas: { background?: string };

  @observable rearrange: { vGap: number; hGap: number };

  @observable ui: { nodeCandidatesPanelTop: number };

  nodeTemplates: IObservableArray<PNodeTemplate> = observable([]);
  nodeCandidates: IObservableArray<PNodeCandidate> = observable([]);

  hideEdgeFlagInput: boolean;

  @computed get config(): PConfig {
    return {
      canvas: this.canvas,
      nodeTemplates: this.nodeTemplates,
      nodeCandidates: this.nodeCandidates,
      ui: this.ui
    };
  }

  // 返回全部节点, 排除 开始节点与结束节点
  @computed get bizNodeCandidates(): PNodeCandidate[] {
    return this.nodeCandidates.filter(
      nodeCandidate => !~[StartId, EndId].indexOf(nodeCandidate.templateId!)
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
      [...defaultNodeTemplates, ...nodeTemplates]
        .map(nodeTemplate => ({ ...nodeTemplate, type: ElementType.Node }))
        .sort((a, b) => a.id - b.id)
    );
  }

  @action
  resetNodeCandidates(nodeCandidates: PNodeCandidate[]) {
    if (
      nodeCandidates.filter(n => n.id === StartId || n.id === EndId).length >= 1
    ) {
      throw new Error(`节点模板nodeCandidate的id不能为 ${StartId} 或 ${EndId}`);
    }

    this.nodeCandidates.replace(
      [...defaultNodeCandidates, ...nodeCandidates]
        .map(nodeCandidate => {
          const tNode = this.nodeTemplates.find(
            nodeTemplate => nodeTemplate.id === nodeCandidate.templateId
          );
          if (!tNode) {
            throw new Error('nodeCandidate.templateId必须对应到nodeTemplate!');
          }
          return { ...tNode, ...nodeCandidate };
        })
        .map((nodeCandidate, i) => ({
          ...nodeCandidate,
          id: i + 1
        }))
        .map(nodeCandidate => ({ ...nodeCandidate, type: ElementType.Node }))
    );
  }

  constructor(config: PConfig) {
    this.canvas = config.canvas || {};
    this.rearrange = config.rearrange!;
    this.resetNodeTemplates(config.nodeTemplates);
    this.resetNodeCandidates(config.nodeCandidates);
    this.ui = config.ui || { nodeCandidatesPanelTop: 0 };
    this.hideEdgeFlagInput = config.hideEdgeFlagInput || false;
  }
}
