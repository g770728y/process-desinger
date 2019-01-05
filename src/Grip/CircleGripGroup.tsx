import * as React from 'react';
import Grip from './Grip';
import { PNode, CircleSize, PAnchorType } from '../index.type';
import { DataNodeType } from '../global';

type IProps = {
  node: PNode;
};

class CircleGripGroup extends React.Component<IProps> {
  render() {
    const { node } = this.props;
    const { id, dim } = node;
    const { r } = dim! as CircleSize;
    return [
      { p: 'lc' as PAnchorType, cx: 0, cy: r! },
      { p: 'tc' as PAnchorType, cx: r!, cy: 0 },
      { p: 'rc' as PAnchorType, cx: 2 * r!, cy: r! },
      { p: 'bc' as PAnchorType, cx: r!, cy: r! * 2 }
    ].map(item => (
      <Grip key={item.p} {...item} dataType={DataNodeType} dataId={id} />
    ));
  }
}

export default CircleGripGroup;
