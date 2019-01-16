///////////////////// array /////////////////////////////////////////
export function flatten<T>(xss: T[][]): T[] {
  return xss.reduce((acc, xs) => [...acc, ...xs], []);
}

export function distinct<T>(xs: T[]): T[] {
  return xs.reduce((acc: T[], x: T) => {
    if (~acc.indexOf(x)) {
      return acc;
    } else {
      return [...acc, x];
    }
  }, []);
}

// minAbs(1,-1,3, -5) => -1 或 1
// minAbs(1,0, -1, 0) => 0
export function minAbs(xs: number[]): number {
  return xs.reduce((acc, x) => (Math.abs(x) < acc ? x : acc));
}

///////////////////// object /////////////////////////////////////////
// subtract({a:1, b:1}, {a:2, d:1}) = {b:1}
export function subtractByKey(m1: Object, m2: Object): Object {
  return Object.keys(m1).reduce(
    (acc, id) => (m2[id] !== undefined ? acc : { ...acc, [id]: m1[id] }),
    {}
  );
}

export function isEmpty(xs: any): boolean {
  return (
    xs == null ||
    xs == undefined ||
    (Array.isArray(xs) && xs.length <= 0) ||
    (typeof xs === 'string' && xs.length <= 0) ||
    (typeof xs === 'object' && Object.keys(xs).length <= 0)
  );
}

///////////////////// geo /////////////////////////////////////////
export function distance(
  xy1: { x: number; y: number },
  xy2: { x: number; y: number }
) {
  return Math.sqrt(Math.pow(xy2.x - xy1.x, 2) + Math.pow(xy2.y - xy1.y, 2));
}
