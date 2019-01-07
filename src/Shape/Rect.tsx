import * as React from 'react';
import { PNode, RectSize, ElementType } from '../index.type';
import { NodeClass } from '../global';

type IProps = {
  node: PNode;
};

class Rect extends React.PureComponent<IProps> {
  render() {
    const { node } = this.props;
    const { id, dim } = node;
    const { cx, cy } = dim!;
    const { w, h } = dim! as RectSize;

    return (
      <rect
        width={w}
        height={h}
        className={NodeClass}
        data-type={ElementType.Node}
        data-id={node.id}
        fill="#cccccc"
      />
    );
  }
}

export default Rect;
