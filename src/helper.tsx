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
  PPosition,
  PNodeId,
  PEdge,
  SnappableGrid
} from './index.type';
import RectNode from './NodeView/RectNode';
import CircleNode from './NodeView/CircleNode';
import Rect from './Shape/Rect';
import Circle from './Shape/Circle';
import NodeText from './Shape/NodeText';
import { distinct, flatten, subtractByKey } from './util';

export function isValidData(data: any) {
  return !!data && typeof data === 'object' && data.nodes;
}

export function xyOfCircleAnchor(dim: Dim, anchor: PAnchorType): PPosition {
  const { cx, cy } = dim!;
  const { r } = dim! as CircleSize;
  if (anchor === 'tc') {
    return { cx, cy: cy - r! };
  } else if (anchor === 'bc') {
    return { cx, cy: cy + r! };
  } else if (anchor === 'lc') {
    return { cx: cx - r!, cy };
  } else if (anchor === 'rc') {
    return { cx: cx + r!, cy };
  } else {
    throw new Error(`错误的anchor类型: ${anchor}`);
  }
}

export function xyOfRectAnchor(dim: Dim, anchor: PAnchorType): PPosition {
  const { cx, cy } = dim!;
  const { w, h } = dim! as RectSize;
  if (anchor === 'tc') {
    return { cx, cy: cy - h! / 2 };
  } else if (anchor === 'bc') {
    return { cx, cy: cy + h! / 2 };
  } else if (anchor === 'lc') {
    return { cx: cx - w! / 2, cy };
  } else if (anchor === 'rc') {
    return { cx: cx + w! / 2, cy };
  } else {
    throw new Error(`错误的anchor类型: ${anchor}`);
  }
}

// 根据节点与anchor类型, 推算anchor坐标
export function nodeAnchorXY(node: PNode, anchor: PAnchorType): PPosition {
  const { dim, shape } = node;

  if (shape === Shape.Circle) {
    return xyOfCircleAnchor(dim!, anchor);
  } else if (shape === Shape.Rect) {
    return xyOfRectAnchor(dim!, anchor);
  } else {
    throw new Error(`错误的Shape类型: ${shape}`);
  }
}

// 获取edge的起点或终点坐标
export function edgeAnchorXY(
  edge: PEdge,
  anchor: PAnchorType,
  nodes: PNode[]
): PPosition {
  const { id: nodeId, anchor: nodeAnchor } =
    anchor === '0' ? edge.from : edge.to;
  const node = nodes.find(node => node.id === nodeId);
  return nodeAnchorXY(node!, nodeAnchor);
}

// 利用nodeId, 找到anchor
export function nodeAnchorXYByNodeId(
  nodes: PNode[],
  nodeId: PNodeId,
  anchor: PAnchorType
) {
  const node = nodes.find(({ id }) => id === nodeId);
  return nodeAnchorXY(node!, anchor);
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
export function getNodeSize(node: PNode): { w: number; h: number } {
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

// 全部可snap的边
export function getSnappableGrid(
  nodes: PNode[],
  exceptId?: PNodeId
): SnappableGrid {
  const _result = nodes.reduce(
    (acc: SnappableGrid, node) => {
      if (node.id === exceptId) return acc;

      const { cx, cy } = node.dim!;
      const { w, h } = getNodeSize(node);
      return {
        xs: [...acc.xs!, cx - w / 2, cx, cx + w / 2],
        ys: [...acc.ys!, cy - h / 2, cy, cy + h / 2]
      };
    },
    { xs: [], ys: [] }
  );
  return {
    xs: distinct((_result.xs || []).sort()),
    ys: distinct((_result.ys || []).sort())
  };
}

export function renderNode(node: PNode) {
  const { id, shape } = node;
  if (shape === Shape.Rect) {
    return <RectNode key={id} node={node} />;
  } else if (shape === Shape.Circle) {
    return <CircleNode key={node.id} node={node} />;
  } else {
    throw new Error(`错误的node shape:${shape}`);
  }
}

export function renderShape(node: PNode) {
  const { id, shape } = node;
  if (shape === Shape.Rect) {
    return <Rect node={node} />;
  } else if (shape === Shape.Circle) {
    return <Circle node={node} />;
  } else {
    throw new Error(`错误的node shape:${shape}`);
  }
}

export function renderNodeTemplate(
  nodeTemplate: PNodeTemplate,
  ref: React.RefObject<SVGSVGElement>
) {
  const { branchFlags, ..._nodeTemplate } = nodeTemplate;
  const { id, shape, dim, label } = _nodeTemplate;

  let svg: React.ReactNode;

  if (shape === Shape.Circle) {
    const { r } = dim as CircleSize;
    const node: PNode = {
      ..._nodeTemplate,
      dim: { ...dim, cx: r!, cy: r! }
    };
    const vtext = <NodeText w={2 * r!} h={2 * r!} text={label} />;
    const vshape = renderShape(node);
    svg = wrapSvg(
      2 * r!,
      2 * r!,
      <>
        {vshape}
        {vtext}
      </>,
      ref
    );
  } else if (shape === Shape.Rect) {
    const { w, h } = dim! as RectSize;
    const node: PNode = {
      ..._nodeTemplate,
      dim: { ...dim, cx: w! / 2, cy: h! / 2 }
    };
    const vtext = <NodeText w={w!} h={h!} text={label} />;
    const vshape = renderShape(node);
    svg = wrapSvg(
      w!,
      h!,
      <>
        {vshape}
        {vtext}
      </>,
      ref
    );
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
  { cx, cy }: PPosition
): PNode {
  const { branchFlags, ..._nodeTemplate } = nodeTemplate;
  return {
    ..._nodeTemplate,
    templateId: nodeTemplate.id,
    dim: {
      ...nodeTemplate.dim,
      cx,
      cy
    }
  };
}

interface Id2Level {
  [pNodeId: number]: number;
}

// 重排
export function rearrange(
  nodes: PNode[],
  edges: PEdge[],
  startNode: PNode,
  hGap: number,
  vGap: number
): PNode[] {
  const centralAxisX = startNode.dim!.cx;
  return [startNode, ..._rearrange([startNode], 0, { [startNode.id]: 0 })];

  function _rearrange(
    parentNodes: PNode[],
    level: number,
    id2Level: Id2Level
  ): PNode[] {
    const edgesStartFromParentNodess = parentNodes.map(({ id }) =>
      edges.filter(edge => edge.from.id === id)
    );
    const edgesStartFromParentNodes = flatten(edgesStartFromParentNodess);
    // 自动去重
    let childrenId2Level = edgesStartFromParentNodes.reduce(
      (acc, edge) => ({ ...acc, [edge.to.id]: level + 1 }),
      {}
    );
    // 排除已经使用过的
    childrenId2Level = subtractByKey(childrenId2Level, id2Level);

    if (Object.keys(childrenId2Level).length > 0) {
      // 当前level上有哪些node
      let childrenNodes = Object.keys(childrenId2Level).map(
        id => nodes.find(node => node.id === parseInt(id))!
      );
      // 找到上一level的bottom y
      const lastBottomY =
        parentNodes[0].dim!.cy + maxHeightOfNodes(parentNodes) / 2;
      // 当前level的cy
      const cy = lastBottomY + vGap + maxHeightOfNodes(childrenNodes) / 2;

      // 当前level所有node的全宽
      const fullWidth =
        fullWidthOfNodes(childrenNodes) + hGap * (childrenNodes.length - 1);

      let currentLeft = centralAxisX - fullWidth / 2;
      // 调整
      childrenNodes.forEach(node => {
        const { w, h } = getNodeSize(node);
        node.dim!.cx = currentLeft + w / 2;
        currentLeft = currentLeft + w + hGap;
        node.dim!.cy = cy;
      });

      return [
        ...childrenNodes,
        ..._rearrange(childrenNodes, level + 1, {
          ...id2Level,
          ...childrenId2Level
        })
      ];
    } else {
      return [];
    }
  }

  function maxHeightOfNodes(nodes: PNode[]): number {
    return nodes.reduce((acc, node) => {
      const { w, h } = getNodeSize(node);
      return Math.max(acc, h);
    }, 0);
  }

  function fullWidthOfNodes(nodes: PNode[]): number {
    return nodes.reduce((acc, node) => {
      const { w, h } = getNodeSize(node);
      return acc + w;
    }, 0);
  }
}
