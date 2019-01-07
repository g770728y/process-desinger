import {
  Shape,
  StartId,
  EndId,
  DesignData,
  PNodeTemplate,
  ElementType
} from 'process-designer';

export const nodeTemplates: PNodeTemplate[] = [
  {
    id: 1,
    type: ElementType.Node,
    name: '操作',
    shape: Shape.Rect,
    dim: { w: 100, h: 30 }
  }
];

export const processData: DesignData = {
  nodes: [
    {
      id: StartId,
      type: ElementType.Node,
      templateId: StartId,
      dim: { cx: 300, cy: 100, r: 30 }
    },
    {
      id: EndId,

      type: ElementType.Node,
      templateId: EndId,
      dim: { cx: 300, cy: 800, r: 30 }
    },
    {
      id: 1,
      type: ElementType.Node,
      name: '特殊名称',
      templateId: 1,
      dim: { cx: 300, cy: 300, w: 100, h: 50 }
    },
    {
      id: 2,
      type: ElementType.Node,
      templateId: 1,
      dim: { cx: 300, cy: 500, w: 100, h: 50 }
    },
    {
      id: 3,
      type: ElementType.Node,
      templateId: 1,
      dim: { cx: 300, cy: 700, w: 100, h: 50 }
    }
  ],

  edges: [
    {
      id: 1,
      type: ElementType.Edge,
      from: { id: StartId, anchor: 'bc' },
      to: { id: 1, anchor: 'tc' }
    },
    {
      id: 2,
      type: ElementType.Edge,
      from: { id: 1, anchor: 'bc' },
      to: { id: 2, anchor: 'tc' }
    },
    {
      id: 3,
      type: ElementType.Edge,
      from: { id: 2, anchor: 'bc' },
      to: { id: 3, anchor: 'tc' }
    },
    {
      id: 5,
      type: ElementType.Edge,
      from: { id: 3, anchor: 'bc' },
      to: { id: EndId, anchor: 'tc' }
    }
  ]
};
