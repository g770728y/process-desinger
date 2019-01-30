import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { PNodeTemplate, PNode, OrphanNodeInfo } from '../index.type';
import { renderNodeTemplateToSvg } from '../helper';
import { fromEvent, Subscription } from 'rxjs';
import UIStore from '../store/UIStore';
import DesignDataStore from '../store/DesignDataStore';
import { dragTemplateNode } from '../Painter/events/dragTemplateNode';
import styles from '../styles.css';

type IProps = {
  uiStore?: UIStore;
  dataStore?: DesignDataStore;
  nodeTemplate: PNodeTemplate;
};

@inject(({ uiStore, dataStore }) => ({ uiStore, dataStore }))
@observer
class NodeTemplateItem extends React.Component<IProps> {
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
    const { uiStore, dataStore, nodeTemplate } = this.props;
    const el = this.ref.current!;
    const body = document.body;
    const mousedown$ = fromEvent(el, 'mousedown');
    const mousemove$ = fromEvent(body, 'mousemove');
    const mouseup$ = fromEvent(body, 'mouseup');

    this.dragSubs = dragTemplateNode(
      mousedown$,
      mousemove$,
      mouseup$,
      uiStore!,
      dataStore!,
      nodeTemplate
    );
  }

  componnetWillUnmount() {
    this.dragSubs.unsubscribe();
  }

  render() {
    const { nodeTemplate } = this.props;
    const { id, label } = nodeTemplate;

    // let svg: React.ReactNode = renderNodeTemplateToSvg(nodeTemplate, this.ref);

    return (
      <div className={styles['pd-node-template-item']} ref={this.ref} key={id}>
        {label}
      </div>
    );
  }
}

export default NodeTemplateItem;
