import * as React from 'react';
import { Observable, Subscription, of } from 'rxjs';
import {
  map,
  switchMap,
  throttleTime,
  merge,
  concat,
  take,
  takeWhile
} from 'rxjs/operators';
import UIStore from '../../store/UIStore';
import DesignDataStore from '../../store/DesignDataStore';
import { PNodeCandidate, PNode, SnappableGrid } from '../../index.type';
import {
  getNodeInstance,
  getNodeSize,
  isBoxInRange,
  getSnappableGrid
} from '../../helper';
import { ShowNodeSnapThreshold, NodeSnapThreshold } from '../../global';
import { trySnap } from './helper';

interface EventData {
  x0?: number;
  y0?: number;
  x?: number;
  y?: number;
  // 由node位置决定的 snap 网格
  snappableGrid?: SnappableGrid;
  mouseup?: boolean;
  finished?: boolean;
}

export function dragNodeCandidate(
  mousedown$: Observable<Event>,
  mousemove$: Observable<Event>,
  mouseup$: Observable<Event>,
  uiStore: UIStore,
  dataStore: DesignDataStore,
  nodeCandidate: PNodeCandidate
): Subscription {
  const drag$ = mousedown$.pipe(
    map((e: MouseEvent) => ({
      x0: e.clientX,
      y0: e.clientY,
      end: false,

      snappableGrid: getSnappableGrid(dataStore!.nodes)
    })),
    switchMap((attrs: EventData) =>
      mousemove$.pipe(
        map((e: MouseEvent) => ({ ...attrs, x: e.clientX, y: e.clientY })),
        throttleTime(30),
        merge(
          mouseup$.pipe(
            map((e: MouseEvent) => ({
              ...attrs,
              x: e.clientX,
              y: e.clientY,
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

  const dragNodeCandidate$ = drag$.subscribe((attrs: EventData) => {
    const { x: cx, y: cy } = uiStore!.clientXYToPainterXY(attrs.x!, attrs.y!);
    const node = getNodeInstance(nodeCandidate, { cx, cy });
    const { w, h } = getNodeSize(node);
    const newbox = {
      x: node.dim!.cx - w / 2,
      y: node.dim!.cy - h / 2,
      w,
      h
    };

    const [sg, dx, dy] = trySnap(
      attrs.snappableGrid!,
      newbox,
      ShowNodeSnapThreshold,
      NodeSnapThreshold
    );

    if (!attrs.mouseup) {
      dataStore!.showSnappableGrid(sg);
      const pcbox = uiStore!.painterContainerBox;
      uiStore.showOrphanNode({
        node: nodeCandidate as PNode,
        cx: attrs.x! + dx - pcbox.x,
        cy: attrs.y! + dy - pcbox.y
      });
    } else {
      dataStore.hideSnappableGrid();
      uiStore.hideOrphanNode();
      const { painterDim } = uiStore!;

      const floatingNode = getNodeInstance(nodeCandidate, {
        cx: attrs.x!,
        cy: attrs.y!
      });
      const { w, h } = getNodeSize(floatingNode);
      const nodeDim = {
        x: attrs.x! - w / 2 + dx,
        y: attrs.y! - h / 2 + dy,
        w,
        h
      };

      if (isBoxInRange(nodeDim, painterDim)) {
        dataStore!.addNode({
          ...node,
          dim: { ...node.dim!, cx: node.dim!.cx + dx, cy: node.dim!.cy + dy }
        });
      }
    }
  });

  return dragNodeCandidate$;
}
