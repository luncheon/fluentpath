import simplifySvgPath from '@luncheon/simplify-svg-path';

export interface FluentpathOptions {
  readonly smoothingPointCount: number;
  readonly distanceThreshold: number;
  readonly tolerance: number;
  readonly precision: number;
}

export class Fluentpath {
  readonly smoothingPointCount: number;
  readonly distanceThreshold: number;
  readonly tolerance: number;
  readonly precision: number;

  readonly points: [number, number][] = [];
  d = '';

  private readonly lastNPointers: { readonly x: number; readonly y: number }[] = [];
  private fixedPointIndex = 0;
  private fixedPath = '';
  private unfixedPath = '';

  private readonly F = (strings: readonly string[], ...values: readonly number[]) =>
    values.map((value, i) => strings[i] + value.toFixed(this.precision)).join('') + strings[strings.length - 1];

  constructor(options?: Partial<FluentpathOptions>) {
    this.smoothingPointCount = options?.smoothingPointCount ?? 4;
    this.distanceThreshold = options?.distanceThreshold ?? 4;
    this.tolerance = options?.tolerance ?? 2.5;
    this.precision = options?.precision ?? 5;
  }

  add(point: { readonly x: number; readonly y: number }) {
    const { F, lastNPointers, points, fixedPointIndex } = this;
    lastNPointers.unshift(point);
    if (lastNPointers.length === 1) {
      this.d = (this.fixedPath = F`M${point.x} ${point.y}`) + 'v0';
      points.push([point.x, point.y]);
      return this;
    }
    lastNPointers.length > this.smoothingPointCount && lastNPointers.pop();
    const x = lastNPointers.reduce((x, p) => x + p.x, 0) / lastNPointers.length;
    const y = lastNPointers.reduce((y, p) => y + p.y, 0) / lastNPointers.length;
    const [x1, y1] = points[points.length - 1]!;
    const distance = Math.hypot(x1 - x, y1 - y);
    if (distance < this.distanceThreshold) {
      return this;
    }
    if (points.length > 2) {
      const [x2, y2] = points[points.length - 2]!;
      if (points.length - fixedPointIndex > 8 && Math.abs(Math.atan2(y2 - y1, x2 - x1) - Math.atan2(y1 - y, x1 - x)) > 0.4) {
        this.end();
      } else {
        this.unfixedPath += F`L${x1} ${y1}`;
      }
    }
    this.d = this.fixedPath + this.unfixedPath + F`L${x} ${y}`;
    points.push([x, y]);
    return this;
  }

  end() {
    const { points, fixedPointIndex } = this;
    if (fixedPointIndex !== points.length - 1) {
      this.d = this.fixedPath += simplifySvgPath(points.slice(fixedPointIndex), this).replace(/^M\d+(\.\d+)?[, ]\d+(\.\d+)?/, '');
      this.fixedPointIndex = points.length - 1;
      this.unfixedPath = '';
    }
    return this;
  }
}
