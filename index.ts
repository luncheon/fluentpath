import { clientToSvgTransformer } from './clientToSvgTransformer';
import { fluentpath, FluentpathOptions } from './fluentpath';
import { handlePointerDrag } from './handlePointerDrag';

const findTargetSvg = (event: Event): [SVGSVGElement | null, Partial<FluentpathOptions>] => {
  const svgElement = (event.target as Element).closest<SVGSVGElement>('svg[data-fluentpath]');
  const options: Record<string, number> = {};
  const optionsString = svgElement?.getAttribute('data-fluentpath');
  if (optionsString) {
    for (const s of optionsString.split(';') ?? []) {
      const index = s.indexOf(':');
      const key = s
        .slice(0, index)
        .trim()
        .replace(/[a-zA-Z0-9_]-[a-z]/g, ($0) => $0[0] + $0[2]!.toUpperCase());
      key && (options[key] = +s.slice(index + 1).trim());
    }
  }
  return [svgElement, options];
};

const createCircle = (() => {
  const circleBase = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circleBase.setAttribute('stroke', 'none');
  circleBase.setAttribute('fill', 'red');
  circleBase.setAttribute('r', '3');
  circleBase.setAttribute('opacity', '0.2');
  circleBase.style.transition = 'opacity 8s ease-out';
  return (p: { readonly x: number; readonly y: number; readonly color?: string }) => {
    const circle = circleBase.cloneNode() as typeof circleBase;
    circle.setAttribute('cx', p.x as string & number);
    circle.setAttribute('cy', p.y as string & number);
    p.color && circle.setAttribute('fill', p.color);
    requestAnimationFrame(() => circle.setAttribute('opacity', '0.04'));
    setTimeout(() => circle.remove(), 16_000);
    return circle;
  };
})();

addEventListener(
  'pointerdown',
  (event) => {
    if (event.button !== 0) {
      return;
    }
    const [svgElement, fluentpathOptions] = findTargetSvg(event);
    if (!svgElement) {
      return;
    }
    const createsCircle = (document.getElementById('show-pointer-point') as HTMLInputElement).checked;
    const clientToSvg = clientToSvgTransformer(svgElement);

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const _addPoint = fluentpath(fluentpathOptions);
    const addPoint = (event: PointerEvent) => {
      const p = clientToSvg(event);
      createsCircle && svgElement.appendChild(createCircle({ x: p.x, y: p.y, color: 'blue' }));
      pathElement.setAttribute('d', _addPoint(p));
    };
    addPoint(event);

    svgElement.appendChild(pathElement).dispatchEvent(new CustomEvent('fluentpath:drawstart', { bubbles: true }));
    event.preventDefault();

    handlePointerDrag(event, {
      distanceThreshold: 4,
      onPointerMove: addPoint,
      onPointerUp: (event) => {
        addPoint(event);
        pathElement.dispatchEvent(new CustomEvent('fluentpath:drawend', { bubbles: true }));
      },
      onCancel: () => pathElement.remove(),
    });
  },
  { passive: false },
);

// iOS, iPadOS
if ('GestureEvent' in self) {
  // disable text selection loupe
  addEventListener('touchmove', (e) => e.touches.length === 1 && findTargetSvg(e)[0] && e.preventDefault(), { passive: false });
  // disable double tap zoom
  addEventListener('touchend', (e) => findTargetSvg(e)[0] && e.preventDefault(), { passive: false });
}
