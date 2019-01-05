import * as React from 'react';
import { PNode, RectSize, PAnchorType } from '../index.type';
import Grip from './Grip';
import { DataNodeType } from '../global';

type IProps = {
  node: PNode;
};

class RectGripGroup extends React.Component<IProps> {
  render() {
    const { node } = this.props;
    const { id, dim } = node;
    const { w, h } = dim! as RectSize;
    return [
      { p: 'lc' as PAnchorType, cx: 0, cy: h! / 2 },
      { p: 'tc' as PAnchorType, cx: w! / 2, cy: 0 },
      { p: 'rc' as PAnchorType, cx: w!, cy: h! / 2 },
      { p: 'bc' as PAnchorType, cx: w! / 2, cy: h! }
    ].map(item => (
      <Grip key={item.p} {...item} dataType={DataNodeType} dataId={id} />
    ));
  }
}

export default RectGripGroup;
