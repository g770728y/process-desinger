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
import { PNodeTemplate, PNode, SnappableGrid } from '../../index.type';
import { getNodeInstance, getNodeSize, isBoxInRange } from '../../helper';

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

export function dragTemplateNode(
  mousedown$: Observable<Event>,
  mousemove$: Observable<Event>,
  mouseup$: Observable<Event>,
  uiStore: UIStore,
  dataStore: DesignDataStore,
  nodeTemplate: PNodeTemplate
): Subscription {
  const drag$ = mousedown$.pipe(
    map((e: MouseEvent) => ({ x0: e.clientX, y0: e.clientY, end: false })),
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

  const dragTemplateNode$ = drag$.subscribe((attrs: EventData) => {
    if (!attrs.mouseup) {
      uiStore.showOrphanNode({
        node: nodeTemplate as PNode,
        cx: attrs.x!,
        cy: attrs.y!
      });
    } else {
      uiStore.hideOrphanNode();
      const { painterDim } = uiStore!;

      const floatingNode = getNodeInstance(nodeTemplate, {
        cx: attrs.x!,
        cy: attrs.y!
      });
      const { w, h } = getNodeSize(floatingNode);
      const nodeDim = {
        x: attrs.x! - w / 2,
        y: attrs.y! - h / 2,
        w,
        h
      };

      if (isBoxInRange(nodeDim, painterDim)) {
        const { x: cx, y: cy } = uiStore!.clientXYToPainterXY(
          attrs.x!,
          attrs.y!
        );
        const node = getNodeInstance(nodeTemplate, { cx, cy });
        dataStore!.addNode(node);
      }
    }
  });

  return dragTemplateNode$;
}
