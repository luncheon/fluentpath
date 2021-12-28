import simplifySvgPath from '@luncheon/simplify-svg-path';

export interface FluentpathOptions {
  readonly distanceThreshold: number;
  readonly inertiaFactor: number;
  readonly tolerance: number;
  readonly precision: number;
}

export class Fluentpath {
  readonly distanceThreshold: number;
  readonly inertiaFactor: number;
  readonly tolerance: number;
  readonly precision: number;

  private readonly points: [number, number][] = [];
  private wma?: [number, number];
  private prev?: [number, number];
  private _d = '';

  constructor(readonly path: SVGPathElement, options?: Partial<FluentpathOptions>) {
    this.distanceThreshold = options?.distanceThreshold ?? 4;
    this.inertiaFactor = options?.inertiaFactor ?? 0.15;
    this.tolerance = options?.tolerance ?? 2.5;
    this.precision = options?.precision ?? 5;
  }

  add({ x, y }: { readonly x: number; readonly y: number }): this {
    const { path, points, prev, wma } = this;
    if (prev && Math.hypot(prev[0] - x, prev[1] - y) < this.distanceThreshold) {
      return this;
    }
    this.prev = [x, y];
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
          this._d += `C${x2 + (x2 - x3) * r2} ${y2 + (y2 - y3) * r2} ${x1 + (x1 - x0) * r1} ${y1 + (y1 - y0) * r1} ${x1} ${y1}`;
        }
        path.setAttribute('d', `${this._d}L${x0} ${y0}`);
        points.push([x0, y0]);
      }
    } else {
      const e = 10 ** this.precision;
      const round = (value: number) => Math.round(value * e) / e;
      path.setAttribute('d', `${(this._d = `M${round(x)} ${round(y)}`)}v0`);
      points.push((this.wma = [x, y]));
    }
    return this;
  }

  end(): this {
    const { path } = this;
    const pathLength = path.getTotalLength();
    if (pathLength !== 0) {
      const pathPoints: [number, number][] = [];
      const step = Math.max(0.2, Math.min(8, pathLength * 0.01));
      for (let i = 0; i < pathLength; i += step) {
        const p = path.getPointAtLength(i);
        pathPoints.push([p.x, p.y]);
      }
      const lastPoint = path.getPointAtLength(pathLength);
      pathPoints.push([lastPoint.x, lastPoint.y]);
      path.setAttribute('d', simplifySvgPath(pathPoints, { tolerance: this.tolerance, precision: this.precision }));
    }
    return this;
  }
}
