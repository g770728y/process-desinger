import React from 'react';
import ReactDOM from 'react-dom';
import ProcessDesigner from './ProcessDesign';
import {
  ElementType,
  DesignerData,
  PConfig,
  PNode,
  DesignerEvents,
  DesignerController
} from './index.type';
import { StartId } from './global';

export const initData: DesignerData = {
  nodes: [
    {
      id: StartId,
      type: ElementType.Node,
      templateId: StartId,
      dim: { cx: 300, cy: 100, r: 30 }
    }
  ],
  edges: []
};

const initConfig = {
  canvas: { background: '#ffffff' }
};

export function installProcessDesigner(args: {
  el: string | HTMLElement;
  config: Partial<PConfig>;
  events?: DesignerEvents;
}): DesignerController {
  const { el, config, events } = args;
  const _config = { ...initConfig, ...config } as PConfig;
  const _el = typeof el === 'string' ? document.getElementById(el) : el;
  const ref = React.createRef<ProcessDesigner>();
  ReactDOM.render(
    <ProcessDesigner
      config={_config}
      data={initData}
      ref={ref}
      events={events || {}}
    />,
    _el
  );
  return ref.current!.getController();
}
