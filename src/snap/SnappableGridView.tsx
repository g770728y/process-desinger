import * as React from 'react';
import { inject, observer } from 'mobx-react';
import DesignDataStore from '../store/DesignDataStore';
import { SnappableGrid } from '../index.type';

type IProps = {
  dataStore?: DesignDataStore;
};

@inject(({ dataStore }) => ({ dataStore }))
@observer
class SnappableGridView extends React.Component<IProps> {
  snappableLine(p: 'x' | 'y', n: number) {
    if (p === 'x') {
      // 竖线
      return getLine(`x${n}`, n, -10000, n, 10000);
    } else {
      // 横线
      return getLine(`y${n}`, -10000, n, 10000, n);
    }
  }

  render() {
    const { dataStore } = this.props;
    const grid: SnappableGrid = dataStore!.context.snappableGrid || {};
    const { xs, ys } = grid;
    const xsView = xs ? xs.map(x => this.snappableLine('x', x)) : null;
    const ysView = ys ? ys.map(y => this.snappableLine('y', y)) : null;
    return (
      <>
        {xsView}
        {ysView}
      </>
    );
  }
}

export default SnappableGridView;

function getLine(k: string, x1: number, y1: number, x2: number, y2: number) {
  return (
    <line
      key={k}
      style={{ pointerEvents: 'none' }}
      x1={x1}
      x2={x2}
      y1={y1}
      y2={y2}
      stroke={'#1890ff'}
      strokeWidth={1}
      strokeDasharray={'2 1'}
    />
  );
}
