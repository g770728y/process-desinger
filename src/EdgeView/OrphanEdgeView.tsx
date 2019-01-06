import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { OrphanEdge, ElementType } from '../index.type';
import { EdgeClass } from '../global';
import hoverable, { HoverableProps } from '../hoc/hoverable';
import DesignDataStore from '../store/DesignDataStore';
import EdgeGripGroup from '../Grip/EdgeGripGroup';
import OrphanEdgeGripGroup from '../Grip/OrphanEdgeGripGroup';

type IProps = {
  oedge: OrphanEdge;
  dataStore?: DesignDataStore;
};

@inject(({ dataStore }) => ({ dataStore }))
@observer
class OrphanEdgeViewBase extends React.Component<IProps & HoverableProps> {
  render() {
    const { oedge, _ref, hovered, dataStore } = this.props;
    const { id, from, to } = oedge;

    const showGrip =
      hovered || ~(dataStore!.context.selectedOrphanEdgeIds || []).indexOf(id);

    const xy = {
      x1: 0,
      y1: 0,
      x2: to.cx - from.cx,
      y2: to.cy - from.cy
    };

    const BgLayer = <line {...xy} strokeWidth={6} stroke="transparent" />;

    return (
      <g
        ref={_ref}
        transform={`translate(${from.cx}, ${from.cy})`}
        onClick={() => dataStore!.selectOrphanEdge(id)}
      >
        {BgLayer}
        <line
          className={EdgeClass}
          data-type={ElementType.OrphanEdge}
          data-id={id}
          {...xy}
          stroke="#999999"
          markerEnd={'url(#arrow)'}
        />
        {showGrip && <OrphanEdgeGripGroup oedge={oedge} />}
      </g>
    );
  }
}
const OrphanEdgeView = hoverable(OrphanEdgeViewBase);

export default OrphanEdgeView;
