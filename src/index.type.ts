export type PContext = {
  selectedNodeIds?: PNodeId[];
  selectedEdgeIds?: PEdgeId[];
  selectedOrphanEdgeIds?: PEdgeId[];
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
  name: string;
  shape: Shape;
  dim?: Partial<Dim>;
}

export interface PNode {
  id: PNodeId;
  name?: string;
  shape?: Shape;
  templateId?: number;
  dim?: Dim;
}

export type PElement = PNode | PEdge;

export interface PEdge {
  id: PEdgeId;
  from: { id: number; anchor: PAnchorType };
  to: { id: number; anchor: PAnchorType };
}

export interface OrphanEdge {
  id: PEdgeId;
  from: PPosition;
  to: PPosition;
}

// 0, 1 表示 edge的起点或终点
export type PAnchorType = 'tc' | 'bc' | 'lc' | 'rc' | '0' | '1';

export type Config = {
  canvas?: { background?: string };
  nodeTemplates: PNodeTemplate[];
};

export type DesignData = {
  nodes: PNode[];
  edges: PEdge[];
};

export type DesignerProps = {
  config: Config;
  data: DesignData;
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
