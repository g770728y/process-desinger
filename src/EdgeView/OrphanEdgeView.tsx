import * as React from 'react';
import { observer } from 'mobx-react';
import { OrphanEdge } from '../index.type';
import { EdgeClass, DataOrphanEdgeType } from '../global';

type IProps = {
  oedge: OrphanEdge;
};

@observer
class OrphanEdgeView extends React.Component<IProps> {
  render() {
    const { oedge } = this.props;
    const { id, from, to } = oedge;

    return (
      <line
        className={EdgeClass}
        data-type={DataOrphanEdgeType}
        data-id={id}
        x1={from.cx}
        y1={from.cy}
        x2={to.cx}
        y2={to.cy}
        stroke="#999999"
        markerEnd={'url(#arrow)'}
      />
    );
  }
}

export default OrphanEdgeView;
