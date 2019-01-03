import * as React from 'react';
import styles from '../styles.css';
import { NodeTemplatesPanelWidth } from '../global';

class NodeTemplatesPanel extends React.Component {
  render() {
    return (
      <div
        className={styles['pd-node-templates-panel']}
        style={{ width: NodeTemplatesPanelWidth }}
      >
        111
      </div>
    );
  }
}

export default NodeTemplatesPanel;
