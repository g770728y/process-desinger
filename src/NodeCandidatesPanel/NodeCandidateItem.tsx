import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { PNodeCandidate, PNode, OrphanNodeInfo } from '../index.type';
import { renderNodeCandidateToSvg } from '../helper';
import { fromEvent, Subscription } from 'rxjs';
import UIStore from '../store/UIStore';
import DesignDataStore from '../store/DesignDataStore';
import { dragNodeCandidate } from '../Painter/events/dragTemplateNode';
import styles from '../styles.css';
import ConfigStore from '../store/ConfigStore';

type IProps = {
  uiStore?: UIStore;
  dataStore?: DesignDataStore;
  configStore?: ConfigStore;
  nodeCandidate: PNodeCandidate;
};

@inject(({ uiStore, dataStore, configStore }) => ({
  uiStore,
  dataStore,
  configStore
}))
@observer
class NodeCandidateItem extends React.Component<IProps> {
  // ref = React.createRef<SVGSVGElement>();
  ref = React.createRef<HTMLDivElement>();

  dragSubs: Subscription;

  constructor(props: IProps) {
    super(props);
    this.showOrphanNode = this.showOrphanNode.bind(this);
    this.hideOrphanNode = this.hideOrphanNode.bind(this);
  }

  showOrphanNode(orphanNodeInfo: OrphanNodeInfo) {
    this.props.uiStore!.showOrphanNode(orphanNodeInfo);
  }

  hideOrphanNode() {
    this.props.uiStore!.hideOrphanNode();
  }

  componentDidMount() {
    if (this.props.configStore!.mode === 'update') return;

    const { uiStore, dataStore, nodeCandidate } = this.props;
    const el = this.ref.current!;
    const body = document.body;
    const mousedown$ = fromEvent(el, 'mousedown');
    const mousemove$ = fromEvent(body, 'mousemove');
    const mouseup$ = fromEvent(body, 'mouseup');

    this.dragSubs = dragNodeCandidate(
      mousedown$,
      mousemove$,
      mouseup$,
      uiStore!,
      dataStore!,
      nodeCandidate
    );
  }

  componnetWillUnmount() {
    if (this.props.configStore!.mode === 'update') return;

    this.dragSubs.unsubscribe();
  }

  render() {
    const { nodeCandidate } = this.props;
    const { id, label } = nodeCandidate;

    // let svg: React.ReactNode = renderNodeCandidateToSvg(nodeCandidate, this.ref);

    return (
      <div className={styles['pd-node-candidate-item']} ref={this.ref} key={id}>
        {label}
      </div>
    );
  }
}

export default NodeCandidateItem;
