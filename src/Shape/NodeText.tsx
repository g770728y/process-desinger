import * as React from 'react';

type IProps = {
  w: number;
  h: number;
  text: string;
  fontSize?: number;
};
class NodeText extends React.PureComponent<IProps> {
  render() {
    const { w, h, fontSize, text } = this.props;
    const _fontSize = fontSize || 16;

    return (
      <text
        style={{ pointerEvents: 'none' }}
        textAnchor={'middle'}
        x={w / 2}
        y={h / 2 + (_fontSize / 2 - 1)}
        fontSize={_fontSize}
      >
        {text}
      </text>
    );
  }
}

export default NodeText;
