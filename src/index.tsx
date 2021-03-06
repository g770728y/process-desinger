import { configure } from 'mobx';

configure({
  enforceActions: 'observed'
});

import ProcessDesigner from './ProcessDesigner';

export * from './global';
export * from './index.type';
export default ProcessDesigner;

export { installProcessDesigner } from './App';
