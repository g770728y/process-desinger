import * as React from 'react';
import styles from '../styles.css';
import { NodeTemplatesPanelWidth } from '../global';
import { observer, inject } from 'mobx-react';
import NodeTemplateItem from './NodeTemplateItem';
import ConfigStore from '../store/ConfigStore';

type IProps = {
  configStore?: ConfigStore;
};

@inject(({ configStore }) => ({ configStore }))
@observer
class NodeTemplatesPanel extends React.Component<IProps> {
  render() {
    const { configStore } = this.props;
    const { nodeTemplates } = configStore!;
    return (
      <div
        className={styles['pd-node-templates-panel']}
        style={{ width: NodeTemplatesPanelWidth }}
      >
        {nodeTemplates.map(nodeTemplate => (
          <NodeTemplateItem key={nodeTemplate.id} nodeTemplate={nodeTemplate} />
        ))}
      </div>
    );
  }
}

export default NodeTemplatesPanel;
