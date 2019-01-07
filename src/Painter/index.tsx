import * as React from 'react';
import { inject, observer } from 'mobx-react';
import UIStore from '../store/UIStore';
import { PNode, PEdge, PPosition, OrphanEdge } from '../index.type';
import { DefaultCanvasHeight, SvgBackgroundRectClass } from '../global';
import { EdgeView } from '../EdgeView';
import Defs from './defs';
import DesignDataStore from '../store/DesignDataStore';
import ConfigStore from '../store/ConfigStore';
import { wrapSvg, renderNode } from '../helper';
import { fromEvent, Subscription } from 'rxjs';
import { dragNode } from './events/dragNode';
import OrphanEdgeView from '../EdgeView/OrphanEdgeView';
import { dragGrip } from './events/dragGrip';
import { map } from 'rxjs/operators';
import { isHotkey, isKeyHotkey, isCodeHotkey } from 'is-hotkey';
import { keydown } from './events/keys';
import SnappableGridView from '../snap/SnappableGridView';

type IProps = {
  dataStore?: DesignDataStore;
  uiStore?: UIStore;
  configStore?: ConfigStore;
};

@inject(({ uiStore, configStore, dataStore }) => {
  return { uiStore, configStore, dataStore };
})
@observer
export default class Painter extends React.Component<IProps> {
  ref = React.createRef<SVGSVGElement>();

  dragNode$: Subscription;
  dragGrip$: Subscription;
  keydown$: Subscription;

  getNodesView(nodes: PNode[]) {
    return nodes.map(node => {
      return renderNode(node);
    });
  }

  getEdgesView(edges: PEdge[]) {
    return edges.map(edge => {
      return <EdgeView key={edge.id} edge={edge} />;
    });
  }

  getOrphanEdgesView(oedges: OrphanEdge[]) {
    return (oedges || []).map(oedge => {
      return <OrphanEdgeView key={oedge.id} oedge={oedge} />;
    });
  }

  handleBackgroundClick = () => {
    const { dataStore } = this.props;
    dataStore!.unselectAll();
  };

  componentDidMount() {
    const { uiStore, dataStore } = this.props;
    const el = this.ref.current!;
    const mousedown$ = fromEvent(el, 'mousedown');
    const mousemove$ = fromEvent(document.body, 'mousemove');
    const mouseup$ = fromEvent(document.body, 'mouseup');
    const keydown$ = fromEvent(document.body, 'keydown');

    this.keydown$ = keydown(keydown$, dataStore!);

    this.dragNode$ = dragNode(
      mousedown$,
      mousemove$,
      mouseup$,
      uiStore!,
      dataStore!
    );

    this.dragGrip$ = dragGrip(
      mousedown$,
      mousemove$,
      mouseup$,
      uiStore!,
      dataStore!
    );
  }

  componentWillUnmount() {
    this.dragNode$.unsubscribe();
    this.dragGrip$.unsubscribe();
    this.keydown$.unsubscribe();
  }

  render() {
    const { uiStore, dataStore, configStore } = this.props;
    const { painterDim } = uiStore!;
    const { w: width, h: height } = painterDim;
    const { nodes, edges, orphanEdges } = dataStore!;

    const { canvas } = configStore!;
    const background = canvas
      ? canvas.background || 'transparent'
      : 'transparent';

    const vnodes = this.getNodesView(nodes);
    const vedges = this.getEdgesView(edges);
    const voedges = this.getOrphanEdgesView(orphanEdges);

    return wrapSvg(
      width,
      DefaultCanvasHeight,
      <>
        <Defs />
        <rect
          className={SvgBackgroundRectClass}
          width="100%"
          height="100%"
          fill={background}
          onClick={this.handleBackgroundClick}
        />
        {vnodes}
        {vedges}
        {voedges}
        <SnappableGridView />
      </>,
      this.ref
    );
  }
}
