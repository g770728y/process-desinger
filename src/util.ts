export function flatten<T>(xss: T[][]): T[] {
  return xss.reduce((acc, xs) => [...acc, ...xs], []);
}

export function distance(
  xy1: { x: number; y: number },
  xy2: { x: number; y: number }
) {
  return Math.sqrt(Math.pow(xy2.x - xy1.x, 2) + Math.pow(xy2.y - xy1.y, 2));
}
