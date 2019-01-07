import * as React from 'react';
import { PNode, RectSize, ElementType } from '../index.type';
import { observer, inject } from 'mobx-react';
import { NodeClass } from '../global';
import DesignDataStore from '../store/DesignDataStore';
import { RectGripGroup } from '../Grip';
import hoverable, { HoverableProps } from '../hoc/hoverable';
import Rect from '../Shape/Rect';

type IProps = {
  node: PNode;
  dataStore?: DesignDataStore;
};

@inject(({ dataStore }) => ({ dataStore }))
@observer
class RectNodeBase extends React.Component<IProps & HoverableProps> {
  render() {
    const { node, dataStore, _ref, hovered } = this.props;
    const { dim, id } = node;
    const { cx, cy } = dim!;
    const w = (dim! as RectSize).w || 100;
    const h = (dim! as RectSize).h || 30;
    const x = cx - w / 2;
    const y = cy - h / 2;

    const showGrip =
      hovered || ~(dataStore!.context.selectedNodeIds || []).indexOf(id);

    return (
      <g
        ref={_ref}
        transform={`translate(${x}, ${y})`}
        width={w}
        height={h}
        onClick={() => dataStore!.selectNode(id)}
      >
        <Rect node={node} />
        {showGrip && <RectGripGroup node={node} />}
      </g>
    );
  }
}

const RectNode = hoverable<IProps>(RectNodeBase);

export default RectNode;
