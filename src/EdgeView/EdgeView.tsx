import * as React from 'react';
import { PEdge, ElementType } from '../index.type';
import { observer, inject } from 'mobx-react';
import DesignDataStore from '../store/DesignDataStore';
import { EdgeClass } from '../global';
import hoverable, { HoverableProps } from '../hoc/hoverable';
import EdgeGripGroup from '../Grip/EdgeGripGroup';
import { distance } from '../util';
import NodeText from '../Shape/NodeText';

type IProps = {
  edge: PEdge;
  dataStore?: DesignDataStore;
};

@inject(({ dataStore }) => ({ dataStore }))
@observer
class EdgeViewBase extends React.Component<IProps & HoverableProps> {
  render() {
    const { edge, dataStore, hovered, _ref } = this.props;
    const { id, from, to, flag } = edge;

    const { fromXY, toXY } = dataStore!.getEdgeEndPoints(id);

    const showGrip = ~(dataStore!.context.selectedEdgeIds || []).indexOf(id);
    const hided = dataStore!.context.hidedEdgeId === id;

    const xy = {
      x1: 0,
      y1: 0,
      x2: distance({ x: fromXY.cx, y: fromXY.cy }, { x: toXY.cx, y: toXY.cy }),
      y2: 0
    };

    const _rotate =
      (Math.atan2(toXY.cy - fromXY.cy, toXY.cx - fromXY.cx) * 180) / Math.PI;
    const rotate = (_rotate + 360) % 360;

    const stroke = hided ? '#dddddd' : '#999999';

    // 线
    const BgLayerLine = (
      <line
        {...xy}
        data-type={ElementType.Edge}
        data-id={id}
        strokeWidth={10}
        stroke="transparent"
      />
    );
    const layerLine = (
      <line
        className={EdgeClass}
        stroke={stroke}
        markerEnd={'url(#arrow)'}
        {...xy}
        style={{ pointerEvents: 'none' }}
      />
    );

    // 如果两个端点分别在两个节点的同侧, 则画为曲线
    const BgLayerArc = (
      <path
        d={`M${xy.x1},${xy.y1} Q${xy.x2 / 2},${xy.x2 / 5},${xy.x2},${xy.y2}`}
        data-type={ElementType.Edge}
        data-id={id}
        fill="none"
        strokeWidth={10}
        stroke="transparent"
      />
    );

    const layerArc = (
      <path
        d={`M${xy.x1},${xy.y1} Q${xy.x2 / 2},${xy.x2 / 5},${xy.x2},${xy.y2}`}
        markerEnd={'url(#arrow)'}
        fill="none"
        stroke={stroke}
      />
    );

    const flagText = !!flag && (
      <NodeText
        fontSize={12}
        w={xy.x2 - xy.x1}
        h={xy.y2 - xy.y1}
        text={flag}
        rotate={rotate > 90 && rotate < 270 ? 180 : 0}
        offsetY={-5}
      />
    );

    const isSameSide =
      (from.anchor === 'lc' && to.anchor === 'lc') ||
      (from.anchor === 'rc' && to.anchor === 'rc');
    return (
      <g
        ref={_ref}
        transform={`translate(${fromXY.cx}, ${fromXY.cy}) rotate(${rotate})`}
        onClick={() => dataStore!.selectEdge(id)}
      >
        {isSameSide ? BgLayerArc : BgLayerLine}
        {isSameSide ? layerArc : layerLine}
        {flagText}
        {showGrip && <EdgeGripGroup edge={edge} />}
      </g>
    );
  }
}

const EdgeView = hoverable<IProps>(EdgeViewBase);
export default EdgeView;
