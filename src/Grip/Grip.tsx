import * as React from 'react';
import { Position, PAnchorType } from '../index.type';
import { DefaultGripRadius } from '../global';

type IProps = Position & {
  p: PAnchorType;
  dataType: 'node' | 'edge';
  dataId: number;
};

class Grip extends React.Component<IProps> {
  render() {
    return (
      <circle
        r={DefaultGripRadius}
        fill={'white'}
        stroke={'red'}
        strokeWidth={1}
        {...this.props}
      />
    );
  }
}

export default Grip;
