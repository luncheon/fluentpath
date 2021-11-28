export interface FluentpathOptions {
  readonly smoothingPointCount: number;
  readonly distanceThreshold: number;
}

const F = (ss: readonly string[], ...values: readonly number[]) =>
  values.map((value, i) => ss[i] + value.toFixed(3)).join('') + ss[ss.length - 1];

export class Fluentpath {
  private readonly lastNPointers: DOMPoint[] = [];
  readonly points: [number, number][] = [];
  readonly smoothingPointCount: number;
  readonly distanceThreshold: number;
  private _d = '';
  d = '';

  constructor(options: Partial<FluentpathOptions> = {}) {
    this.smoothingPointCount = options.smoothingPointCount ?? 4;
    this.distanceThreshold = options.distanceThreshold ?? 4;
  }

  add(point: DOMPoint) {
    const { lastNPointers, points } = this;
    lastNPointers.unshift(point);
    if (lastNPointers.length === 1) {
      this.d = F`M${point.x} ${point.y}v0`;
      points.push([point.x, point.y]);
    } else {
      lastNPointers.length > this.smoothingPointCount && lastNPointers.pop();
      const x = lastNPointers.reduce((x, p) => x + p.x, 0) / lastNPointers.length;
      const y = lastNPointers.reduce((y, p) => y + p.y, 0) / lastNPointers.length;
      const [x1, y1] = points[points.length - 1]!;
      const distance = Math.hypot(x1 - x, y1 - y);
      if (distance > this.distanceThreshold) {
        if (points.length === 1) {
          this._d = F`M${x1} ${y1}`;
        } else if (points.length > 3) {
          const [x3, y3] = points[points.length - 3]!;
          const [x2, y2] = points[points.length - 2]!;
          const r = Math.hypot(x1 - x2, y1 - y2) * 0.15;
          const r2 = r / Math.hypot(x2 - x3, y2 - y3);
          const r1 = r / Math.hypot(x1 - x, y1 - y);
          this._d += F`C${x2 + (x2 - x3) * r2} ${y2 + (y2 - y3) * r2} ${x1 + (x1 - x) * r1} ${y1 + (y1 - y) * r1} ${x1} ${y1}`;
        }
        this.d = this._d + F`L${x} ${y}`;
        points.push([x, y]);
      }
    }
    return this;
  }
}
