import * as React from 'react';
import { inject, observer } from 'mobx-react';
import UIStore from '../store/UIStore';
import { renderNode } from '../helper';
import styles from './styles.css';

interface IProps {
  uiStore?: UIStore;
}

@inject(({ uiStore }) => ({ uiStore }))
@observer
class OrphanNode extends React.Component<IProps> {
  render() {
    const { orphanNodeInfo } = this.props.uiStore!;
    const { cx, cy, node } = orphanNodeInfo;

    if (!node) return null;

    const _node = { ...node, dim: { ...node!.dim, cx, cy } };

    return (
      <div className={styles['pd-orphan-node-container']}>
        {renderNode(_node)}
      </div>
    );
  }
}

export default OrphanNode;

// TODO
// 明显不正确
// 原因:
// 1. renderNode 应包裹 wrapSvg
// 2. cx cy 应作用在 div container 上
// 3. 需要重算node的cx/cy
