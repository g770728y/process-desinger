import * as React from 'react';
import { PPosition, PAnchorType } from '../index.type';
import { DefaultGripRadius } from '../global';

type IProps = PPosition & {
  p: PAnchorType;
  dataType: 'node' | 'edge';
  dataId: number;
};

class Grip extends React.Component<IProps> {
  render() {
    const { dataType, dataId, p, cx, cy } = this.props;
    return (
      <circle
        r={DefaultGripRadius}
        fill={'white'}
        stroke={'red'}
        strokeWidth={1}
        cx={cx}
        cy={cy}
        data-type={dataType}
        data-id={dataId}
        data-p={p}
      />
    );
  }
}

export default Grip;
