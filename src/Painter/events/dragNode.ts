import {
  map,
  filter,
  switchMap,
  throttleTime,
  takeUntil
} from 'rxjs/operators';
import { extractDataAttrs } from '../../helper';
import { PNode, PEdge, PPosition } from '../../index.type';
import { isDraggableDataType } from '../../global';
import { Observable, Subscription } from 'rxjs';
import UIStore from '../../store/UIStore';
import DesignDataStore from '../../store/DesignDataStore';

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
        ...extractDataAttrs(e),
        x0,
        y0
      };
    }),
    filter((attrs: MouseEventData) => isDraggableDataType(attrs.dataType)),
    map((attrs: MouseEventData) => {
      const element = dataStore!.getElement(attrs.dataType!, attrs.dataId!);
      return {
        ...attrs,
        element,
        elementPos0: dataStore!.getElementPos(element!, attrs.dataType!)
      };
    }),
    switchMap((attrs: MouseEventData) =>
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

  const dragNode$ = drag$.subscribe((attrs: MouseEventData) => {
    const { x0, x, y, y0, dataType, dataId, element, elementPos0 } = attrs;
    dataStore!.move({
      dataType: dataType!,
      element: element!,
      newPos: {
        cx: elementPos0!.cx + (x! - x0!),
        cy: elementPos0!.cy + (y! - y0!)
      }
    });
  });

  return dragNode$;
}
