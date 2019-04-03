import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { OrphanEdge, ElementType } from '../index.type';
import { EdgeClass, isIE } from '../global';
import hoverable, { HoverableProps } from '../hoc/hoverable';
import DesignDataStore from '../store/DesignDataStore';
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
    const { fromXY, toXY } = dataStore!.getOrphanEdgeEndPoints(oedge.id);

    // 注意没有用上hovered(防止视觉上与node的grip混淆)
    const showGrip = ~(dataStore!.context.selectedOrphanEdgeIds || []).indexOf(
      oedge.id
    );

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
        onClick={() => dataStore!.selectOrphanEdge(oedge.id)}
      >
        {BgLayer}
        <line
          className={EdgeClass}
          data-type={ElementType.OrphanEdge}
          data-id={oedge.id}
          {...xy}
          stroke="#999999"
          markerEnd={isIE ? undefined : 'url(#arrow)'}
        />
        {showGrip && <OrphanEdgeGripGroup oedge={oedge} />}
      </g>
    );
  }
}

const OrphanEdgeView = hoverable(OrphanEdgeViewBase);

export default OrphanEdgeView;
