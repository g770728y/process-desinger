import { configure } from 'mobx';

configure({
  enforceActions: 'observed'
});

import ProcessDesigner from './ProcessDesign';

export * from './global';
export * from './index.type';
export default ProcessDesigner;
