import { PAnchorType, PNode, PEdge, PPosition } from '../../index.type';
import { Observable, Subscription } from 'rxjs';
import UIStore from '../../store/UIStore';
import DesignDataStore from '../../store/DesignDataStore';
import {
  map,
  filter,
  switchMap,
  throttleTime,
  takeUntil
} from 'rxjs/operators';
import { GripType, DataNodeType, DataEdgeType } from '../../global';
import { extractGripAttrs } from './helper';

interface EventData {
  x0?: number;
  y0?: number;
  x?: number;
  y?: number;
  pos0?: PPosition;
  dataType?: string;
  dataHost?: { type: string; id: number; anchor: PAnchorType };
  host?: PNode | PEdge;
}

export function dragGrip(
  mousedown$: Observable<Event>,
  mousemove$: Observable<Event>,
  mouseup$: Observable<Event>,
  uiStore: UIStore,
  dataStore: DesignDataStore
): Subscription {
  const drag$ = mousedown$.pipe(
    map((e: MouseEvent) => {
      const { x: x0, y: y0 } = uiStore!.clientXYToPainterXY(
        e.clientX,
        e.clientY
      );
      return { ...extractGripAttrs(e), x0, y0 };
    }),
    filter((attrs: EventData) => attrs.dataType === GripType),
    map((attrs: EventData) => {
      const dataHost = attrs.dataHost;
      const host = dataStore!.getElement(dataHost!.type, dataHost!.id);
      return {
        ...attrs,
        host,
        pos0: dataStore!.anchorXY(host!, dataHost!.type, dataHost!.anchor)
      };
    }),
    switchMap((attrs: EventData) =>
      mousemove$.pipe(
        map((e: MouseEvent) => ({
          ...attrs,
          ...uiStore!.clientXYToPainterXY(e.clientX, e.clientY)
        })),
        throttleTime(30),
        takeUntil(mouseup$)
      )
    )
  );

  const dragGrip$ = drag$.subscribe((attrs: EventData) => {
    const { x0, y0, x, y, host, pos0, dataHost } = attrs;
    if (dataHost!.type === DataNodeType) {
      // 画新边
    } else if (dataHost!.type === DataEdgeType) {
      // 移动旧边当前grip
    }
  });

  return dragGrip$;
}
