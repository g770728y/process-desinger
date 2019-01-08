import React from 'react';
import ReactDOM from 'react-dom';
import ProcessDesigner from './ProcessDesign';
import { ElementType, DesignData, PConfig } from './index.type';
import { StartId } from './global';

export const initData: DesignData = {
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

export function installProcessDesigner(
  config: Partial<PConfig>,
  el: string | HTMLElement
) {
  const _config = { ...initConfig, ...config } as PConfig;
  const _el = typeof el === 'string' ? document.getElementById(el) : el;
  ReactDOM.render(<ProcessDesigner config={_config} data={initData} />, _el);
}
