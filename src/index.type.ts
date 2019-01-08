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
  type: ElementType;
  name: string;
  shape: Shape;
  dim?: Partial<Dim>;
}

export interface PNode {
  id: PNodeId;
  type: ElementType;
  name?: string;
  shape?: Shape;
  templateId?: number;
  dim?: Dim;
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
  canvas?: { background?: string };
  nodeTemplates: PNodeTemplate[];
};

export type DesignerData = {
  nodes: PNode[];
  edges: PEdge[];
};

export type DesignerProps = {
  config: PConfig;
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
  onSelectNode?: (node: PNode) => void;
}

export interface DesignerController {
  rearrange?: () => void;
}
