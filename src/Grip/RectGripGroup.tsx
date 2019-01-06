import * as React from 'react';
import { PNode, RectSize, PAnchorType, ElementType } from '../index.type';
import Grip from './Grip';

type IProps = {
  node: PNode;
};

class RectGripGroup extends React.Component<IProps> {
  render() {
    const { node } = this.props;
    const { id, dim } = node;
    const { w, h } = dim! as RectSize;
    return [
      { anchor: 'lc' as PAnchorType, cx: 0, cy: h! / 2 },
      { anchor: 'tc' as PAnchorType, cx: w! / 2, cy: 0 },
      { anchor: 'rc' as PAnchorType, cx: w!, cy: h! / 2 },
      { anchor: 'bc' as PAnchorType, cx: w! / 2, cy: h! }
    ].map(item => (
      <Grip
        key={item.anchor}
        {...item}
        dataType={ElementType.Node}
        dataId={id}
      />
    ));
  }
}

export default RectGripGroup;
