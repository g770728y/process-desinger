import * as React from 'react';
import { PNode, RectSize, CircleSize, ElementType } from '../index.type';
import { NodeClass } from '../global';

type IProps = {
  node: PNode;
};

class Circle extends React.PureComponent<IProps> {
  render() {
    const { node } = this.props;
    const { id, dim } = node;
    const { cx, cy } = dim!;
    const { r } = dim! as CircleSize;

    return (
      <circle
        className={NodeClass}
        data-type={ElementType.Node}
        data-id={node.id}
        r={r}
        cx={r}
        cy={r}
        fill={'#999999'}
      />
    );
  }
}

export default Circle;
