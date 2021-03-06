// 将放在html上
export enum ElementType {
  Node = 'node',
  Edge = 'edge',
  OrphanEdge = 'oedge',
  Grip = 'grip'
}

export interface Identity {
  id: number;
}

export type PContext = {
  selectedNodeIds?: PNodeId[];
  selectedEdgeIds?: PEdgeId[];
  selectedOrphanEdgeIds?: PEdgeId[];
  hidedEdgeId?: PEdgeId;
  snappableGrid?: SnappableGrid;
};

export type RectSize = { w?: number; h?: number };
export type CircleSize = { r?: number };
export type Size = RectSize | CircleSize;
export type PPosition = { cx: number; cy: number };
export type Dim = Size & PPosition;

export type PNodeId = number;

export type PEdgeId = number;

export interface PNodeTemplate {
  id: PNodeId;
  type?: ElementType;
  label: string;
  iconSrc?: string;
  shape: Shape;
  dim?: Partial<Dim>;
  branchFlags?: any[];
}

export interface PNodeCandidate {
  // id 由程序自动生成
  id?: PNodeId;
  type?: ElementType;
  label?: string;
  iconSrc?: string;
  shape?: Shape;
  templateId: number;
  dim?: Partial<Dim>;
  branchFlags?: any[];
  data: any;
}

export interface PNode {
  id: PNodeId;
  type?: ElementType;
  label?: string;
  iconSrc?: string;
  shape?: Shape;
  templateId: number;
  dim?: Dim;
  branchFlags?: any[];
  data: any;
}

export type PElement = PNode | PEdge;

export interface PAnchor {
  host: PElement;
  anchor: PAnchorType;
  xy: PPosition;
}

export interface PEdge {
  id: PEdgeId;
  type: ElementType;
  flag?: any;
  from: { id: number; anchor: PAnchorType };
  to: { id: number; anchor: PAnchorType };
}

export interface OrphanEdge {
  // 比如拖动已有的edge, 则已此孤立edge实质上将附着于已有edge
  hostId?: PEdgeId;
  id: PEdgeId;
  type: ElementType;
  from: PPosition | { id: number; anchor: PAnchorType };
  to: PPosition | { id: number; anchor: PAnchorType };
}

// 0, 1 表示 edge的起点或终点
export type PAnchorType = 'tc' | 'bc' | 'lc' | 'rc' | '0' | '1';

export type PConfig = {
  mode: 'update' | undefined;
  canvas?: { background?: string };
  rearrange?: { hGap: number; vGap: number };
  nodeTemplates: PNodeTemplate[];
  nodeCandidates: PNodeCandidate[];
  ui?: { nodeCandidatesPanelTop: number };
  // 是否隐藏 边的 flag 输入框 ?
  // 默认为 false
  hideEdgeFlagInput?: boolean;
};

export type DesignerData = {
  nodes: PNode[];
  edges: PEdge[];
};

export type DesignerProps = {
  config: PConfig;
  mode: 'update' | undefined;
  data: DesignerData;
  events: DesignerEvents;
};

export enum Shape {
  Rect,
  Circle
}

export interface OrphanNodeInfo {
  cx: number;
  cy: number;
  node?: PNode;
}

export interface PBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SnappableGrid {
  xs?: number[];
  ys?: number[];
}

export interface DesignerEvents {
  // 双击边时触发此事件
  // 回调方法将收到边的id 和 可用的flags, 如果flags 不存在, 则弹出文本输入框, 否则弹出选框
  // 与markEdge配套使用
  // 一般不用
  onActiveEdge?: (id: PEdgeId, flags?: String[]) => void;

  // 双击 或 点击node上的编辑按钮时 触发此事件
  // 回调方法将收到整个node节点, 可使用node节点的id, 查找对应的业务对象并弹出编辑框
  // 与markNode配套使用
  // 如果id不存在, 则相当于取消选择
  onActiveNode?: (id?: PNodeId, data?: any) => void;

  // 在图中删除节点时调用, 外部应同步删除 对应的 业务对象
  onDelNode?: (id: PNodeId) => void;

  // 在图中添加节点时调用, 外部应同步添加 对应的 空业务对象
  onAddNode?: (id: PNodeId, data: any) => void;
}

// 对angular, 可使用 controller = installProcessDesigner(...) 获取
// 对react, 可使用 ProcessDesinger的 ref.getController 获取
export interface DesignerController {
  // 自动重排节点位置
  rearrange?: () => void;

  // 标记 [节点名称] 和 [图标]
  // 何时调用: 双击节点打开业务对象编辑器进行编辑,点击确定后, 可调用此方法,并:
  // 1. 设置 工艺计划明细名称 为label
  // 2. 对于支持 返修 的操作, 可以增加一个png前缀图标
  // 图标显示24x24, 最好是png / jpg
  markNode?: (params: { id: PNodeId; label: string; iconSrc?: string }) => void;

  // 标记 [ 边的状态 ]
  markEdge?: (params: { id: PEdgeId; flag: String }) => void;

  // 获取全部节点关系
  // 何时调用: 在保存时, 先 删除 全部关系, 再重建全部关系
  getAllAssoc: () => { fromNodeId: PNodeId; toNodeId: PNodeId; flag: any }[];

  // 检查
  check: () => string | null | undefined;

  // 获取全部设计数据
  getDesignerData: () => DesignerData;

  // 重置 全部 nodeCandidates
  resetNodeCandidates: (nodes: PNodeCandidate[]) => void;
}
