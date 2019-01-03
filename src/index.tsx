import React from 'react';
import styles from './styles.css';
import { DesignerProps } from './index.type';
import NodeTemplatesPanel from './NodeTemplatesPanel';
import Painter from './Painter';
import { configure } from 'mobx';
import { Provider, observer } from 'mobx-react';
import UIStore from './store/UIStore';
import { defaultNodeTemplates } from './global';
import ConfigStore from './store/ConfigStore';
import DesignDataStore from './store/DesignDataStore';
import OrphanNode from './NodeView/OrphanNode';

configure({
  enforceActions: 'observed'
});

@observer
class ProcessDesigner extends React.Component<DesignerProps, {}> {
  uiStore: UIStore;
  configStore: ConfigStore;
  designDataStore: DesignDataStore;
  onResize: VoidFunction;

  constructor(props: DesignerProps) {
    super(props);
    this.uiStore = new UIStore();

    const { config, data } = this.props;

    this.configStore = new ConfigStore(config);

    this.designDataStore = new DesignDataStore(data, this.configStore);

    this.onResize = this.uiStore.onResize;
  }

  render() {
    return (
      <Provider
        uiStore={this.uiStore}
        configStore={this.configStore}
        dataStore={this.designDataStore}
      >
        <div className={styles['pd-container']}>
          <NodeTemplatesPanel />
          <div
            className={styles['pd-painter-container']}
            style={{
              width: this.uiStore.painterDim.width,
              height: this.uiStore.painterDim.height
            }}
          >
            <Painter />
          </div>
          <OrphanNode />
        </div>
      </Provider>
    );
  }

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
