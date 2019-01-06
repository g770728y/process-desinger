import { Shape, PNodeTemplate, ElementType } from './index.type';

// 开始节点id
export const StartId = 0;
// 结束节点id
export const EndId = 1000000;

// 左侧panel宽度
export const NodeTemplatesPanelWidth = 200;

// 开始与结束结点, 可以覆盖
export const defaultNodeTemplates: PNodeTemplate[] = [
  {
    id: StartId,
    type: ElementType.Node,
    name: '开始',
    shape: Shape.Circle,
    dim: { r: 30 }
  },
  {
    id: EndId,
    type: ElementType.Node,
    name: '结束',
    shape: Shape.Circle,
    dim: { r: 30 }
  }
];

// 缺省画布高度
export const DefaultCanvasHeight = 5000;

/////////////////////////////////////////////////////////////////////////////////////
// 代表svg背景的rect的class
export const SvgBackgroundRectClass = 'svg-background-rect';

// 代表node的class
export const NodeClass = 'pd-node';

// 代表edge的class
export const EdgeClass = 'pd-edge';

/////////////////////////////////////////////////////////////////////////////////////
// 是否是正确的nodeTypes
export function isDataType(type?: string): boolean {
  return [ElementType.Node, ElementType.Edge].some(_type => type === _type);
}
// 是否是可拖放的nodeTypes (注意edge不可拖放)
export function isDraggableDataType(type?: string): boolean {
  return [ElementType.Node, ElementType.Grip].some(_type => _type === type);
}

/////////////////////////////////////////////////////////////////////////////////////
export const DefaultGripRadius = 4;

export const SnapRadius = 3;

// 如果画边时, 线段长小于6, 则直接删除
export const MinEdgeLength = 6;
