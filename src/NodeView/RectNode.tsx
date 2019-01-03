import * as React from 'react';
import { PNode, RectSize } from '../index.type';
import { observer } from 'mobx-react';

type IProps = {
  node: PNode;
};

@observer
class RectNode extends React.Component<IProps> {
  render() {
    const { node } = this.props;
    const { dim } = node;
    const { cx, cy } = dim!;
    const w = (dim! as RectSize).w || 100;
    const h = (dim! as RectSize).h || 30;
    const x = cx - w / 2;
    const y = cy - h / 2;

    return <rect x={x} y={y} width={w} height={h} fill="#cccccc" />;
  }
}

export default RectNode;
