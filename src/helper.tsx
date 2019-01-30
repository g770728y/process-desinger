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
  SnappableGrid,
  PEdgeId
} from './index.type';
import RectNode from './NodeView/RectNode';
import CircleNode from './NodeView/CircleNode';
import Rect from './Shape/Rect';
import Circle from './Shape/Circle';
import NodeText from './Shape/NodeText';
import { distinct, flatten, unpickAll, uniq, subtract } from './util';
import DesignDataStore from './store/DesignDataStore';
import { toJS } from 'mobx';

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

export function renderNodeTemplateToSvg(
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

export function getNode(nodes: PNode[], id: PNodeId) {
  return nodes.find(node => node.id === id);
}

export function getEdge(edges: PEdge[], id: PEdgeId) {
  return edges.find(edge => edge.id === id);
}

// 重排
export function rearrange(
  nodes: PNode[],
  edges: PEdge[],
  startNode: PNode,
  hGap: number,
  vGap: number
): { nodes: PNode[]; edges: PEdge[] } {
  // TODO: 检查孤立结点, 并禁止重排

  const centralAxisX = startNode.dim!.cx;

  // level: [node-id, node-id]
  // {0:[0], 1:[1,2], 2:[3], 4:[1000]}
  // 必须确保算法, 第1层的节点不能同时出现在第2层上, 也就是不能重复
  const level2NodeIds: { [level: number]: PNodeId[] } = getLevel2NodeIds(
    1,
    getChildrenNodeIds(startNode.id),
    { 0: [startNode.id] }
  );

  // 计算每层的高度(以最高的节点为准)
  const level2Height: { [level: number]: number } = Object.keys(
    level2NodeIds
  ).reduce((acc: { number: number }, _level: string) => {
    const level = parseInt(_level);
    const height = maxHeightOfNodes(
      level2NodeIds[level].map(id => getNode(nodes, id)!)
    );
    return { ...acc, [level]: height };
  }, {});

  const level2Cy: { [level: number]: number } = Object.keys(
    level2Height
  ).reduce((acc: { [level: number]: number }, _level: string) => {
    const level = parseInt(_level);
    const cy = getCyOnLevel(startNode.dim!.cy, level, level2Height);
    return { ...acc, [level]: cy };
  }, {});

  // 计算每层的总宽度(宽度总和 + 总hgap)
  const level2Width: { [level: number]: number } = Object.keys(
    level2NodeIds
  ).reduce((acc: { number: number }, _level: string) => {
    const level = parseInt(_level);
    const width = fullWidthOfNodes(
      level2NodeIds[level].map(id => getNode(nodes, id)!)
    );
    return { ...acc, [level]: width };
  }, {});

  // 计算每个节点的cx & cy
  const nodeId2cxcy: { [nodeId: number]: PPosition } = nodes.reduce(
    (acc: { [nodeId: number]: PPosition }, node: PNode, i: number) => {
      const level = findLevel(level2NodeIds, node.id);

      if (level < 0) {
        // 孤立节点, 直接返回
        return { ...acc, [node.id]: { cx: node.dim!.cx, cy: node.dim!.cy } };
      }

      // 在同排中位于第几个
      const index = level2NodeIds[level].findIndex(
        nodeId => node.id === nodeId
      );
      const leftestX =
        centralAxisX -
        level2Width[level] / 2 -
        (level2NodeIds[level].length * hGap) / 2.0;
      const cy = level2Cy[level];
      const nodeIdsOnLeft = level2NodeIds[level].filter((v, i) => i < index);
      const nodeWidthOnLeft = nodeIdsOnLeft.reduce((acc, nodeId) => {
        const node = getNode(nodes, nodeId)!;
        const { w, h } = getNodeSize(node);
        return acc + w;
      }, 0);

      const cx =
        leftestX + (index * hGap + nodeWidthOnLeft) + getNodeSize(node).w / 2;

      return { ...acc, [node.id]: { cx, cy } };
    },
    {}
  );

  // 将cx/cy 附加到 node 上
  const newNodes = nodes.map(node => {
    const cxcy = nodeId2cxcy[node.id];
    return { ...node, dim: { ...node.dim, ...cxcy } };
  });

  // 自动排列edges
  const newEdges = edges.map(edge => ({
    ...edge,
    from: { ...edge.from, anchor: 'bc' as PAnchorType },
    to: { ...edge.to, anchor: 'tc' as PAnchorType }
  }));

  return { nodes: newNodes, edges: newEdges };

  // return [startNode, ..._rearrange([startNode], 0, { [startNode.id]: 0 })];

  function findLevel(
    level2NodeIds: { [level: number]: PNodeId[] },
    nodeId: PNodeId
  ): number {
    return Object.keys(level2NodeIds).reduce((acc, _level) => {
      const level = parseInt(_level);
      return level2NodeIds[level].find(id => id === nodeId) !== undefined
        ? level
        : acc;
    }, -1);
  }

  // 某级的cy
  function getCyOnLevel(
    startCy: number,
    currentLevel: number,
    levels2Height: { [level: number]: number }
  ) {
    const totalNodesH = Object.keys(levels2Height).reduce(
      (acc: number, _level: string) => {
        const level = parseInt(_level);
        const h = levels2Height[level];
        return level <= currentLevel ? acc + h : acc;
      },
      startCy
    );

    return (
      totalNodesH -
      levels2Height[0] / 2 -
      levels2Height[currentLevel] / 2 +
      vGap * currentLevel
    );
  }

  // level 与 childrenIds 是对应的, prevLevel2NodeIds是level-1及以上的
  function getLevel2NodeIds(
    level: number,
    childrenIds: PNodeId[],
    prevLevel2NodeIds: { [level: number]: PNodeId[] }
  ): {
    [level: number]: PNodeId[];
  } {
    if (childrenIds.length <= 0) {
      return prevLevel2NodeIds;
    } else {
      // 计算下一循环的childrenIds(grandChildrenIds)
      // 特例: 如果grandChild, 存在于prevLevel2NodeIds, 那么应从grandChildrenIds中排除
      // 如下图, 这是一个循环图, 如果当前位于level=2也即C,  那么:
      // level =2, childrenIds=[C], prevLevel2NodeIds=[A,B]
      // 第一步: 检查C的下级, 发现是A, 而A已存在于[A,B]
      // 显然 下次循环时, grandChildren=[] (不包含C)
      //          A
      //        /   \  (注意这个箭头指向A)
      //       B    /
      //        \  /
      //         C    (注意这个箭头从C指向A)
      const allPrevNodeIds = flatten(Object.values(prevLevel2NodeIds));
      const grandChildrenIds = uniq(
        edges
          .filter(edge => childrenIds.indexOf(edge.from.id) >= 0)
          .map(edge => edge.to.id)
      ).filter(nodeId => allPrevNodeIds.indexOf(nodeId) < 0);

      // 计算新的prevLevel2NodeIds
      // 特例: 如果当前的child, 存在于prevLevel2NodeIds, 那么应从prevLevel2NodeIds中排除
      // 如下图, 如果children=[C], prevLevel2NodeIds=[A,C,B], 第一步:新的prev=[A,B], 第二步:加上当前level: [A,B]+[C]
      //       A
      //     /  \
      //    B   /
      //     \ /
      //      C
      const _prevLevel2NodeIds = Object.keys(prevLevel2NodeIds).reduce(
        (acc, _level) => {
          const level = parseInt(_level);
          return {
            ...acc,
            [level]: subtract(prevLevel2NodeIds[level], childrenIds)
          };
        },
        {}
      );
      const newPrevLevel2NodeIds = {
        ..._prevLevel2NodeIds,
        ...{ [level]: childrenIds }
      };

      return {
        ...prevLevel2NodeIds,
        ...getLevel2NodeIds(level + 1, grandChildrenIds, newPrevLevel2NodeIds)
      };
    }
  }

  function getChildrenNodeIds(nodeId: PNodeId): PNodeId[] {
    return edges
      .filter(edge => edge.from.id === nodeId)
      .map(edge => edge.to.id);
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

// 检查整个ds的有效性
export function check(ds: DesignDataStore): string | null | undefined {
  // 必须至少有开始节点
  if (!ds.startNode) return '必须有开始结点';

  if (!ds.endNode) return '必须有结束结点';

  const edges = ds.edges;

  // StartNode不能作为边的终点
  if (edges.some(edge => edge.to.id === ds.startNode.id)) {
    return '开始节点 不能作为边的终点';
  }

  // EndNode不能作为边的起点
  if (edges.some(edge => edge.from.id === ds.endNode.id)) {
    return '终止节点 不能作为边的起点';
  }

  // 其余节点必须至少有一个入口边和一个出口边
  if (
    ds.nodes
      .filter(node => [ds.startNode.id, ds.endNode.id].indexOf(node.id) < 0)
      .some(node => isOrphanNode(node, ds.edges))
  ) {
    return '存在孤立节点. 请确保每个节点至少有一进一出两条边';
  }

  return null;

  // 节点至少有一进一出两条边
  function isOrphanNode(node: PNode, edges: PEdge[]) {
    const isValid =
      edges.map(edge => edge.from.id).includes(node.id) &&
      edges.map(edge => edge.to.id).includes(node.id);
    return !isValid;
  }
}
