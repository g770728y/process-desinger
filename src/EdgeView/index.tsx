import * as React from 'react';
import { PEdge } from '../index.type';
import { observer, inject } from 'mobx-react';
import { anchorXY } from '../helper';
import DesignDataStore from '../store/DesignDataStore';
import { EdgeClass, DataNodeType } from '../global';

type IProps = {
  edge: PEdge;
  dataStore?: DesignDataStore;
};

@inject(({ dataStore }) => ({ dataStore }))
@observer
class EdgeView extends React.Component<IProps> {
  render() {
    const { edge, dataStore } = this.props;
    const { id, from, to } = edge;

    const fromNode = dataStore!.nodes.find(({ id }) => id === from.id);
    const toNode = dataStore!.nodes.find(({ id }) => id === to.id);

    const fromXY = anchorXY(fromNode!, from.anchor);
    const toXY = anchorXY(toNode!, to.anchor);

    if (!fromNode || !toNode) {
      throw new Error('没有找到fromNode 或 toNode');
    }

    return (
      <line
        className={EdgeClass}
        data-type={DataNodeType}
        data-id={id}
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
