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
    const node = dataStore!.startNode;
    const { cx, cy } = node.dim!;
    const { w, h } = getNodeSize(node);
    const xy = { x1: 0, y0: 0, x2: 0, y2: 60 };

    return (
      <g transform={`translate(${cx}, ${0})`} ref={this.ref}>
        <line
          {...xy}
          strokeWidth={10}
          stroke={'transparent'}
          style={{ cursor: 'ew-resize' }}
        />

        <line
          {...xy}
          strokeWidth={2}
          stroke={'#666666'}
          strokeDasharray={'10 5 5 5'}
          style={{ pointerEvents: 'none' }}
        />
      </g>
    );
  }
}

export default EntiretyMovableHandler;
