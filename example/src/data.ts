import {
  Shape,
  StartId,
  EndId,
  DesignerData,
  PNodeTemplate,
  ElementType,
  PNodeCandidate
} from 'process-designer';

export const nodeTemplates: PNodeTemplate[] = [
  {
    id: 1,
    label: '操作',
    shape: Shape.Rect,
    iconSrc: '/assets/repair_24x24.png',
    dim: { w: 100, h: 30 },
    branchFlags: ['ok', 'fail']
  }
];

export const nodeCandidates: PNodeCandidate[] = [
  {
    label: 'go go go',
    shape: Shape.Rect,
    iconSrc: '/assets/repair_24x24.png',
    dim: { w: 100, h: 30 },
    branchFlags: ['ok', 'fail'],
    templateId: 1,
    data: { a: 1 }
  },
  {
    label: 'fighting',
    shape: Shape.Rect,
    iconSrc: '/assets/repair_24x24.png',
    dim: { w: 100, h: 30 },
    branchFlags: ['aha', 'cry'],
    templateId: 1,
    data: { a: 2 }
  }
];

export const processData: DesignerData = {
  nodes: [
    {
      id: StartId,
      templateId: StartId,
      dim: { cx: 300, cy: 100, r: 30 },
      data: { a: 1 }
    },
    {
      id: EndId,
      templateId: EndId,
      dim: { cx: 300, cy: 800, r: 30 },
      data: { a: 2 }
    },
    {
      id: 1,
      label: '特殊名称',
      templateId: 1,
      dim: { cx: 300, cy: 300, w: 100, h: 50 },
      data: { a: 3 }
    },
    {
      id: 2,
      templateId: 1,
      dim: { cx: 300, cy: 500, w: 100, h: 50 },
      data: { a: 3 }
    },
    {
      id: 3,
      templateId: 1,
      dim: { cx: 300, cy: 700, w: 100, h: 50 },
      data: { a: 4 }
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
