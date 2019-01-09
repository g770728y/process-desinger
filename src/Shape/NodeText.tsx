import * as React from 'react';

type IProps = {
  w: number;
  h: number;
  text: string;
  fontSize?: number;
  iconSrc?: string;
};
class NodeText extends React.PureComponent<IProps> {
  render() {
    const { w, h, fontSize, text, iconSrc } = this.props;
    const _fontSize = fontSize || 16;

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
          x={w / 2}
          y={h / 2 + (_fontSize / 2 - 1)}
          fontSize={_fontSize}
        >
          {text}
        </text>
      </>
    );
  }
}

export default NodeText;
