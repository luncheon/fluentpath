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

  let d = `M${p.x} ${p.y}`;

  const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathElement.setAttribute('d', d);

  const onPointerMove = (event: PointerEvent) => {
    lastNPointers.unshift(createSvgPoint(event));
    lastNPointers.length === 5 && lastNPointers.pop();
    const x = lastNPointers.reduce((x, p) => x + p.x, 0) / lastNPointers.length;
    const y = lastNPointers.reduce((y, p) => y + p.y, 0) / lastNPointers.length;
    const [prevX, prevY] = points[points.length - 1]!;
    if (Math.hypot(prevX - x, prevY - y) > distanceThreshold) {
      pathElement.setAttribute('d', (d += `L${x} ${y}`));
      points.push([x, y]);
    }
  };
  const onPointerUp = (event: PointerEvent) => {
    removeEventListeners();
    onPointerMove(event);
    pathElement.setAttribute(
      'd',
      points.length === 1 ? d + 'v0' : simplifySvgPath(points, { tolerance: 0.5 / scale, precision: scale > 2 ? 1 : 0 }),
    );
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
