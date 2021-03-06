import * as React from 'react';
import { PEdge } from '../index.type';
import { observer, inject } from 'mobx-react';
import DesignDataStore from '../store/DesignDataStore';
import hoverable, { HoverableProps } from '../hoc/hoverable';
import EdgeGripGroup from '../Grip/EdgeGripGroup';
import NodeText from '../Shape/NodeText';
import DeleteIcon from '../icons/DeleteIcon';
import { getBezierEdge, getLineXY, getRotate, getLineEdge } from './helper';
import ConfigStore from '../store/ConfigStore';

type IProps = {
  edge: PEdge;
  dataStore?: DesignDataStore;
  configStore?: ConfigStore;
};

@inject(({ dataStore, configStore }) => ({ dataStore, configStore }))
@observer
class EdgeViewBase extends React.Component<IProps & HoverableProps> {
  render() {
    const { edge, dataStore, hovered, _ref, configStore } = this.props;
    const { id, from, to, flag } = edge;

    const isSelected =
      dataStore!.isSelectedEdge(id) && configStore!.mode !== 'update';

    const { fromXY, toXY } = dataStore!.getEdgeEndPoints(id);

    const showGrip = isSelected;
    const hided = dataStore!.context.hidedEdgeId === id;

    const xy = getLineXY(fromXY, toXY);

    const _rotate = getRotate(fromXY, toXY);
    const rotate = (_rotate + 360) % 360;

    const stroke = hided ? '#dddddd' : '#999999';

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

    const { bgLayer, layer } =
      (fromXY.cx === toXY.cx || fromXY.cy === toXY.cy) &&
      from.anchor !== to.anchor
        ? getLineEdge(edge, dataStore!, stroke)
        : getBezierEdge(edge, dataStore!, stroke);

    return (
      <g
        ref={_ref}
        transform={`translate(${fromXY.cx}, ${fromXY.cy}) rotate(${rotate})`}
        onClick={() => dataStore!.selectEdge(id)}
      >
        {/* {isSameSide ? BgLayerArc : BgLayerLine}
        {isSameSide ? layerArc : layerLine} */}
        {bgLayer}
        {layer}
        {flagText}
        {showGrip && <EdgeGripGroup edge={edge} />}
        {isSelected && (
          <DeleteIcon
            hostType={'edge'}
            hostId={id}
            cx={(xy.x2 - xy.x1) / 2}
            cy={16}
          />
        )}
      </g>
    );
  }
}

const EdgeView = hoverable<IProps>(EdgeViewBase);
export default EdgeView;
