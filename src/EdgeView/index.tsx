import * as React from 'react';
import { PNode, PEdge, DesignData, Config } from '../index.type';
import { observer, inject } from 'mobx-react';
import { anchorXY } from '../helper';

type IProps = {
  edge: PEdge;
  data?: DesignData;
  config?: Config;
};

@inject(({ data, config }) => ({ data, config }))
@observer
class EdgeView extends React.Component<IProps> {
  render() {
    const { edge, data, config } = this.props;
    const { id, from, to } = edge;

    const { nodeTemplates } = config!;

    const fromNode = data!.nodes.find(({ id }) => id === from.id);
    const toNode = data!.nodes.find(({ id }) => id === to.id);

    const fromXY = anchorXY(fromNode!, from.anchor, nodeTemplates);
    const toXY = anchorXY(toNode!, to.anchor, nodeTemplates);

    if (!fromNode || !toNode) {
      throw new Error('没有找到fromNode 或 toNode');
    }

    return (
      <line
        x1={fromXY.x}
        y1={fromXY.y}
        x2={toXY.x}
        y2={toXY.y}
        stroke="#999999"
        markerEnd={'url(#arrow)'}
      />
    );
  }
}

export default EdgeView;
