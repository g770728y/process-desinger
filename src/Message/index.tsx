import * as React from 'react';
import { inject, observer } from 'mobx-react';
import DesignDataStore from '../store/DesignDataStore';
import { isEmpty } from '../util';
import { toJS } from 'mobx';

interface IProps {
  dataStore?: DesignDataStore;
}

const styles: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  padding: 5,
  color: '#666'
};

@inject(({ dataStore }) => ({ dataStore }))
@observer
class Message extends React.Component<IProps> {
  render() {
    const { dataStore } = this.props;
    const { selectedEdgeIds, selectedNodeIds } = dataStore!.context;
    return isEmpty(toJS(selectedEdgeIds)) &&
      isEmpty(toJS(selectedNodeIds)) ? null : (
      <div style={styles}>提示: 双击编辑属性</div>
    );
  }
}

export default Message;
