import * as React from 'react';
import { PPosition } from '../index.type';
import { observer, inject } from 'mobx-react';
import DesignDataStore from '../store/DesignDataStore';

type IProps = PPosition & {
  dataStore?: DesignDataStore;
  hostType: 'node' | 'edge';
  hostId: number;
};

@inject(({ dataStore }) => ({ dataStore }))
@observer
class DeleteIcon extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
    this.delHost = this.delHost.bind(this);
  }

  delHost() {
    const { hostType, hostId, dataStore } = this.props;
    if (hostType === 'node') {
      dataStore!.delNode(hostId);
    } else if (hostType === 'edge') {
      dataStore!.delEdge(hostId);
    }
  }

  render() {
    const { cx, cy } = this.props;
    return (
      <g
        transform={`translate(${cx - 8}, ${cy - 8})`}
        style={{ cursor: 'pointer' }}
        onClick={this.delHost}
      >
        <circle r={8} fill="#fff" cx={8} cy={8} />
        <path
          d="M873.594739 873.716723a511.792629 511.792629 0 1 1 0-723.848188 511.792629 511.792629 0 0 1 0 723.848188z m-129.0826-543.313083a36.594954 36.594954 0 0 0-51.769662-51.720868l-181.120625 181.267005-181.145022-181.267005a36.594954 36.594954 0 0 0-51.745264 51.720868l181.120625 181.267005-181.120625 181.023039a36.594954 36.594954 0 0 0 51.745264 51.720868l181.145022-181.023038 181.120625 181.023038a36.594954 36.594954 0 0 0 51.769662-51.720868l-181.145022-181.023039z"
          fill="#d81e06"
          transform="scale(0.016)"
        />
      </g>
    );
  }
}

export default DeleteIcon;
