import * as React from 'react';
import { PEdge, ElementType } from '../index.type';
import { observer, inject } from 'mobx-react';
import DesignDataStore from '../store/DesignDataStore';
import { EdgeClass } from '../global';
import hoverable, { HoverableProps } from '../hoc/hoverable';
import EdgeGripGroup from '../Grip/EdgeGripGroup';

type IProps = {
  edge: PEdge;
  dataStore?: DesignDataStore;
};

@inject(({ dataStore }) => ({ dataStore }))
@observer
class EdgeViewBase extends React.Component<IProps & HoverableProps> {
  render() {
    const { edge, dataStore, hovered, _ref } = this.props;
    const { id } = edge;

    const { fromXY, toXY } = dataStore!.getEdgeEndPoints(id);

    const showGrip = ~(dataStore!.context.selectedEdgeIds || []).indexOf(id);
    const hided = dataStore!.context.hidedEdgeId === id;

    const xy = {
      x1: 0,
      y1: 0,
      x2: toXY.cx - fromXY.cx,
      y2: toXY.cy - fromXY.cy
    };

    const BgLayer = <line {...xy} strokeWidth={6} stroke="transparent" />;

    return (
      <g
        ref={_ref}
        transform={`translate(${fromXY.cx}, ${fromXY.cy})`}
        onClick={() => dataStore!.selectEdge(id)}
      >
        {BgLayer}
        <line
          className={EdgeClass}
          data-type={ElementType.Edge}
          data-id={id}
          stroke={hided ? '#dddddd' : '#999999'}
          markerEnd={'url(#arrow)'}
          {...xy}
        />
        {showGrip && <EdgeGripGroup edge={edge} />}
      </g>
    );
  }
}

const EdgeView = hoverable<IProps>(EdgeViewBase);
export default EdgeView;
