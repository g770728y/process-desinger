import * as React from 'react';
import ReactDOM from 'react-dom';
import EdgeFlagInput from './EdgeFlagInput';

export default function installEdgeFlagInput(
  flags: any[] | null | undefined,
  x: number,
  y: number,
  cb: (flag: string) => void
) {
  const el = document.createElement('div');
  document.body.appendChild(el);

  function onOk(flag?: string) {
    if (flag && flag.length > 0) {
      cb(flag);
    }
    ReactDOM.unmountComponentAtNode(el);
    document.body.removeChild(el);
  }

  ReactDOM.render(<EdgeFlagInput x={x} y={y} flags={flags} onOk={onOk} />, el);
}
