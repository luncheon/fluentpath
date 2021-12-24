import simplifySvgPath from '@luncheon/simplify-svg-path';

export interface FluentpathOptions {
  readonly smoothingPointCount: number;
  readonly distanceThreshold: number;
  readonly inertiaFactor: number;
  readonly tolerance: number;
  readonly precision: number;
}

export class Fluentpath {
  readonly smoothingPointCount: number;
  readonly distanceThreshold: number;
  readonly inertiaFactor: number;
  readonly tolerance: number;
  readonly precision: number;

  private wma?: [number, number];
  private readonly points: [number, number][] = [];

  private readonly round;

  private get d() {
    return this.path.getAttribute('d') ?? '';
  }
  private set d(d: string) {
    this.path.setAttribute('d', d);
  }

  constructor(readonly path: SVGPathElement, options?: Partial<FluentpathOptions>) {
    this.smoothingPointCount = options?.smoothingPointCount ?? 4;
    this.distanceThreshold = options?.distanceThreshold ?? 4;
    this.inertiaFactor = options?.inertiaFactor ?? 0.1;
    this.tolerance = options?.tolerance ?? 2.5;
    this.precision = options?.precision ?? 5;
    const e = 10 ** this.precision;
    this.round = (value: number) => Math.round(value * e) / e;
  }

  add({ x, y }: { readonly x: number; readonly y: number }) {
    const { points, wma } = this;
    if (wma) {
      const [x0, y0] = (this.wma = [(wma[0] + x) * 0.5, (wma[1] + y) * 0.5]);
      const [x1, y1] = points[points.length - 1]!;
      const d01 = Math.hypot(x0 - x1, y0 - y1);
      if (d01 > this.distanceThreshold) {
        if (points.length > 3) {
          const [x3, y3] = points[points.length - 3]!;
          const [x2, y2] = points[points.length - 2]!;
          const r = Math.hypot(x1 - x2, y1 - y2) * this.inertiaFactor;
          const r2 = r / Math.hypot(x2 - x3, y2 - y3);
          const r1 = r / d01;
          this.d += `C${x2 + (x2 - x3) * r2} ${y2 + (y2 - y3) * r2} ${x1 + (x1 - x0) * r1} ${y1 + (y1 - y0) * r1} ${x1} ${y1}`;
        }
        points.push([x0, y0]);
      }
    } else {
      this.d = `M${this.round(x)} ${this.round(y)}v0`;
      points.push((this.wma = [x, y]));
    }
    return this;
  }

  end(): this {
    const { path, points } = this;
    if (points.length > 4) {
      const pathLength = path.getTotalLength();
      const pathPoints: [number, number][] = [];
      const step = Math.max(0.2, Math.min(8, pathLength * 0.01));
      for (let i = 0; i < pathLength; i += step) {
        const { x, y } = path.getPointAtLength(i);
        pathPoints.push([x, y]);
      }
      const lastPoint = path.getPointAtLength(pathLength);
      pathPoints.push([lastPoint.x, lastPoint.y]);
      this.d = simplifySvgPath(pathPoints, { tolerance: this.tolerance, precision: this.precision });
    } else if (points.length > 1) {
      this.d = points
        .map(([x, y], i, points) =>
          i === 0 ? `M${this.round(x)} ${this.round(y)}` : `l${this.round(x - points[i - 1]![0])} ${this.round(y - points[i - 1]![1])}`,
        )
        .join();
    }
    return this;
  }
}
