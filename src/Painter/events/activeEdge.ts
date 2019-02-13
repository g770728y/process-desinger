import { Observable, Subscription } from 'rxjs';
import DesignDataStore from '../../store/DesignDataStore';
import { map, filter } from 'rxjs/operators';
import { extractNodeAttrs } from './helper';
import { ElementType } from '../../index.type';
import ConfigStore from '../../store/ConfigStore';
import installEdgeFlagInput from '../../EdgeFlagInput';
import { DeleteFlag } from '../../global';

export function activeEdge(
  dblclick$: Observable<Event>,
  configStore: ConfigStore,
  dataStore: DesignDataStore
): Subscription {
  const dblclickEdge$ = dblclick$.pipe(
    map((e: MouseEvent) => ({
      x: e.clientX,
      y: e.clientY,
      ...extractNodeAttrs(e)
    })),
    filter(({ dataType, dataId }) => dataType === ElementType.Edge)
  );

  return dblclickEdge$.subscribe(({ x, y, dataType, dataId }) => {
    const edge = dataStore!.getEdge(dataId!)!;
    // 从起点开始的边不允许双击
    if (edge.from.id === dataStore!.startNode.id) {
      return;
    }

    const onActiveEdge = dataStore!.events!.onActiveEdge;
    const flags = dataStore!.getNode(edge.from.id)!.branchFlags!;

    if (onActiveEdge) {
      // 如果外界有传入回调方法, 那么执行之
      onActiveEdge!(dataId!, flags);
    } else {
      // 否则执行默认方法
      installEdgeFlagInput(flags, x, y, (flag: any) => {
        if (flag === DeleteFlag) {
          dataStore!.resetEdgeFlag(edge.id);
        } else if (flag) {
          dataStore!.patchEdge({ id: edge.id, flag });
        }
      });
    }
  });
}
