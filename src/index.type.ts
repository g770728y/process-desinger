export type RectSize = { w?: number; h?: number };
export type CircleSize = { r?: number };
export type Size = RectSize | CircleSize;
export type Position = { cx: number; cy: number };
export type Dim = Size & Position;

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

export type PAnchorType = 'tc' | 'bc' | 'lc' | 'rc';

export interface PEdge {
  id: PEdgeId;
  from: { id: number; anchor: PAnchorType };
  to: { id: number; anchor: PAnchorType };
}

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
