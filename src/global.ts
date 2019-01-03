import { Shape } from './index.type';

// 开始节点id
export const StartId = 0;
// 结束节点id
export const EndId = 1000000;

// 左侧panel宽度
export const NodeTemplatesPanelWidth = 200;

// 开始与结束结点, 可以覆盖
export const defaultNodeTemplates = [
  {
    id: StartId,
    shape: Shape.Circle,
    size: { r: 30 }
  },
  {
    id: EndId,
    shape: Shape.Circle,
    size: { r: 30 }
  }
];

// 缺省画布高度
export const DefaultCanvasHeight = 5000;
