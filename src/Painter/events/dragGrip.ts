import {
  PAnchorType,
  PNode,
  PEdge,
  PPosition,
  PEdgeId,
  ElementType
} from '../../index.type';
import { Observable, Subscription, of } from 'rxjs';
import UIStore from '../../store/UIStore';
import DesignDataStore from '../../store/DesignDataStore';
import {
  map,
  filter,
  switchMap,
  throttleTime,
  takeUntil,
  takeWhile,
  merge,
  mapTo,
  concat,
  take
} from 'rxjs/operators';
import { extractGripAttrs } from './helper';
import { distance } from '../../util';
import { MinEdgeLength } from '../../global';

interface EventData {
  x0?: number;
  y0?: number;
  x?: number;
  y?: number;
  orphanEdgeId?: PEdgeId;
  pos0?: PPosition;
  dataType?: string;
  dataHost?: { type: string; id: number; anchor: PAnchorType };
  host?: PNode | PEdge;
  mouseup?: boolean;
  finished?: boolean;
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
    filter((attrs: EventData) => attrs.dataType === ElementType.Grip),
    map((attrs: EventData) => {
      const dataHost = attrs.dataHost;
      const host = dataStore!.getElement(dataHost!.type, dataHost!.id);
      return {
        ...attrs,
        host,
        pos0: dataStore!.anchorXY(host!, dataHost!.anchor),
        orphanEdgeId: dataStore!.nextOrphanEdgeId()
      };
    }),
    switchMap((attrs: EventData) =>
      mousemove$.pipe(
        map((e: MouseEvent) => ({
          ...attrs,
          ...uiStore!.clientXYToPainterXY(e.clientX, e.clientY)
        })),
        throttleTime(30),
        // 如果直接takeUntil(mouseup$), 那么无论如何都无法获取mouseup
        // 所以在mouseup后增加一个finished, 然后takeWhile finished 就行了
        // https://stackoverflow.com/questions/43792349/how-to-get-value-from-stop-observable-in-takeuntil
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

  const dragGrip$ = drag$.subscribe((attrs: EventData) => {
    const { orphanEdgeId, x0, y0, x, y, host, pos0, dataHost } = attrs;
    // 捕捉并修正x,y
    let newX = x,
      newY = y;
    const snappedAnchor = dataStore!.findSnappedAnchor(x!, y!);
    if (snappedAnchor) {
      newX = snappedAnchor.xy.cx;
      newY = snappedAnchor.xy.cy;
    }

    if (dataHost!.type === ElementType.Node) {
      if (attrs.mouseup) {
        // 鼠标抬起
        if (snappedAnchor) {
          //  检验孤立边是否落在node anchor上,如果是,则删除孤立边, 生成正式边
          dataStore!.delOrphanEdge(orphanEdgeId!);
          dataStore!.addEdge({
            type: ElementType.Edge,
            from: {
              id: dataHost!.id,
              anchor: dataHost!.anchor
            },
            to: {
              id: snappedAnchor.host.id,
              anchor: snappedAnchor.anchor
            }
          });
        } else {
          if (distance({ x: x!, y: y! }, { x: x0!, y: y0! }) < MinEdgeLength) {
            // 最小有效距离
            dataStore!.delOrphanEdge(orphanEdgeId!);
          } else {
            // 无动作(当然, 会多出一个孤立边)
          }
        }
      } else {
        // 鼠标移动中, 画出新的孤立边
        dataStore!.upsetOrphanEdge({
          id: orphanEdgeId!,
          type: ElementType.OrphanEdge,
          from: { cx: pos0!.cx, cy: pos0!.cy },
          to: { cx: newX!, cy: newY! }
        });
      }
    } else if (dataHost!.type === ElementType.Edge) {
      // 移动旧边当前grip
    }
  });

  return dragGrip$;
}
