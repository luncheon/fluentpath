export interface FluentpathOptions {
  readonly precision?: number;
  readonly smooth?: (p: Point) => Point;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

const INERTIA_FACTOR = 1 / 6;

export const cubicBezier = (
  /* past   */ { x: x3, y: y3 }: Point,
  /* from   */ { x: x2, y: y2 }: Point,
  /* to     */ { x: x1, y: y1 }: Point,
  /* future */ { x: x0, y: y0 }: Point,
): [number, number, number, number, number, number] => {
  const r = Math.hypot(x1 - x2, y1 - y2) * INERTIA_FACTOR;
  const r2 = r / Math.hypot(x2 - x3, y2 - y3);
  const r1 = r / Math.hypot(x0 - x1, y0 - y1);
  return [x2 + (x2 - x3) * r2, y2 + (y2 - y3) * r2, x1 + (x1 - x0) * r1, y1 + (y1 - y0) * r1, x1, y1];
};

export const cubicBezierString = (past: Point, from: Point, to: Point, future: Point, round: (value: number) => number) =>
  'C' + cubicBezier(past, from, to, future).map(round).join(' ');

export const exponentialMovingAveragePoint = (multiplier: number) => {
  let wma: Point | undefined;
  return (p: Point) =>
    (wma = wma === undefined ? p : { x: wma.x * (1 - multiplier) + p.x * multiplier, y: wma.y * (1 - multiplier) + p.y * multiplier });
};

export const fluentpath = ({ precision = 5, smooth = exponentialMovingAveragePoint(0.75) }: FluentpathOptions = {}) => {
  let d = '';
  const points: Point[] = [];
  const e = 10 ** precision;
  const round = (value: number) => Math.round(value * e) / e;
  return (p: Point, last?: boolean) => {
    const len = points.length;
    const p1 = smooth(p);
    const p2 = points[len - 1];
    const p3 = points[len - 2];
    const p4 = points[len - 3];
    points.push(p1);
    if (!p2) {
      return `${(d = `M${round(p1.x)} ${round(p1.y)}`)}v0`;
    }
    if (!p3) {
      return last ? `${d}l${round(p.x - p2.x)} ${round(p.y - p2.y)}` : `${d}l${round(p1.x - p2.x)} ${round(p1.y - p2.y)}`;
    }
    if (p4) {
      d += cubicBezierString(p4, p3, p2, p1, round);
    }
    const temp = d + cubicBezierString(p3, p2, p1, p, round);
    return last ? temp + cubicBezierString(p2, p1, p, { x: p.x + p.x - p1.x, y: p.y + p.y - p1.y }, round) : temp;
  };
};
