import { Fluentpath } from './Fluentpath';

const findTargetSvg = (event: Event) => (event.target as Element).closest<SVGSVGElement>('svg[data-fluentpath]');
const inertiaFactor = +new URLSearchParams(location.search).get('inertia')! || 0.15;
const createCircle = (() => {
  const circleBase = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circleBase.setAttribute('stroke', 'none');
  circleBase.setAttribute('fill', 'red');
  circleBase.setAttribute('r', '3');
  circleBase.setAttribute('opacity', '0.2');
  circleBase.style.transition = 'opacity 8s ease-out';
  return (p: { readonly x: number; readonly y: number }) => {
    const circle = circleBase.cloneNode() as typeof circleBase;
    circle.setAttribute('cx', p.x as string & number);
    circle.setAttribute('cy', p.y as string & number);
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
    const svgElement = findTargetSvg(event);
    if (!svgElement) {
      return;
    }
    const scale = svgElement.getCTM()!.a * visualViewport.scale;
    const clientToSvgMatrix = svgElement.getScreenCTM()!.inverse();
    const createSvgPoint = (event: { clientX: number; clientY: number }) => {
      const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(clientToSvgMatrix);
      svgElement.appendChild(createCircle(p));
      return p;
    };

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const fluentpath = new Fluentpath(pathElement, {
      distanceThreshold: 4 / scale,
      tolerance: 1 / scale,
      precision: scale > 2 ? 2 : 1,
      inertiaFactor,
    }).add(createSvgPoint(event));

    const onPointerMove = (event: PointerEvent) => fluentpath.add(createSvgPoint(event));
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
  addEventListener('touchmove', (e) => e.touches.length === 1 && findTargetSvg(e) && e.preventDefault(), { passive: false });
  // disable double tap zoom
  addEventListener('touchend', (e) => findTargetSvg(e) && e.preventDefault(), { passive: false });
}
