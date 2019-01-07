import * as React from 'react';
import { inject, observer } from 'mobx-react';
import DesignDataStore from '../store/DesignDataStore';
import { getNodeSize } from '../helper';
import { Subscription, fromEvent } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import UIStore from '../store/UIStore';
import { PPosition, PNodeId } from '../index.type';

type IProps = {
  dataStore?: DesignDataStore;
  uiStore?: UIStore;
};

interface EventData {
  x0: number;
  y0: number;
  pos0: [PNodeId, PPosition][];
  x?: number;
  y?: number;
}

@inject(({ dataStore, uiStore }) => ({ dataStore, uiStore }))
@observer
class EntiretyMovableHandler extends React.Component<IProps> {
  ref = React.createRef<SVGGElement>();

  dragSubs: Subscription;

  componentDidMount() {
    const { uiStore, dataStore } = this.props;
    const el = this.ref.current!;
    const mousedown$ = fromEvent(el, 'mousedown');
    const mousemove$ = fromEvent(document.body, 'mousemove');
    const mouseup$ = fromEvent(document.body, 'mouseup');

    mousedown$
      .pipe(
        map((e: MouseEvent) => {
          const { x: x0, y: y0 } = uiStore!.clientXYToPainterXY(
            e.clientX,
            e.clientY
          );
          return {
            x0,
            y0,
            pos0: dataStore!.nodes.map(node => [
              node.id as PNodeId,
              { cx: node.dim!.cx, cy: node.dim!.cy }
            ])
          };
        }),
        switchMap((attrs: EventData) =>
          mousemove$.pipe(
            map((e: MouseEvent) => ({
              ...attrs,
              ...uiStore!.clientXYToPainterXY(e.clientX, e.clientY)
            })),
            takeUntil(mouseup$)
          )
        )
      )
      .subscribe((attrs: EventData) => {
        const { x0, y0, x, y, pos0 } = attrs;
        const dx = x! - x0;
        dataStore!.moveAllNodes(pos0, dx, 0);
      });
  }

  componentWillUnmount() {}

  render() {
    const { dataStore } = this.props;
    const { cx: cxStart, cy: cyStart } = dataStore!.startNode.dim!;
    const xyStart = { x1: 0, y1: 0, x2: 0, y2: 60 };
    const lineStartBg = getLineBg(xyStart);

    const lineStart = getLine(xyStart);

    let lineEndBg, lineEnd;
    if (dataStore!.endNode) {
      const { cx: cxEnd, cy: cyEnd } = dataStore!.endNode.dim!;
      const { w: wEnd, h: hEnd } = getNodeSize(dataStore!.endNode);
      const xyEnd = {
        x1: cxEnd - cxStart,
        y1: cyEnd + hEnd + 50,
        x2: cxEnd - cxStart,
        y2: cyEnd + hEnd + 800
      };
      lineEndBg = getLineBg(xyEnd);
      lineEnd = getLine(xyEnd);
    } else {
      const { w: wStart, h: hStart } = getNodeSize(dataStore!.startNode);
      const xyEnd = {
        x1: 0,
        y1: cyStart + hStart + 500,
        x2: 0,
        y2: cyStart + hStart + 800
      };
      lineEndBg = getLineBg(xyEnd);
      lineEnd = getLine(xyEnd);
    }

    return (
      <g transform={`translate(${cxStart}, ${0})`} ref={this.ref}>
        {lineStartBg}
        {lineStart}
        {lineEndBg}
        {lineEnd}
      </g>
    );
  }
}

export default EntiretyMovableHandler;

function getLineBg(xy: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line
      {...xy}
      strokeWidth={10}
      stroke={'transparent'}
      style={{ cursor: 'ew-resize' }}
    />
  );
}

function getLine(xy: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line
      {...xy}
      strokeWidth={2}
      stroke={'#cccccc'}
      strokeDasharray={'10 5 5 5'}
      style={{ pointerEvents: 'none' }}
    />
  );
}
