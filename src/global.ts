import { Shape, PNodeTemplate } from './index.type';

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
    name: '开始',
    shape: Shape.Circle,
    dim: { r: 30 }
  },
  {
    id: EndId,
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
// 将放在html上
export const DataNodeType = 'node';
export const DataEdgeType = 'edge';
export const DataOrphanEdgeType = 'oedge';
export const GripType = 'Grip';
// 是否是正确的nodeTypes
export function isDataType(type?: string): boolean {
  return [DataNodeType, DataEdgeType].some(_type => type === _type);
}
// 是否是可拖放的nodeTypes (注意edge不可拖放)
export function isDraggableDataType(type?: string): boolean {
  return [DataNodeType, GripType].some(_type => _type === type);
}

/////////////////////////////////////////////////////////////////////////////////////
export const DefaultGripRadius = 4;
