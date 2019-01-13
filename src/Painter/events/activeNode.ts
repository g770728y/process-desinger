import { Observable, Subscription } from 'rxjs';
import DesignDataStore from '../../store/DesignDataStore';
import { extractNodeAttrs } from './helper';
import { map, filter } from 'rxjs/operators';
import { ElementType } from '../../index.type';

export function activeNode(
  dblclick$: Observable<Event>,
  dataStore: DesignDataStore
):Subscription {
  const dblclickNode$ = dblclick$.pipe(
    map((e: MouseEvent) => extractNodeAttrs(e)),
    filter(({ dataType, dataId }) => dataType === ElementType.Node)
  );

  return dblclickNode$.subscribe(({ dataType, dataId }) => {
    if (
      dataStore!.startNode.id === dataId ||
      (dataStore!.endNode && dataStore!.endNode.id === dataId)
    ) {
      return;
    }
    const onActiveNode = dataStore!.events!.onActiveNode!;
    if (onActiveNode) onActiveNode(dataId!);
  });
}
