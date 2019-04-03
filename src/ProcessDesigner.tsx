import React from 'react';
import styles from './styles.css';
import {
  DesignerProps,
  DesignerController,
  PNodeCandidate
} from './index.type';
import NodeCandidatesPanel from './NodeCandidatesPanel';
import Painter from './Painter';
import { configure, toJS } from 'mobx';
import { Provider, observer } from 'mobx-react';
import UIStore from './store/UIStore';
import ConfigStore from './store/ConfigStore';
import DesignDataStore from './store/DesignDataStore';
import OrphanNode from './NodeView/OrphanNode';
import { initConfig, initData } from './global';
import { isValidData, check, condenseNodeData } from './helper';
import Message from './Message';

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

    this.dataStore = new DesignDataStore(
      isValidData(data) ? data : initData,
      this.configStore,
      events
    );

    this.onResize = this.onResize.bind(this);

    this.handlePainterWrapperScroll = this.handlePainterWrapperScroll.bind(
      this
    );

    this.getController = this.getController.bind(this);
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
          <NodeCandidatesPanel />
          <div
            ref={this.painterWrapperRef}
            className={styles['pd-painter-wrapper']}
            style={{
              width: this.uiStore.painterDim.w,
              height: this.uiStore.painterDim.h
            }}
          >
            <Message />
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
    const configStore = this.configStore;

    return {
      rearrange: ds.rearrange.bind(ds),
      getAllAssoc: () =>
        ds.edges
          .map(edge => ({
            fromNodeId: edge.from.id,
            toNodeId: edge.to.id,
            flag: edge.flag
          }))
          .slice(0),
      check: () => check(ds),
      markNode: ds.patchNode.bind(ds),
      markEdge: ds.patchEdge.bind(ds),
      getDesignerData: () => ({
        nodes: toJS(ds.nodes).map(condenseNodeData),
        edges: toJS(ds.edges)
      }),
      resetNodeCandidates: (nodeCandidates: PNodeCandidate[]) =>
        configStore.resetNodeCandidates(nodeCandidates)
    };
  }
}

export default ProcessDesigner;
