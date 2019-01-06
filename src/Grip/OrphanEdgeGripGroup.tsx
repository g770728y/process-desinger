import * as React from 'react';
import { OrphanEdge, PAnchorType } from '../index.type';
import DesignDataStore from '../store/DesignDataStore';
import { inject, observer } from 'mobx-react';
import Grip from './Grip';

type IProps = {
  oedge: OrphanEdge;
  dataStore?: DesignDataStore;
};

@inject(({ dataStore }) => ({ dataStore }))
@observer
class OrphanEdgeGripGroup extends React.Component<IProps> {
  render() {
    const { oedge, dataStore } = this.props;
    const { from, to } = oedge;
    return [
      {
        anchor: '0' as PAnchorType,
        cx: 0,
        cy: 0
      },
      {
        anchor: '1' as PAnchorType,
        cx: to.cx - from.cx,
        cy: to.cy - from.cy
      }
    ].map(item => (
      <Grip
        key={item.anchor}
        {...item}
        dataType={oedge.type}
        dataId={oedge.id}
      />
    ));
  }
}

export default OrphanEdgeGripGroup;
