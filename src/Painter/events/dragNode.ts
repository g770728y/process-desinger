import {
  map,
  filter,
  switchMap,
  throttleTime,
  takeWhile,
  take,
  merge,
  concat
} from 'rxjs/operators';
import {
  PNode,
  PEdge,
  PPosition,
  PAnchorType,
  ElementType,
  SnappableGrid
} from '../../index.type';
import {
  isDraggableDataType,
  NodeSnapThreshold,
  ShowNodeSnapThreshold
} from '../../global';
import { Observable, Subscription, of } from 'rxjs';
import UIStore from '../../store/UIStore';
import DesignDataStore from '../../store/DesignDataStore';
import { extractNodeAttrs, findClosestSnappableInfo } from './helper';
import { getSnappableGrid, getNodeSize } from '../../helper';

interface EventData {
  x0?: number;
  y0?: number;
  x?: number;
  y?: number;
  // 被移动物体的原始坐标
  pos0?: PPosition;
  dataType?: string;
  dataId?: number;
  dataHost?: { type: string; id: number; p: PAnchorType };
  element?: PNode | PEdge;
  // 由node位置决定的 snap 网格
  snappableGrid?: SnappableGrid;
  mouseup?: boolean;
  finished?: boolean;
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
        pos0: dataStore!.getElementPos(element!),
        snappableGrid: getSnappableGrid(dataStore!.nodes, element.id)
      };
    }),
    switchMap((attrs: EventData) =>
      mousemove$.pipe(
        map((e: MouseEvent) => ({
          ...attrs,
          ...uiStore!.clientXYToPainterXY(e.clientX, e.clientY)
        })),
        throttleTime(30),
        merge(
          mouseup$.pipe(
            map((e: MouseEvent) => ({
              ...attrs,
              ...uiStore!.clientXYToPainterXY(e.clientX, e.clientY),
              mouseup: true
            })),
            take(1),
            concat(of({ finished: true }))
          )
        ),
        takeWhile((attrs: EventData) => !attrs.finished)
      )
    )
  );

  const dragNode$ = drag$.subscribe((attrs: EventData) => {
    const { x0, x, y, y0, element, pos0, snappableGrid } = attrs;
    const newPos = {
      cx: pos0!.cx + (x! - x0!),
      cy: pos0!.cy + (y! - y0!)
    };

    // 移动到 当前鼠标位置时 , node 的盒模型
    const { w, h } = getNodeSize(element as PNode);
    const newbox = {
      x: newPos.cx - w / 2,
      y: newPos.cy - h / 2,
      w,
      h
    };

    // 显示辅助线
    const snapInfo = findClosestSnappableInfo(
      snappableGrid!,
      newbox,
      ShowNodeSnapThreshold
    );
    const sg = {
      xs: snapInfo.xs.map(([x, dx]) => x),
      ys: snapInfo.ys.map(([y, dy]) => y)
    };
    dataStore!.showSnappableGrid(sg);

    // 尝试捕捉
    const _dx = snapInfo.xs.length <= 0 ? 0 : snapInfo.xs[0][2];
    const _dy = snapInfo.ys.length <= 0 ? 0 : snapInfo.ys[0][2];
    const dx = Math.abs(_dx) <= NodeSnapThreshold ? _dx : 0;
    const dy = Math.abs(_dy) <= NodeSnapThreshold ? _dy : 0;

    dataStore!.moveNode({
      element: element!,
      newPos: {
        cx: newPos.cx + dx,
        cy: newPos.cy + dy
      }
    });

    if (attrs.mouseup) {
      dataStore!.hideSnappableGrid();
    }
  });

  return dragNode$;
}
