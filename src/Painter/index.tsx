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

  componentDidMount() {
    const { uiStore, dataStore } = this.props;
    const el = this.ref.current!;
    const mousedown$ = fromEvent(el, 'mousedown');
    const mousemove$ = fromEvent(document.body, 'mousemove');
    const mouseup$ = fromEvent(document.body, 'mouseup');

    this.dragNode$ = dragNode(
      mousedown$,
      mousemove$,
      mouseup$,
      uiStore!,
      dataStore!
    );
  }

  componentWillUnmount() {
    this.dragNode$.unsubscribe();
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
        {background !== 'transparent' && (
          <rect
            className={SvgBackgroundRectClass}
            width="100%"
            height="100%"
            fill={background}
          />
        )}
        {vnodes}
        {vedges}
        {voedges}
      </>,
      this.ref
    );
  }
}

interface MouseEventData {
  x0?: number;
  y0?: number;
  x?: number;
  y?: number;
  dataType?: string;
  dataId?: number;
  element?: PNode | PEdge;
  elementPos0?: PPosition;
}
