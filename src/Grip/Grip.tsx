import * as React from 'react';
import { PPosition, PAnchorType } from '../index.type';
import { DefaultGripRadius, GripType } from '../global';

type IProps = PPosition & {
  anchor: PAnchorType;
  dataType: 'node' | 'edge';
  dataId: number;
};

class Grip extends React.Component<IProps> {
  render() {
    const { dataType, dataId, anchor, cx, cy } = this.props;
    return (
      <circle
        r={DefaultGripRadius}
        fill={'white'}
        stroke={'red'}
        strokeWidth={1}
        cx={cx}
        cy={cy}
        data-type={GripType}
        data-host={`${dataType}:${dataId}:${anchor}`}
      />
    );
  }
}

export default Grip;
