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
  data?: DesignerData;
}): [DesignerController, () => void] {
  const { el, config, events, data } = args;
  const _config = { ...initConfig, ...config } as PConfig;
  const _el = typeof el === 'string' ? document.getElementById(el) : el;
  if (!_el) throw new Error('安装节点不存在');
  const ref = React.createRef<ProcessDesigner>();
  ReactDOM.render(
    <ProcessDesigner
      config={_config}
      data={data || initData}
      ref={ref}
      events={events || {}}
    />,
    _el
  );
  return [
    ref.current!.getController(),
    // 异步时, 调用方可能先卸载, 然后再运行此方法, 导致出错
    // () => setTimeout(() => ReactDOM.unmountComponentAtNode(_el), 0)
    () => ReactDOM.unmountComponentAtNode(_el)
  ];
}
