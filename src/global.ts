import {
  Shape,
  PNodeCandidate,
  ElementType,
  DesignerData,
  PConfig,
  PNodeTemplate
} from './index.type';

// 开始节点id
export const StartId = 0;
// 结束节点id
export const EndId = 1000000;

// 左侧panel宽度
export const NodeCandidatesPanelWidth = 200;

// 开始与结束结点, 可以覆盖
export const defaultNodeTemplates: PNodeTemplate[] = [
  {
    id: StartId,
    label: '开始',
    shape: Shape.Circle,
    dim: { r: 30 }
  },
  {
    id: EndId,
    label: '结束',
    shape: Shape.Circle,
    dim: { r: 30 }
  }
];

export const defaultNodeCandidates: PNodeCandidate[] = [
  {
    id: StartId,
    type: ElementType.Node,
    dim: { r: 30 },
    templateId: StartId,
    data: {}
  },
  {
    id: EndId,
    type: ElementType.Node,
    dim: { r: 30 },
    templateId: EndId,
    data: {}
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

// 移动grip时, snap距离
export const GripSnapThreshold = 10;

// 移动node时, 距离snap线多远会显示snap线
export const ShowNodeSnapThreshold = 10;
// 移动node时, snap距离
export const NodeSnapThreshold = 5;

// 如果画边时, 线段长小于6, 则直接删除
export const MinValidEdgeLength = 10;

/////////////////////////////////////////////////////////////////////////////////////
export const initData: DesignerData = {
  nodes: [
    {
      id: StartId,
      templateId: StartId,
      dim: { cx: 300, cy: 100, r: 30 },
      data: {}
    },
    {
      id: EndId,
      templateId: EndId,
      dim: { cx: 300, cy: 500, r: 30 },
      data: {}
    }
  ],
  edges: []
};

export const initConfig: Partial<PConfig> = {
  canvas: { background: '#ffffff' },
  rearrange: { hGap: 20, vGap: 50 }
};

export const DeleteFlag = '__DELETE__';
