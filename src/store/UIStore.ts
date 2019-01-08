import { observable, action, computed } from 'mobx';
import { NodeTemplatesPanelWidth } from '../global';
import { PNode, OrphanNodeInfo, PBox } from '../index.type';

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

  @observable.struct painterContainerBox = {
    x: 0,
    y: 0,
    w: 300,
    h: 300
  };

  // 暂时不需要observable, 因为只是供 OrphanNode 拖动时临时使用
  painterScrollTop = 0;

  @computed.struct get painterDim() {
    return {
      x: NodeTemplatesPanelWidth + this.painterContainerBox.x,
      y: this.painterContainerBox.y,
      w: this.painterContainerBox.w - NodeTemplatesPanelWidth,
      h: this.painterContainerBox.h
    };
  }

  @action
  resetWindowDim() {
    this.windowDim = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  @action
  resetPainterContainerBox(rect: PBox) {
    this.painterContainerBox = rect;
  }

  @observable.struct orphanNodeInfo: OrphanNodeInfo = defaultOrphanNodeInfo;

  @action
  showOrphanNode(orphanNodeInfo: OrphanNodeInfo) {
    this.orphanNodeInfo = orphanNodeInfo;
  }

  @action
  hideOrphanNode() {
    this.orphanNodeInfo = defaultOrphanNodeInfo;
  }

  @action
  resetPainterScrollTop(scrollTop: number) {
    this.painterScrollTop = scrollTop;
  }

  // 全屏xy转化为painter内部xy
  clientXYToPainterXY(x: number, y: number) {
    return {
      x: x - this.painterDim.x,
      y: y - (this.painterDim.y - this.painterScrollTop)
    };
  }
}
