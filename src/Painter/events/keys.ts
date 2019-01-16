import { Observable, Subscription } from 'rxjs';
import DesignDataStore from '../../store/DesignDataStore';
import isHotkey from 'is-hotkey';

export function keydown(
  keydown$: Observable<Event>,
  dataStore: DesignDataStore
): Subscription {
  return keydown$.subscribe((e: KeyboardEvent) => {
    if (isHotkey('esc', e)) {
      dataStore!.unselectAll();
    } else if (isHotkey(['del', 'backspace'], e)) {
      // dataStore!.delSelected();
    }
  });
}
