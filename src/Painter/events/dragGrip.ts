import {
  PAnchorType,
  PNode,
  PEdge,
  PPosition,
  PEdgeId,
  ElementType,
  PAnchor,
  Shape
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
import { MinValidEdgeLength } from '../../global';
import { xyOfRectAnchor, xyOfCircleAnchor } from '../../helper';

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
        // 难点
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
    console.log('attrs:', JSON.stringify(attrs));
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
        _tryCreateEdge(attrs, dataStore!);
      } else {
        // 鼠标移动中, 画出新的孤立边
        _drawOrphanEdge(attrs, dataStore!);
      }
    } else if (dataHost!.type === ElementType.Edge) {
      if (attrs.mouseup) {
        // 鼠标抬起
        dataStore!.showEdge(dataHost!.id);
        _tryUpdateEdge(attrs, dataStore!);
      } else {
        // 鼠标移动中, 隐藏老edge, 显示孤立边
        dataStore!.hideEdge(dataHost!.id);
        _drawOrphanEdge(attrs, dataStore!);
      }
    }
  });

  return dragGrip$;
}

////////////////////////////////////////  helper /////////////////////////////////////////////////////
// 鼠标移动中, 画出新的孤立边
function _drawOrphanEdge(attrs: EventData, dataStore: DesignDataStore) {
  const { orphanEdgeId, x0, y0, x, y, host, pos0, dataHost } = attrs;
  let newX = x,
    newY = y;

  const snappedAnchor = dataStore!.findSnappedAnchor(x!, y!);
  if (snappedAnchor) {
    newX = snappedAnchor.xy.cx;
    newY = snappedAnchor.xy.cy;
  }

  const { from, to } =
    dataHost!.type === ElementType.Node ? _edgeFromNode() : _edgeFromEdge();

  dataStore!.upsetOrphanEdge({
    id: orphanEdgeId!,
    type: ElementType.OrphanEdge,
    from,
    to
  });

  function _edgeFromNode() {
    const from = { id: dataHost!.id, anchor: dataHost!.anchor };
    const to = { cx: newX!, cy: newY! };
    return { from, to };
  }

  function _edgeFromEdge() {
    if (dataHost!.anchor === '0') {
      return { from: { cx: newX!, cy: newY! }, to: (host! as PEdge).to };
    } else {
      return { from: (host! as PEdge).from, to: { cx: newX!, cy: newY! } };
    }
  }
}

// 优先定位 能被snap 的grip
// 然后 根据目标点所在的node, 来确定node的哪个grip距起点最近
// 总之 尽量确定一个终点
function _findTargetAnchor(attrs: EventData, dataStore: DesignDataStore) {
  const { orphanEdgeId, x0, y0, x, y, host, pos0, dataHost } = attrs;
  const snappedAnchor = dataStore!.findSnappedAnchor(x!, y!);
  let closestAnchorOnNode: PAnchor | undefined;
  if (!snappedAnchor) {
    const node = dataStore!.xyInWhichNode(x!, y!);
    if (node) {
      closestAnchorOnNode = _findClosestAnchorOnNode(node, {
        x: x!,
        y: y!
      });
    }
  }

  return snappedAnchor || closestAnchorOnNode;
}

// 创建新的edge
function _tryCreateEdge(attrs: EventData, dataStore: DesignDataStore) {
  const { orphanEdgeId, x0, y0, x, y, host, pos0, dataHost } = attrs;
  const targetAnchor = _findTargetAnchor(attrs, dataStore);

  dataStore!.delOrphanEdge(orphanEdgeId!); // 最小有效距离

  if (targetAnchor) {
    //  检验孤立边是否落在node anchor上,如果是,则删除孤立边, 生成正式边
    dataStore!.addEdge({
      type: ElementType.Edge,
      from: {
        id: dataHost!.id,
        anchor: dataHost!.anchor
      },
      to: {
        id: targetAnchor.host.id,
        anchor: targetAnchor.anchor
      }
    });
  } else {
    // if (distance({ x: x!, y: y! }, { x: x0!, y: y0! }) < MinEdgeLength) {
    //   dataStore!.delOrphanEdge(orphanEdgeId!); // 最小有效距离
    // } else {
    //   // 无动作(当然, 会多出一个孤立边)
    // }
  }
}

// 修改Edge
function _tryUpdateEdge(attrs: EventData, dataStore: DesignDataStore) {
  const { orphanEdgeId, x0, y0, x, y, host, pos0, dataHost } = attrs;
  const targetAnchor = _findTargetAnchor(attrs, dataStore);

  dataStore!.delOrphanEdge(orphanEdgeId!);

  if (targetAnchor) {
    //  检验孤立边是否落在node anchor上,如果是,则删除孤立边, 生成正式边

    const fromOrTo = {
      id: targetAnchor.host.id,
      anchor: targetAnchor.anchor
    };

    if (dataHost!.anchor === '0') {
      dataStore!.patchEdge({
        id: dataHost!.id,
        from: fromOrTo
      });
    } else {
      dataStore!.patchEdge({
        id: dataHost!.id,
        to: fromOrTo
      });
    }
  } else {
    // if (distance({ x: x!, y: y! }, { x: x0!, y: y0! }) < MinEdgeLength) {
    //   dataStore!.delOrphanEdge(orphanEdgeId!); // 最小有效距离
    // } else {
    //   // 无动作(当然, 会多出一个孤立边)
    // }
  }
}

// 找到距xy最近的node上的grip
function _findClosestAnchorOnNode(
  node: PNode,
  xy: { x: number; y: number }
): PAnchor {
  const virtualAnchor = {
    host: node,
    anchor: 'lc' as PAnchorType,
    xy: { cx: 100000000, cy: 1000000000 }
  };

  return ['lc', 'tc', 'rc', 'bc'].reduce((acc: PAnchor, p) => {
    const prevDistance = distance(xy, { x: acc.xy.cx, y: acc.xy.cy });

    const { cx: x1, cy: y1 } =
      node.shape === Shape.Rect
        ? xyOfRectAnchor(node.dim!, p as PAnchorType)
        : xyOfCircleAnchor(node.dim!, p as PAnchorType);
    const currDistance = distance(xy, { x: x1, y: y1 });
    if (currDistance < prevDistance) {
      return { host: node, anchor: p as PAnchorType, xy: { cx: x1, cy: y1 } };
    } else {
      return acc;
    }
  }, virtualAnchor);
}
