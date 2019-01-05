import * as React from 'react';
import { inject, observer } from 'mobx-react';
import UIStore from '../store/UIStore';
import { PNode, PEdge, PPosition } from '../index.type';
import {
  DefaultCanvasHeight,
  SvgBackgroundRectClass,
  DataNodeType,
  isDataType,
  isDraggableDataType
} from '../global';
import EdgeView from '../EdgeView';
import Defs from './defs';
import DesignDataStore from '../store/DesignDataStore';
import ConfigStore from '../store/ConfigStore';
import { wrapSvg, renderNode, extractDataAttrs } from '../helper';
import { fromEvent, Subscription } from 'rxjs';
import {
  filter,
  map,
  throttleTime,
  switchMap,
  takeUntil
} from 'rxjs/operators';
import { dragNode } from './events/dragNode';

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
    const { nodes, edges } = dataStore!;

    const { canvas } = configStore!;
    const background = canvas
      ? canvas.background || 'transparent'
      : 'transparent';

    const vnodes = this.getNodesView(nodes);
    const vedges = this.getEdgesView(edges);

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
