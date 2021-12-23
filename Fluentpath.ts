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

  private readonly lastNPointers: { readonly x: number; readonly y: number }[] = [];
  private readonly points: [number, number][] = [];

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
  }

  add(point: { readonly x: number; readonly y: number }) {
    const { lastNPointers, points } = this;
    lastNPointers.unshift(point);
    if (lastNPointers.length === 1) {
      this.d = `M${point.x} ${point.y}v0`;
      points.push([point.x, point.y]);
    } else {
      lastNPointers.length > this.smoothingPointCount && lastNPointers.pop();
      const x = lastNPointers.reduce((x, p) => x + p.x, 0) / lastNPointers.length;
      const y = lastNPointers.reduce((y, p) => y + p.y, 0) / lastNPointers.length;
      const [x1, y1] = points[points.length - 1]!;
      const distance = Math.hypot(x1 - x, y1 - y);
      if (distance > this.distanceThreshold) {
        if (points.length > 3) {
          const [x3, y3] = points[points.length - 3]!;
          const [x2, y2] = points[points.length - 2]!;
          const r = Math.hypot(x1 - x2, y1 - y2) * this.inertiaFactor;
          const r2 = r / Math.hypot(x2 - x3, y2 - y3);
          const r1 = r / Math.hypot(x1 - x, y1 - y);
          this.d += `C${x2 + (x2 - x3) * r2} ${y2 + (y2 - y3) * r2} ${x1 + (x1 - x) * r1} ${y1 + (y1 - y) * r1} ${x1} ${y1}`;
        }
        points.push([x, y]);
      }
    }
    return this;
  }

  end(): this {
    const { path, points } = this;
    if (points.length > 3) {
      const pathLength = path.getTotalLength();
      const pathPoints: [number, number][] = [];
      const step = Math.max(0.2, Math.min(8, pathLength * 0.01));
      for (let i = 0; i < pathLength; i += step) {
        const { x, y } = path.getPointAtLength(i);
        pathPoints.push([x, y]);
      }
      const lastPoint = path.getPointAtLength(pathLength);
      pathPoints.push([lastPoint.x, lastPoint.y]);
      path.setAttribute('d', simplifySvgPath(pathPoints, { tolerance: this.tolerance, precision: this.precision }));
    }
    return this;
  }
}
