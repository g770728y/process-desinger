import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { PNodeTemplate, PNode, OrphanNodeInfo } from '../index.type';
import { renderNodeTemplate } from '../helper';
import { fromEvent, Subscription } from 'rxjs';
import { map, throttleTime, takeUntil, switchMap, take } from 'rxjs/operators';
import UIStore from '../store/UIStore';

type IProps = {
  uiStore?: UIStore;
  nodeTemplate: PNodeTemplate;
};

@inject(({ uiStore }) => ({ uiStore }))
@observer
class NodeTemplateItem extends React.Component<IProps> {
  ref = React.createRef<SVGSVGElement>();

  dragSubs: Subscription;
  dropSubs: Subscription;

  constructor(props: IProps) {
    super(props);
    this.showOrphanNode = this.showOrphanNode.bind(this);
    this.hideOrphanNode = this.hideOrphanNode.bind(this);
  }

  showOrphanNode(orphanNodeInfo: OrphanNodeInfo) {
    this.props.uiStore!.showOrphanNode(orphanNodeInfo);
  }

  hideOrphanNode() {}

  componentDidMount() {
    const el = this.ref.current!;
    const body = document.body;
    const mousedown$ = fromEvent(el, 'mousedown');
    const mousemove$ = fromEvent(body, 'mousemove');
    const mouseup$ = fromEvent(body, 'mouseup');

    const drag$ = mousedown$.pipe(
      map((e: MouseEvent) => ({ x0: e.clientX, y0: e.clientY, end: false })),
      switchMap((pos: MouseEventData) =>
        mousemove$.pipe(
          map((e: MouseEvent) => ({ ...pos, x: e.clientX, y: e.clientY })),
          throttleTime(30),
          takeUntil(mouseup$)
        )
      )
    );

    const drop$ = drag$.pipe(
      switchMap((pos: MouseEventData) =>
        mouseup$.pipe(
          map((e: MouseEvent) => pos),
          take(1)
        )
      )
    );

    drag$.subscribe((pos: MouseEventData) => {
      this.showOrphanNode({
        node: this.props.nodeTemplate as PNode,
        cx: pos.x!,
        cy: pos.y!
      });
    });
    drop$.subscribe((pos: MouseEventData) => {
      console.log('hide orphan node', pos);
      this.hideOrphanNode();
    });
  }

  componnetWillUnmount() {
    this.dragSubs.unsubscribe();
    this.dropSubs.unsubscribe();
  }

  render() {
    const { nodeTemplate } = this.props;
    const { id } = nodeTemplate;

    let svg: React.ReactNode = renderNodeTemplate(nodeTemplate, this.ref);

    return <div key={id}>{svg}</div>;
  }
}

export default NodeTemplateItem;

interface MouseEventData {
  x0?: number;
  y0?: number;
  x?: number;
  y?: number;
  end?: boolean;
}
