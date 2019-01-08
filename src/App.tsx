import React from 'react';
import ReactDOM from 'react-dom';
import ProcessDesigner from './ProcessDesigner';
import {
  ElementType,
  DesignerData,
  PConfig,
  PNode,
  DesignerEvents,
  DesignerController
} from './index.type';
import { initConfig, initData } from './global';

// 安装设计器到dom节点(注意仅用于 非react项目)
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
