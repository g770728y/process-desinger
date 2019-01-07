import * as React from 'react';
import { inject, observer } from 'mobx-react';
import UIStore from '../store/UIStore';
import { renderNode, wrapSvg, getNodeSize, renderShape } from '../helper';
import styles from './styles.css';
import NodeText from '../Shape/NodeText';

interface IProps {
  uiStore?: UIStore;
}

@inject(({ uiStore }) => ({ uiStore }))
@observer
class OrphanNode extends React.Component<IProps> {
  ref = React.createRef<SVGSVGElement>();

  render() {
    const { orphanNodeInfo } = this.props.uiStore!;
    const { cx, cy, node } = orphanNodeInfo;

    if (!node) return null;
    const { w, h } = getNodeSize(node);

    const _node = { ...node, dim: { ...node!.dim, cx: w / 2, cy: h / 2 } };

    const vtext = <NodeText w={w!} h={h!} text={node!.name || ''} />;
    const vshape = renderShape(_node);

    return (
      <div
        className={styles['pd-orphan-node-container']}
        style={{ left: cx - w / 2, top: cy - h / 2 }}
      >
        {wrapSvg(
          w,
          h,
          <>
            {vshape}
            {vtext}
          </>,
          this.ref
        )}
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
