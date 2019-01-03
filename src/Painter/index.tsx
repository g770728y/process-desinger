import * as React from 'react';
import { inject, observer } from 'mobx-react';
import UIStore from '../store/UIStore';
import {
  Config,
  DesignData,
  PNode,
  PNodeTemplate,
  Shape,
  PEdge
} from '../index.type';
import RectNode from '../NodeView/RectNode';
import CircleNode from '../NodeView/CircleNode';
import { DefaultCanvasHeight } from '../global';
import EdgeView from '../EdgeView';
import Defs from './defs';

type IProps = {
  data: DesignData;
  uiStore?: UIStore;
  config?: Config;
};

@inject(({ uiStore, config }) => {
  return { uiStore, config };
})
@observer
export default class Painter extends React.Component<IProps> {
  getNodeView(node: PNode, nodeTemplate: PNodeTemplate) {
    if (nodeTemplate.shape === Shape.Rect) {
      return <RectNode key={node.id} node={node} />;
    } else if (nodeTemplate.shape === Shape.Circle) {
      return <CircleNode key={node.id} node={node} />;
    } else {
      throw new Error(`错误的nodeTemplate shape:${nodeTemplate.shape}`);
    }
  }

  getNodesView(nodes: PNode[], nodeTemplates: PNodeTemplate[]) {
    const vnodes = nodes.map(node => {
      const { templateId } = node;

      let nodeTemplate = nodeTemplates.find(t => {
        return t.id === templateId;
      });

      if (!nodeTemplate) {
        throw new Error(`未找到nodeTemplate: ${node}`);
      } else {
        return this.getNodeView(node, nodeTemplate);
      }
    });

    return vnodes;
  }

  getEdgesView(edges: PEdge[]) {
    return edges.map(edge => {
      return <EdgeView key={edge.id} edge={edge} />;
    });
  }

  render() {
    const { uiStore, data, config } = this.props;
    const { painterDim } = uiStore!;
    const { width, height } = painterDim;
    const { nodes, edges } = data;

    const { canvas, nodeTemplates } = config!;
    const background = canvas
      ? canvas.background || 'transparent'
      : 'transparent';

    const vnodes = this.getNodesView(nodes, nodeTemplates);
    const vedges = this.getEdgesView(edges);

    return (
      <svg
        width={`${width}`}
        height={`${DefaultCanvasHeight}`}
        viewBox={`0 0 ${width} ${DefaultCanvasHeight}`}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <Defs />
        {background !== 'transparent' && (
          <rect width="100%" height="100%" fill={background} />
        )}
        {vnodes}
        {vedges}
      </svg>
    );
  }
}
