import * as React from 'react';
import styles from '../styles.css';
import { NodeCandidatesPanelWidth } from '../global';
import { observer, inject } from 'mobx-react';
import NodeCandidateItem from './NodeCandidateItem';
import ConfigStore from '../store/ConfigStore';

type IProps = {
  configStore?: ConfigStore;
};

@inject(({ configStore }) => ({ configStore }))
@observer
class NodeCandidatesPanel extends React.Component<IProps> {
  render() {
    const { configStore } = this.props;
    const { bizNodeCandidates } = configStore!;
    const top = configStore!.ui.nodeCandidatesPanelTop || 0;
    return (
      <div
        className={styles['pd-left-side-area']}
        style={{ width: NodeCandidatesPanelWidth }}
      >
        <div style={{ height: top, background: '#f2f2f2' }} />
        <div
          className={styles['pd-node-candidates-panel']}
          style={{
            width: NodeCandidatesPanelWidth
          }}
        >
          {bizNodeCandidates.map(nodeCandidate => (
            <NodeCandidateItem
              key={nodeCandidate.id}
              nodeCandidate={nodeCandidate}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default NodeCandidatesPanel;
