import * as React from 'react';
import {
  PEdge,
  ElementType,
  PPosition,
  PAnchor,
  PAnchorType
} from '../index.type';
import DesignDataStore from '../store/DesignDataStore';
import { distance, coordinateTransform } from '../util';
import { EdgeClass } from '../global';

export function getLineXY(fromXY: PPosition, toXY: PPosition) {
  return {
    x1: 0,
    y1: 0,
    x2: distance({ x: fromXY.cx, y: fromXY.cy }, { x: toXY.cx, y: toXY.cy }),
    y2: 0
  };
}

export function getRotate(fromXY: PPosition, toXY: PPosition) {
  return (Math.atan2(toXY.cy - fromXY.cy, toXY.cx - fromXY.cx) * 180) / Math.PI;
}

// 返回直线边
export function getLineEdge(
  edge: PEdge,
  dataStore: DesignDataStore,
  stroke: string
) {
  const { id, from, to, flag } = edge;
  const { fromXY, toXY } = dataStore!.getEdgeEndPoints(id);

  const xy = getLineXY(fromXY, toXY);

  const bgLayer = (
    <line
      {...xy}
      data-type={ElementType.Edge}
      data-id={id}
      strokeWidth={10}
      stroke="transparent"
    />
  );
  const layer = (
    <line
      className={EdgeClass}
      stroke={stroke}
      markerEnd={'url(#arrow)'}
      {...xy}
      style={{ pointerEvents: 'none' }}
    />
  );

  return { bgLayer, layer };
}

export function getArcEdge(
  edge: PEdge,
  dataStore: DesignDataStore,
  stroke: string
) {
  const { id, from, to, flag } = edge;
  const { fromXY, toXY } = dataStore!.getEdgeEndPoints(id);

  const xy = getLineXY(fromXY, toXY);

  const bgLayer = (
    <path
      d={`M${xy.x1},${xy.y1} Q${xy.x2 / 2},${xy.x2 / 5},${xy.x2},${xy.y2}`}
      data-type={ElementType.Edge}
      data-id={id}
      fill="none"
      strokeWidth={10}
      stroke="transparent"
    />
  );

  const layer = (
    <path
      d={`M${xy.x1},${xy.y1} Q${xy.x2 / 2},${xy.x2 / 5},${xy.x2},${xy.y2}`}
      markerEnd={'url(#arrow)'}
      fill="none"
      stroke={stroke}
    />
  );

  return { bgLayer, layer };
}

// 贝塞尔曲线
export function getBezierEdge(
  edge: PEdge,
  dataStore: DesignDataStore,
  stroke: string
) {
  const { id, from, to, flag } = edge;
  const { fromXY, toXY } = dataStore!.getEdgeEndPoints(id);

  const xy = getLineXY(fromXY, toXY);

  const _rotate = getRotate(fromXY, toXY);

  function cxByAnchor(_xy: PPosition, anchor: PAnchorType) {
    return anchor === 'tc' || anchor === 'bc'
      ? _xy.cx
      : anchor === 'lc'
      ? _xy.cx - 50
      : _xy.cx + 50;
  }

  function cyByAnchor(_xy: PPosition, anchor: PAnchorType) {
    return anchor === 'lc' || anchor === 'rc'
      ? _xy.cy
      : anchor === 'tc'
      ? _xy.cy - 50
      : _xy.cy + 50;
  }

  // 起始控制点
  const controlPoint1 = coordinateTransform(
    cxByAnchor(fromXY, from.anchor),
    cyByAnchor(fromXY, from.anchor),
    fromXY.cx,
    fromXY.cy,
    _rotate
  );
  // 终止控制点
  const controlPoint2 = coordinateTransform(
    cxByAnchor(toXY, to.anchor),
    cyByAnchor(toXY, to.anchor),
    fromXY.cx,
    fromXY.cy,
    _rotate
  );
  const bezier = (
    <path
      d={`M${xy.x1} ${xy.y1} C${controlPoint1.x} ${controlPoint1.y} ${
        controlPoint2.x
      } ${controlPoint2.y} ${xy.x2} ${xy.y2}`}
      markerEnd={'url(#arrow'}
      fill="none"
      stroke={stroke}
    />
  );
  const bgBezier = (
    <path
      d={`M${xy.x1} ${xy.y1} C${controlPoint1.x} ${controlPoint1.y} ${
        controlPoint2.x
      } ${controlPoint2.y} ${xy.x2} ${xy.y2}`}
      data-type={ElementType.Edge}
      data-id={id}
      fill="none"
      strokeWidth={10}
      stroke="transparent"
    />
  );

  return { bgLayer: bgBezier, layer: bezier };
}
