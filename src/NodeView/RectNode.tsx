import * as React from 'react';
import { PNode, RectSize, ElementType } from '../index.type';
import { observer, inject } from 'mobx-react';
import { NodeClass } from '../global';
import DesignDataStore from '../store/DesignDataStore';
import { RectGripGroup } from '../Grip';
import hoverable, { HoverableProps } from '../hoc/hoverable';
import Rect from '../Shape/Rect';
import NodeText from '../Shape/NodeText';
import DeleteIcon from '../icons/DeleteIcon';
import ConfigStore from '../store/ConfigStore';

type IProps = {
  node: PNode;
  dataStore?: DesignDataStore;
  configStore?: ConfigStore;
};

@inject(({ dataStore, configStore }) => ({ dataStore, configStore }))
@observer
class RectNodeBase extends React.Component<IProps & HoverableProps> {
  render() {
    const { node, dataStore, _ref, hovered } = this.props;
    const { dim, id, label, iconSrc } = node;
    const { cx, cy } = dim!;
    const w = (dim! as RectSize).w || 100;
    const h = (dim! as RectSize).h || 30;
    const x = cx - w / 2;
    const y = cy - h / 2;

    const isSelected = dataStore!.isSelectedNode(id);
    const showGrip = hovered || isSelected;

    const isStart = dataStore!.startNode && dataStore!.startNode.id === node.id;
    const isEnd = dataStore!.endNode && dataStore!.endNode.id === node.id;
    const showDeleteIcon =
      !isStart &&
      !isEnd &&
      isSelected &&
      this.props.configStore!.mode !== 'update';

    return (
      <g
        ref={_ref}
        transform={`translate(${x}, ${y})`}
        width={w}
        height={h}
        onClick={() => dataStore!.selectNode(id)}
      >
        <Rect node={node} />
        <NodeText w={w} h={h} text={label!} iconSrc={iconSrc} />
        {showGrip && <RectGripGroup node={node} />}
        {showDeleteIcon && (
          <DeleteIcon hostType={'node'} hostId={id} cx={w - 10} cy={10} />
        )}
      </g>
    );
  }
}

const RectNode = hoverable<IProps>(RectNodeBase);

export default RectNode;
