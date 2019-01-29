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

// ([1,2,3], [3,4,5]) = [1,2]
export function subtract(xs1: any[], xs2: any[]): any[] {
  return xs1.filter(x1 => xs2.indexOf(x1) < 0);
}

export function uniq(xs: any[]): any[] {
  return xs.reduce((acc, x) => (~acc.indexOf(x) ? acc : [...acc, x]), []);
}

///////////////////// object /////////////////////////////////////////
// subtract({a:1, b:1}, {a:2, d:1}) = {b:1}
// export function subtractByKey(m1: Object, m2: Object): Object {
//   return Object.keys(m1).reduce(
//     (acc, id) => (m2[id] !== undefined ? acc : { ...acc, [id]: m1[id] }),
//     {}
//   );
// }

// subtract({a:1, b:1}, ['a','d]) = {b:1}
export function unpickAll<T = any>(m: T, keys: any[]): Partial<T> {
  return Object.keys(m).reduce(
    (acc, id) => (keys.indexOf(id) >= 0 ? acc : { ...acc, [id]: m[id] }),
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

// 设点 x,y, 在原始坐标系下 坐标 {x,y}
// 参考坐标系: {dx, dy, dAngle} 表示参考坐标系与原始坐标系的关系(注意是左手系)
// 返回: x,y 在 参考坐标系下的新坐标
// 算法来源: http://fex.baidu.com/blog/2014/05/coordinate-and-transform/
// 晕, 上述算法不适合. 只好换成自己推导的
export function coordinateTransform(
  x: number,
  y: number,
  dx: number,
  dy: number,
  dAngleDeg: number
) {
  const dAngle = (dAngleDeg * Math.PI) / 180;
  return {
    x: round(Math.cos(dAngle) * (x - dx) + Math.sin(dAngle) * (y - dy), 5),
    y: round(-Math.sin(dAngle) * (x - dx) + Math.cos(dAngle) * (y - dy), 5)
  };
}

// (100.11112, 3) => (100.111)
// (100.1115, 3) => (100.112)
export function round(x: number, f: number) {
  return Math.round(x * Math.pow(10, f)) / Math.pow(10, f);
}
