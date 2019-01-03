import {
  PNode,
  PAnchorType,
  PNodeTemplate,
  Shape,
  Dim,
  CircleSize,
  RectSize
} from './index.type';

export function nodeTemplateByNode(
  node: PNode,
  nodeTemplates: PNodeTemplate[]
) {
  const { templateId } = node;
  const nodeTemplate = nodeTemplates.find(({ id }) => templateId === id);
  if (!nodeTemplate) {
    throw new Error('未找到nodeTemplate');
  }

  return nodeTemplate;
}

// 根据节点与anchor类型, 推算anchor坐标
export function anchorXY(
  node: PNode,
  anchor: PAnchorType,
  nodeTemplates: PNodeTemplate[]
) {
  const { dim } = node;
  const nodeTemplate = nodeTemplateByNode(node, nodeTemplates);
  const { shape } = nodeTemplate!;

  if (shape === Shape.Circle) {
    return _coordsByCircleAnchor(dim!, anchor);
  } else if (shape === Shape.Rect) {
    return _coordsByRectAnchor(dim!, anchor);
  } else {
    throw new Error(`错误的Shape类型: ${shape}`);
  }
}

function _coordsByCircleAnchor(dim: Dim, anchor: PAnchorType) {
  const { cx, cy } = dim!;
  const { r } = dim! as CircleSize;
  if (anchor === 'tc') {
    return { x: cx, y: cy - r! };
  } else if (anchor === 'bc') {
    return { x: cx, y: cy + r! };
  } else if (anchor === 'lc') {
    return { x: cx - r!, y: cy };
  } else if (anchor === 'rc') {
    return { x: cx + r!, y: cy };
  } else {
    throw new Error(`错误的anchor类型: ${anchor}`);
  }
}

function _coordsByRectAnchor(dim: Dim, anchor: PAnchorType) {
  const { cx, cy } = dim!;
  const { w, h } = dim! as RectSize;
  if (anchor === 'tc') {
    return { x: cx, y: cy - h! / 2 };
  } else if (anchor === 'bc') {
    return { x: cx, y: cy + h! / 2 };
  } else if (anchor === 'lc') {
    return { x: cx - w! / 2, y: cy };
  } else if (anchor === 'rc') {
    return { x: cx + w! / 2, y: cy };
  } else {
    throw new Error(`错误的anchor类型: ${anchor}`);
  }
}
