export type Vector = number[];

export const Vec = {
  add: (...vecs: Vector[]): Vector =>
    vecs.reduce(([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2], [0, 0]),
  sub: (...vecs: Vector[]): Vector =>
    vecs.reduce(([x1, y1], [x2, y2]) => [x1 - x2, y1 - y2]),
  mulV: (...vecs: Vector[]): Vector =>
    vecs.reduce(([x1, y1], [x2, y2]) => [x1 * x2, y1 * y2], [1, 1]),
  mul: ([x, y]: Vector, n: number): Vector => [x * n, y * n],
  divV: (A: Vector, B: Vector): Vector => [A[0] / B[0], A[1] / B[1]],
};

export const toXY = ([x, y]: number[]) => ({ x, y });
