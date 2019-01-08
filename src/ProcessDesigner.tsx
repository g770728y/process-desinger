import React from 'react';
import styles from './styles.css';
import { DesignerProps, DesignerController } from './index.type';
import NodeTemplatesPanel from './NodeTemplatesPanel';
import Painter from './Painter';
import { configure } from 'mobx';
import { Provider, observer } from 'mobx-react';
import UIStore from './store/UIStore';
import ConfigStore from './store/ConfigStore';
import DesignDataStore from './store/DesignDataStore';
import OrphanNode from './NodeView/OrphanNode';
import { initConfig } from './global';

configure({
  enforceActions: 'observed'
});

@observer
class ProcessDesigner extends React.Component<DesignerProps, {}> {
  uiStore: UIStore;
  configStore: ConfigStore;
  dataStore: DesignDataStore;

  painterContainerRef = React.createRef<HTMLDivElement>();
  painterWrapperRef = React.createRef<HTMLDivElement>();

  constructor(props: DesignerProps) {
    super(props);
    this.uiStore = new UIStore();

    const { config, data, events } = this.props;

    this.configStore = new ConfigStore({ ...initConfig, ...config });

    this.dataStore = new DesignDataStore(data, this.configStore, events);

    this.onResize = this.onResize.bind(this);

    this.handlePainterWrapperScroll = this.handlePainterWrapperScroll.bind(
      this
    );
  }

  onResize() {
    this.uiStore.resetWindowDim();
    const {
      left: x,
      top: y,
      width: w,
      height: h
    } = this.painterContainerRef.current!.getBoundingClientRect();
    this.uiStore.resetPainterContainerBox({ x, y, w, h });
  }

  render() {
    return (
      <Provider
        uiStore={this.uiStore}
        configStore={this.configStore}
        dataStore={this.dataStore}
      >
        <div ref={this.painterContainerRef} className={styles['pd-container']}>
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
    this.onResize();
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

  getController(): DesignerController {
    const ds = this.dataStore!;
    return {
      rearrange: ds.rearrange.bind(ds),
      getAllAssoc: () =>
        ds.edges.map(edge => ({
          fromNodeId: edge.from.id,
          toNodeId: edge.to.id
        })),
      markNode: ds.patchNode.bind(ds)
    };
  }
}

export default ProcessDesigner;
