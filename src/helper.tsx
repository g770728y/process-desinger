import * as React from 'react';

import {
  PNode,
  PAnchorType,
  PNodeTemplate,
  Shape,
  Dim,
  CircleSize,
  RectSize
} from './index.type';
import RectNode from './NodeView/RectNode';
import CircleNode from './NodeView/CircleNode';

function _coordsByCircleAnchor(dim: Dim, anchor: PAnchorType) {
  const { cx, cy } = dim!;
  const { r } = dim! as CircleSize;
  if (anchor === 'tc') {
    return { x: cx, y: cy - r! };
  } else if (anchor === 'bc') {
    return { x: cx, y: cy + r! };
  } else if (anchor === 'lc') {
    return { x: cx - r!, y: cy };
  } else if (anchor === 'rc') {
    return { x: cx + r!, y: cy };
  } else {
    throw new Error(`错误的anchor类型: ${anchor}`);
  }
}

function _coordsByRectAnchor(dim: Dim, anchor: PAnchorType) {
  const { cx, cy } = dim!;
  const { w, h } = dim! as RectSize;
  if (anchor === 'tc') {
    return { x: cx, y: cy - h! / 2 };
  } else if (anchor === 'bc') {
    return { x: cx, y: cy + h! / 2 };
  } else if (anchor === 'lc') {
    return { x: cx - w! / 2, y: cy };
  } else if (anchor === 'rc') {
    return { x: cx + w! / 2, y: cy };
  } else {
    throw new Error(`错误的anchor类型: ${anchor}`);
  }
}

// 根据节点与anchor类型, 推算anchor坐标
export function anchorXY(node: PNode, anchor: PAnchorType) {
  const { dim, shape } = node;

  if (shape === Shape.Circle) {
    return _coordsByCircleAnchor(dim!, anchor);
  } else if (shape === Shape.Rect) {
    return _coordsByRectAnchor(dim!, anchor);
  } else {
    throw new Error(`错误的Shape类型: ${shape}`);
  }
}

export function wrapSvg(
  w: number,
  h: number,
  child: React.ReactNode,
  ref: React.RefObject<SVGSVGElement>
) {
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      ref={ref}
    >
      {child}
    </svg>
  );
}

export function renderNode(node: PNode) {
  const { id, shape } = node;
  if (shape === Shape.Rect) {
    return <RectNode key={id} node={node} />;
  } else if (shape === Shape.Circle) {
    return <CircleNode key={node.id} node={node} />;
  } else {
    throw new Error(`错误的nodeTemplate shape:${shape}`);
  }
}

export function renderNodeTemplate(
  nodeTemplate: PNodeTemplate,
  ref: React.RefObject<SVGSVGElement>
) {
  const { id, shape, dim } = nodeTemplate;

  let svg: React.ReactNode;

  if (shape === Shape.Circle) {
    const { r } = dim as CircleSize;
    const node: PNode = {
      ...nodeTemplate,
      dim: { ...dim, cx: r!, cy: r! }
    };
    svg = wrapSvg(2 * r!, 2 * r!, renderNode(node), ref);
  } else if (shape === Shape.Rect) {
    const { w, h } = dim! as RectSize;
    const node: PNode = {
      ...nodeTemplate,
      dim: { ...dim, cx: w! / 2, cy: h! / 2 }
    };
    svg = wrapSvg(w!, h!, renderNode(node), ref);
  } else {
    throw new Error('错误的shape');
  }

  return svg;
}
