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

///////////////////// geo /////////////////////////////////////////
export function distance(
  xy1: { x: number; y: number },
  xy2: { x: number; y: number }
) {
  return Math.sqrt(Math.pow(xy2.x - xy1.x, 2) + Math.pow(xy2.y - xy1.y, 2));
}
