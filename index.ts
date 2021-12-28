import { Fluentpath, FluentpathOptions } from './Fluentpath';

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
    const clientToSvgMatrix = svgElement.getScreenCTM()!.inverse();
    const createSvgPoint = (event: { clientX: number; clientY: number }) => {
      const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(clientToSvgMatrix);
      svgElement.appendChild(createCircle(p));
      return p;
    };

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const fluentpath = new Fluentpath(pathElement, fluentpathOptions).add(createSvgPoint(event));
    console.log(
      new Date().toISOString().replace(/.*T(.*)Z/, (_0, _1) => _1),
      fluentpath,
    );

    const onPointerMove = (event: PointerEvent) => {
      const { points } = fluentpath as unknown as { readonly points: readonly (readonly [number, number])[] };
      const pointCount = points.length;

      fluentpath.add(createSvgPoint(event));

      if (points.length > pointCount) {
        const [x, y] = points[points.length - 1]!;
        svgElement.appendChild(createCircle({ x, y, color: 'blue' }));
      }
    };
    const onPointerUp = (event: PointerEvent) => {
      removeEventListeners();
      fluentpath.add(createSvgPoint(event)).end();
      pathElement.dispatchEvent(new CustomEvent('fluentpath:drawend', { bubbles: true }));
    };
    const onKeyDown = (event: KeyboardEvent) => event.keyCode === 27 && cancel();
    const cancel = () => {
      removeEventListeners();
      pathElement.remove();
    };
    const removeEventListeners = () => {
      removeEventListener('pointerdown', cancel, true);
      removeEventListener('pointermove', onPointerMove);
      removeEventListener('pointerup', onPointerUp, true);
      removeEventListener('pointercancel', cancel, true);
      removeEventListener('keydown', onKeyDown);
    };

    // element.setPointerCapture() does not seem to work on Mobile Safari 14
    // so use window.addEventListener() instead
    addEventListener('pointerdown', cancel, true);
    addEventListener('pointermove', onPointerMove);
    addEventListener('pointerup', onPointerUp, true);
    addEventListener('pointercancel', cancel, true);
    addEventListener('keydown', onKeyDown);

    svgElement.appendChild(pathElement).dispatchEvent(new CustomEvent('fluentpath:drawstart', { bubbles: true }));
    event.preventDefault();
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
