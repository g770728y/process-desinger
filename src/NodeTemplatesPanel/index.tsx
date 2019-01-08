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
    const { nodeTemplates } = configStore!;
    return (
      <div
        className={styles['pd-node-templates-panel']}
        style={{ width: NodeTemplatesPanelWidth }}
      >
        {nodeTemplates.map(nodeTemplate => (
          <div
            className={styles['pd-node-template-item-wrapper']}
            key={nodeTemplate.id}
          >
            <NodeTemplateItem nodeTemplate={nodeTemplate} />
          </div>
        ))}
        <div style={{ flexGrow: 1 }} />
      </div>
    );
  }
}

export default NodeTemplatesPanel;
