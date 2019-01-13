import * as React from 'react';
import { PNode, CircleSize, ElementType } from '../index.type';
import { observer, inject } from 'mobx-react';
import { NodeClass } from '../global';
import hoverable, { HoverableProps } from '../hoc/hoverable';
import DesignDataStore from '../store/DesignDataStore';
import { CircleGripGroup } from '../Grip';
import Circle from '../Shape/Circle';
import NodeText from '../Shape/NodeText';

type IProps = {
  node: PNode;
  dataStore?: DesignDataStore;
};

@inject(({ dataStore }) => ({ dataStore }))
@observer
class CircleNodeBase extends React.Component<IProps & HoverableProps> {
  render() {
    const { node: _node, dataStore, _ref, hovered } = this.props;
    const node = dataStore!.getNode(_node.id)!;
    const { id, dim, label } = node;
    const { cx, cy } = dim!;
    const r = (dim! as CircleSize).r || 30;
    const x = cx - r;
    const y = cy - r;

    const showGrip =
      hovered || ~(dataStore!.context.selectedNodeIds || []).indexOf(id);

    return (
      <g
        ref={_ref}
        transform={`translate(${x}, ${y})`}
        width={2 * r}
        height={2 * r}
        onClick={() => dataStore!.selectNode(id)}
      >
        <Circle node={node} />
        <NodeText w={2 * r} h={2 * r} text={label!} />
        {showGrip && <CircleGripGroup node={node} />}
      </g>
    );
  }
}

const CircleNode = hoverable<IProps>(CircleNodeBase);
export default CircleNode;
