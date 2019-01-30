import * as React from 'react';
import styles from '../styles.css';
import { NodeTemplatesPanelWidth } from '../global';
import { observer, inject } from 'mobx-react';
import NodeTemplateItem from './NodeTemplateItem';
import ConfigStore from '../store/ConfigStore';
import DesignDataStore from '../store/DesignDataStore';

type IProps = {
  configStore?: ConfigStore;
  dataStore?: DesignDataStore;
};

@inject(({ configStore, dataStore }) => ({ configStore, dataStore }))
@observer
class NodeTemplatesPanel extends React.Component<IProps> {
  render() {
    const { configStore, dataStore } = this.props;
    const { bizNodeTemplates } = configStore!;
    const top = configStore!.ui.nodeTemplatesPanelTop || 0;
    return (
      <div
        className={styles['pd-left-side-area']}
        style={{ width: NodeTemplatesPanelWidth }}
      >
        <div style={{ height: top, background: '#f2f2f2' }} />
        <div
          className={styles['pd-node-templates-panel']}
          style={{
            width: NodeTemplatesPanelWidth
          }}
        >
          {bizNodeTemplates.map(nodeTemplate => (
            <NodeTemplateItem
              key={nodeTemplate.id}
              nodeTemplate={nodeTemplate}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default NodeTemplatesPanel;
