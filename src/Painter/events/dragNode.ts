import {
  map,
  filter,
  switchMap,
  throttleTime,
  takeUntil
} from 'rxjs/operators';
import {
  PNode,
  PEdge,
  PPosition,
  PAnchorType,
  ElementType
} from '../../index.type';
import { isDraggableDataType } from '../../global';
import { Observable, Subscription } from 'rxjs';
import UIStore from '../../store/UIStore';
import DesignDataStore from '../../store/DesignDataStore';
import { extractNodeAttrs } from './helper';

interface EventData {
  x0?: number;
  y0?: number;
  x?: number;
  y?: number;
  pos0?: PPosition;
  dataType?: string;
  dataId?: number;
  dataHost?: { type: string; id: number; p: PAnchorType };
  element?: PNode | PEdge;
}

export function dragNode(
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
      return {
        ...extractNodeAttrs(e),
        x0,
        y0
      };
    }),
    filter((attrs: EventData) => attrs.dataType === ElementType.Node),
    map((attrs: EventData) => {
      const element = dataStore!.getElement(attrs.dataType!, attrs.dataId!);
      return {
        ...attrs,
        element,
        pos0: dataStore!.getElementPos(element!)
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

  const dragNode$ = drag$.subscribe((attrs: EventData) => {
    const { x0, x, y, y0, dataType, dataId, element, pos0 } = attrs;
    dataStore!.moveNode({
      element: element!,
      newPos: {
        cx: pos0!.cx + (x! - x0!),
        cy: pos0!.cy + (y! - y0!)
      }
    });
  });

  return dragNode$;
}
