import * as React from 'react';

type IProps = {
  w: number;
  h: number;
  rotate?: number;
  // 如果文本正好位于 矩形 正中,则offsetY=0
  // 象edge, 文本应该偏上, 所以 offsetY=-5
  offsetY?: number;
  text: string;
  fontSize?: number;
  iconSrc?: string;
};
class NodeText extends React.PureComponent<IProps> {
  render() {
    const { w, h, fontSize, text, iconSrc, rotate, offsetY } = this.props;
    const _fontSize = fontSize || 16;

    const x = w / 2;
    const y = h / 2 + (_fontSize / 2 - 1) + (offsetY || 0);

    return (
      <>
        {iconSrc && (
          <image
            xlinkHref={iconSrc}
            width={16}
            height={16}
            x={5}
            y={(h - 16) / 2}
          />
        )}
        <text
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          textAnchor={'middle'}
          transform={`translate(${x}, ${y}) rotate(${rotate || 0})`}
          fontSize={_fontSize}
        >
          {text}
        </text>
      </>
    );
  }
}

export default NodeText;
