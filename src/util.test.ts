import { coordinateTransform, round } from './util';
it('coordinateTransform', () => {
  expect(coordinateTransform(0, 0, 0, 0, 0)).toEqual({ x: 0, y: 0 });

  expect(coordinateTransform(1, 1, 0, 0, 0)).toEqual({ x: 1, y: 1 });
  expect(coordinateTransform(1, 1, 1, 1, 0)).toEqual({ x: 0, y: 0 });
  expect(coordinateTransform(1, 1, 2, 1, 0)).toEqual({ x: -1, y: 0 });
  expect(coordinateTransform(1, 1, 10, 10, 0)).toEqual({ x: -9, y: -9 });
  expect(coordinateTransform(1, 1, -1, 1, 0)).toEqual({ x: 2, y: 0 });

  expect(coordinateTransform(1, 1, 0, 0, 45)).toEqual({
    x: 1.41421,
    y: 0
  });
  expect(coordinateTransform(1, 1, 0, 0, 90)).toEqual({ x: 1, y: -1 });
  expect(coordinateTransform(1, 1, 0, 0, 180)).toEqual({ x: -1, y: -1 });
  expect(coordinateTransform(1, 1, 0, 0, 270)).toEqual({ x: -1, y: 1 });
  expect(coordinateTransform(1, 1, 0, 0, 360)).toEqual({ x: 1, y: 1 });

  expect(coordinateTransform(1, 1, 1, 1, 45)).toEqual({ x: 0, y: 0 });
  expect(coordinateTransform(1, 1, 1, 1, 90)).toEqual({ x: 0, y: 0 });
});

it('round', () => {
  expect(round(100.11113, 3)).toEqual(100.111);
  expect(round(100.1115, 3)).toEqual(100.112);
});
