import simplifySvgPath from '@luncheon/simplify-svg-path';
import { Fluentpath } from './Fluentpath';

const findTargetSvg = (event: Event) => (event.target as Element).closest<SVGSVGElement>('svg[data-fluentpath]');

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
    const createSvgPoint = (event: { clientX: number; clientY: number }) =>
      new DOMPoint(event.clientX, event.clientY).matrixTransform(clientToSvgMatrix);

    const fluentpath = new Fluentpath({ distanceThreshold: 4 / scale }).add(createSvgPoint(event));
    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', fluentpath.d);

    const onPointerMove = (event: PointerEvent) => pathElement.setAttribute('d', fluentpath.add(createSvgPoint(event)).d);
    const onPointerUp = (event: PointerEvent) => {
      removeEventListeners();
      onPointerMove(event);
      const length = pathElement.getTotalLength();
      if (length !== 0) {
        const points: [number, number][] = [];
        const step = Math.max(0.2, Math.min(8, length * 0.01));
        for (let i = 0; i < length; i += step) {
          const { x, y } = pathElement.getPointAtLength(i);
          points.push([x, y]);
        }
        const last = pathElement.getPointAtLength(length);
        points.push([last.x, last.y]);
        pathElement.setAttribute('d', simplifySvgPath(points, { tolerance: 0.5 / scale, precision: scale > 2 ? 1 : 0 }));
      }
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
