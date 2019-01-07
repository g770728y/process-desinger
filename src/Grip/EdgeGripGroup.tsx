import * as React from 'react';
import { PEdge, PAnchorType, ElementType, OrphanEdge } from '../index.type';
import { inject, observer } from 'mobx-react';
import DesignDataStore from '../store/DesignDataStore';
import Grip from './Grip';
import { distance } from '../util';

type IProps = {
  edge: PEdge;
  dataStore?: DesignDataStore;
};

@inject(({ dataStore }) => ({ dataStore }))
@observer
class EdgeGripGroup extends React.Component<IProps> {
  render() {
    const { edge, dataStore } = this.props;
    const { fromXY, toXY } = dataStore!.getEdgeEndPoints(edge.id);
    return [
      {
        anchor: '0' as PAnchorType,
        cx: 0,
        cy: 0
      },
      {
        anchor: '1' as PAnchorType,
        // cx: toXY.cx - fromXY.cx,
        // cy: toXY.cy - fromXY.cy
        cx: distance(
          { x: fromXY.cx, y: fromXY.cy },
          { x: toXY.cx, y: toXY.cy }
        ),
        cy: 0
      }
    ].map(item => (
      <Grip key={item.anchor} {...item} dataType={edge.type} dataId={edge.id} />
    ));
  }
}

export default EdgeGripGroup;
