import React from 'react';
import styles from './styles.css';
import { DesignerProps } from './index.type';
import NodeTemplatesPanel from './NodeTemplatesPanel';
import Painter from './Painter';
import { configure } from 'mobx';
import { Provider, observer } from 'mobx-react';
import UIStore from './store/UIStore';
import { defaultNodeTemplates } from './global';

configure({
  enforceActions: 'observed'
});

@observer
class ProcessDesigner extends React.Component<DesignerProps, {}> {
  uiStore = new UIStore();

  render() {
    const { config: config0, data } = this.props;
    const config = {
      ...config0,
      nodeTemplates: [...defaultNodeTemplates, ...config0.nodeTemplates]
    };
    return (
      <Provider uiStore={this.uiStore} config={config} data={data}>
        <div className={styles['pd-container']}>
          <NodeTemplatesPanel />
          <div
            className={styles['pd-painter-container']}
            style={{
              width: this.uiStore.painterDim.width,
              height: this.uiStore.painterDim.height
            }}
          >
            <Painter data={data} />
          </div>
        </div>
      </Provider>
    );
  }

  onResize = this.uiStore.onResize;

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }
}

export default ProcessDesigner;

export * from './global';
export * from './index.type';
