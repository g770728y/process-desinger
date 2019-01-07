import { PAnchorType, SnappableGrid, PBox } from '../../index.type';
import { minAbs } from '../../util';

// 抽取画布内node的数据属性
export function extractNodeAttrs(e: MouseEvent) {
  const el = e.target! as HTMLElement;
  const dataId = el.getAttribute('data-id');

  return {
    dataType: el.getAttribute('data-type') || undefined,
    dataId: dataId ? parseInt(dataId) : undefined
  };
}

// 抽取画布内grip的数据属性
export function extractGripAttrs(e: MouseEvent) {
  const el = e.target! as HTMLElement;
  const dataHost = el.getAttribute('data-host');
  const host = hostInfo(dataHost);

  return {
    dataType: el.getAttribute('data-type') || undefined,
    dataHost: host
  };
}

// _N代表 x, y,_ABS_DN代表dx/dy绝对值,  _DN代表 dx,dy
type _N = number;
type _ABS_DN = number;
type _DN = number;

export type SnapInfo = {
  xs: [_N, _ABS_DN, _DN][];
  ys: [_N, _ABS_DN, _DN][];
};

// box 一共有6根需要捕捉的边, 从snappableGrid中找到最近的
export function findClosestSnappableInfo(
  snappableGrid: SnappableGrid,
  box: PBox,
  threshold: number
): SnapInfo {
  const { x: x0, y: y0, w, h } = box;
  const _xs = (snappableGrid.xs || []).reduce(
    (acc: [_N, _ABS_DN, _DN][], x) => {
      const dx = minAbs([x - x0, x - (w / 2 + x0), x - (w + x0)]);
      if (Math.abs(dx) <= threshold) {
        return [...acc, [x, Math.abs(dx), dx]];
      } else {
        return acc;
      }
    },
    []
  ) as [_N, _ABS_DN, _DN][];
  const _ys = (snappableGrid.ys || []).reduce(
    (acc: [_N, _ABS_DN, _DN][], y) => {
      const dy = minAbs([y - y0, y - (y0 + h / 2), y - (y0 + h)]);
      if (Math.abs(dy) <= threshold) {
        return [...acc, [y, Math.abs(dy), dy]];
      } else {
        return acc;
      }
    },
    []
  ) as [_N, _ABS_DN, _DN][];

  // 仅保留dx/dy最小的(可能有多个)
  return {
    xs: _xs.length <= 0 ? [] : _reserveMins(_xs),
    ys: _ys.length <= 0 ? [] : _reserveMins(_ys)
  };

  function _reserveMins(ns: [_N, _ABS_DN, _DN][]) {
    const _ns = ns.sort((a, b) => a[1] - b[1]);
    const [_n, _min_dn] = _ns[0];
    return _ns.filter(([n, abs_dn]) => abs_dn <= _min_dn);
  }
}

// export function trySnap(
//   snappableGrid: SnappableGrid,
//   box: PBox,
//   threshold: number
// ): { dx: number; dy: number } {}

function hostInfo(dataHost: string | null) {
  if (!dataHost) return undefined;

  const [dataType, dataId, anchor] = dataHost.split(':');
  return {
    type: dataType,
    id: parseInt(dataId),
    anchor: anchor as PAnchorType
  };
}
