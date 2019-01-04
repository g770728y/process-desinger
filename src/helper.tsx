import * as React from 'react';

import {
  PNode,
  PAnchorType,
  PNodeTemplate,
  Shape,
  Dim,
  CircleSize,
  RectSize,
  PBox,
  Position
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
      style={{ display: 'block' }}
    >
      {child}
    </svg>
  );
}

// 获取node宽高
export function getNodeSize(node: PNode) {
  const { dim, shape } = node;
  if (shape === Shape.Rect) {
    const _dim = dim as RectSize;
    return { w: _dim.w!, h: _dim.h! };
  } else if (shape === Shape.Circle) {
    const _dim = dim as CircleSize;
    return { w: _dim.r! * 2, h: _dim.r! * 2 };
  } else {
    throw new Error(`错误的nodeTemplate shape:${shape}`);
  }
}

// 获取node左上角坐标
export function getNodeXY(node: PNode) {
  const { dim, shape } = node;
  const { cx, cy } = dim!;
  if (shape === Shape.Rect) {
    const _dim = dim as RectSize;
    return { x: cx - _dim.w! / 2, h: cy - _dim.h! / 2 };
  } else if (shape === Shape.Circle) {
    const _dim = dim as CircleSize;
    return { x: cx - _dim.r!, y: cy - _dim.r! };
  } else {
    throw new Error(`错误的nodeTemplate shape:${shape}`);
  }
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

// box是否在container内
export function isBoxInRange(box: PBox, boxContainer: PBox): boolean {
  return (
    box.x >= boxContainer.x &&
    box.y >= boxContainer.y &&
    box.x + box.w <= boxContainer.x + boxContainer.w &&
    box.y + box.h <= boxContainer.y + boxContainer.h
  );
}

// 将nodeTemplate拖到画布时, 返回实例
export function getNodeInstance(
  nodeTemplate: PNodeTemplate,
  { cx, cy }: Position
): PNode {
  return {
    ...nodeTemplate,
    templateId: nodeTemplate.id,
    dim: {
      ...nodeTemplate.dim,
      cx,
      cy
    }
  };
}

// 抽取画布内元素的nodeType与nodeId属性
export function extractDataAttrs(e: MouseEvent) {
  const el = e.target! as HTMLElement;
  const dataId = el.getAttribute('data-id');

  return {
    dataType: el.getAttribute('data-type') || undefined,
    dataId: dataId ? parseInt(dataId) : undefined
  };
}
