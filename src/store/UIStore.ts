import { observable, action, computed } from 'mobx';
import { NodeTemplatesPanelWidth } from '../global';
import { PNode, OrphanNodeInfo } from '../index.type';

const defaultOrphanNodeInfo: OrphanNodeInfo = {
  cx: -100000,
  cy: -100000,
  node: undefined
};

export default class UIStore {
  @observable.struct windowDim = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  @computed.struct get painterDim() {
    return {
      width: this.windowDim.width - NodeTemplatesPanelWidth,
      height: this.windowDim.height
    };
  }

  @action
  onResize = () => {
    this.windowDim = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  };

  @observable.struct orphanNodeInfo: OrphanNodeInfo = defaultOrphanNodeInfo;

  @action
  showOrphanNode = (orphanNodeInfo: OrphanNodeInfo) => {
    this.orphanNodeInfo = orphanNodeInfo;
  };

  @action
  hideOrphanNode = () => {
    this.orphanNodeInfo = defaultOrphanNodeInfo;
  };
}
