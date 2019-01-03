import {
  Shape,
  StartId,
  EndId,
  DesignData,
  PNodeTemplate
} from 'process-designer';

export const nodeTemplates: PNodeTemplate[] = [
  { id: 1, name: '操作', shape: Shape.Rect, dim: { w: 100, h: 30 } },
  { id: 2, name: '操作2', shape: Shape.Circle, dim: { r: 100 } }
];

export const processData: DesignData = {
  nodes: [
    { id: StartId, templateId: StartId, dim: { cx: 100, cy: 100, r: 30 } },
    { id: EndId, templateId: EndId, dim: { cx: 100, cy: 800, r: 30 } },
    {
      id: 1,
      name: '特殊名称',
      templateId: 1,
      dim: { cx: 100, cy: 300, w: 100, h: 50 }
    },
    {
      id: 2,
      templateId: 1,
      dim: { cx: 100, cy: 500, w: 100, h: 50 }
    },
    {
      id: 3,
      templateId: 1,
      dim: { cx: 100, cy: 700, w: 100, h: 50 }
    }
  ],

  edges: [
    {
      id: 1,
      from: { id: StartId, anchor: 'bc' },
      to: { id: 1, anchor: 'tc' }
    },
    { id: 2, from: { id: 1, anchor: 'bc' }, to: { id: 2, anchor: 'tc' } },
    { id: 3, from: { id: 2, anchor: 'bc' }, to: { id: 3, anchor: 'tc' } },
    { id: 5, from: { id: 3, anchor: 'bc' }, to: { id: EndId, anchor: 'tc' } }
  ]
};
