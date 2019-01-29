import * as React from 'react';
import { PPosition, PAnchorType, ElementType } from '../index.type';
import { DefaultGripRadius, GripSnapThreshold } from '../global';
import hoverable, { HoverableProps } from '../hoc/hoverable';

type IProps = PPosition & {
  anchor: PAnchorType;
  dataType: ElementType;
  dataId: number;
};

class GripBase extends React.Component<IProps & HoverableProps> {
  render() {
    const { hovered, dataType, _ref, dataId, anchor, cx, cy } = this.props;

    return (
      <g ref={_ref} transform={`translate(${cx}, ${cy})`}>
        <circle
          style={{ cursor: 'crosshair' }}
          r={GripSnapThreshold}
          fill={'transparent'}
          cx={0}
          cy={0}
        />
        <circle
          style={{ cursor: 'crosshair' }}
          r={hovered ? GripSnapThreshold : DefaultGripRadius}
          fill={hovered ? 'url(#radialGradient)' : 'white'}
          stroke={hovered ? 'transparent' : 'red'}
          strokeWidth={1}
          cx={0}
          cy={0}
          data-type={ElementType.Grip}
          data-host={`${dataType}:${dataId}:${anchor}`}
        />
      </g>
    );
  }
}

const Grip = hoverable(GripBase);

export default Grip;
