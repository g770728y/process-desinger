import React from 'react';
import styles from './styles.css';
import { DesignerProps } from './index.type';
import NodeTemplatesPanel from './NodeTemplatesPanel';
import Painter from './Painter';
import { configure } from 'mobx';
import { Provider, observer } from 'mobx-react';
import UIStore from './store/UIStore';
import ConfigStore from './store/ConfigStore';
import DesignDataStore from './store/DesignDataStore';
import OrphanNode from './NodeView/OrphanNode';

configure({
  enforceActions: 'observed'
});

@observer
class ProcessDesigner extends React.Component<DesignerProps, {}> {
  uiStore: UIStore;
  configStore: ConfigStore;
  designDataStore: DesignDataStore;

  painterWrapperRef = React.createRef<HTMLDivElement>();

  constructor(props: DesignerProps) {
    super(props);
    this.uiStore = new UIStore();

    const { config, data } = this.props;

    this.configStore = new ConfigStore(config);

    this.designDataStore = new DesignDataStore(data, this.configStore);

    this.onResize = this.onResize.bind(this);

    this.handlePainterWrapperScroll = this.handlePainterWrapperScroll.bind(
      this
    );
  }

  onResize() {
    this.uiStore.resetWindowDim();
  }

  render() {
    return (
      <Provider
        uiStore={this.uiStore}
        configStore={this.configStore}
        dataStore={this.designDataStore}
      >
        <div className={styles['pd-container']}>
          <NodeTemplatesPanel />
          <div
            ref={this.painterWrapperRef}
            className={styles['pd-painter-wrapper']}
            style={{
              width: this.uiStore.painterDim.w,
              height: this.uiStore.painterDim.h
            }}
          >
            <Painter />
          </div>
          <OrphanNode />
        </div>
      </Provider>
    );
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    const painterWrpperEl = this.painterWrapperRef.current!;
    painterWrpperEl.addEventListener('scroll', this.handlePainterWrapperScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    const painterWrpperEl = this.painterWrapperRef.current!;
    painterWrpperEl.removeEventListener(
      'scroll',
      this.handlePainterWrapperScroll
    );
  }

  handlePainterWrapperScroll() {
    const painterWrapperEl = this.painterWrapperRef.current!;
    this.uiStore.resetPainterScrollTop(painterWrapperEl.scrollTop);
  }
}

export default ProcessDesigner;
