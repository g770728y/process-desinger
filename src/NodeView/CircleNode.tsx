import * as React from 'react';
import { PNode, CircleSize } from '../index.type';
import { observer } from 'mobx-react';
import { NodeClass, DataNodeType } from '../global';

type IProps = {
  node: PNode;
};

@observer
class CircleNode extends React.Component<IProps> {
  render() {
    const { node } = this.props;
    const { dim } = node;
    const { cx, cy } = dim!;
    const r = (dim! as CircleSize).r || 30;
    return (
      <circle
        className={NodeClass}
        data-type={DataNodeType}
        data-id={node.id}
        cx={cx}
        cy={cy}
        r={r}
        fill={'#999999'}
      />
    );
  }
}

export default CircleNode;
