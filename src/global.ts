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
