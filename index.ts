import simplifySvgPath from '@luncheon/simplify-svg-path';

const findTargetSvg = (event: Event) => (event.target as Element).closest<SVGSVGElement>('svg[data-fluentpath]');

addEventListener('pointerdown', (event) => {
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
  const distanceThreshold = 4 / scale;

  const p = createSvgPoint(event);
  const lastNPointers = [p];
  const points = [[p.x, p.y] as const];
  let d = `M${p.x} ${p.y}v0`;

  const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathElement.setAttribute('d', d);

  const onPointerMove = (event: PointerEvent) => {
    lastNPointers.unshift(createSvgPoint(event));
    lastNPointers.length === 5 && lastNPointers.pop();
    const x = lastNPointers.reduce((x, p) => x + p.x, 0) / lastNPointers.length;
    const y = lastNPointers.reduce((y, p) => y + p.y, 0) / lastNPointers.length;
    const [x1, y1] = points[points.length - 1]!;
    const distance = Math.hypot(x1 - x, y1 - y);
    if (distance > distanceThreshold) {
      if (points.length === 1) {
        pathElement.setAttribute('d', (d = `M${x1} ${y1}L${x} ${y}`));
      } else if (points.length > 3) {
        const [x3, y3] = points[points.length - 3]!;
        const [x2, y2] = points[points.length - 2]!;
        const a1 = Math.atan2(y2 - y3, x2 - x3);
        const a2 = Math.atan2(y1 - y, x1 - x);
        const r = Math.hypot(x1 - x2, y1 - y2) * 0.15;
        pathElement.setAttribute(
          'd',
          (d += `C${x2 + r * Math.cos(a1)} ${y2 + r * Math.sin(a1)} ${x1 + r * Math.cos(a2)} ${y1 + r * Math.sin(a2)} ${x1} ${y1}`),
        );
      }
      points.push([x, y]);
    }
  };
  const onPointerUp = (event: PointerEvent) => {
    removeEventListeners();
    onPointerMove(event);
    if (points.length > 3) {
      const points: [number, number][] = [];
      const length = pathElement.getTotalLength();
      const step = Math.max(0.2, Math.min(8, length * 0.01));
      for (let i = 0; i < length; i += step) {
        const { x, y } = pathElement.getPointAtLength(i);
        points.push([x, y]);
      }
      const last = pathElement.getPointAtLength(length);
      points.push([last.x, last.y]);
      const p = createSvgPoint(event);
      points.push([p.x, p.y]);
      d = simplifySvgPath(points, { tolerance: 0.5 / scale, precision: scale > 2 ? 1 : 0 });
    }
    pathElement.setAttribute('d', d);
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

  svgElement.appendChild(pathElement);
  pathElement.dispatchEvent(new CustomEvent('fluentpath:drawstart', { bubbles: true }));
});

// iOS, iPadOS
if ('GestureEvent' in self) {
  // disable text selection loupe
  addEventListener('touchmove', (e) => e.touches.length === 1 && findTargetSvg(e) && e.preventDefault(), { passive: false });
  // disable double tap zoom
  addEventListener('touchend', (e) => findTargetSvg(e) && e.preventDefault(), { passive: false });
}
