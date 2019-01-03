import { observable, action, computed } from 'mobx';
import { NodeTemplatesPanelWidth } from '../global';

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
}
