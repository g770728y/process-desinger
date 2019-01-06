import * as React from 'react';
import { PPosition, PAnchorType, ElementType } from '../index.type';
import { DefaultGripRadius } from '../global';

type IProps = PPosition & {
  anchor: PAnchorType;
  dataType: ElementType;
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
        data-type={ElementType.Grip}
        data-host={`${dataType}:${dataId}:${anchor}`}
      />
    );
  }
}

export default Grip;
