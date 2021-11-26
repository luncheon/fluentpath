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

  const p = createSvgPoint(event);
  const points: DOMPoint[] = [p];
  let { x: prevX, y: prevY } = p;
  let d = `M${prevX} ${prevY}`;

  const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathElement.setAttribute('d', d);

  const onPointerMove = (event: PointerEvent) => {
    points.unshift(createSvgPoint(event));
    points.length === 5 && points.pop();
    const x = points.reduce((x, p) => x + p.x, 0) / points.length;
    const y = points.reduce((y, p) => y + p.y, 0) / points.length;
    if (Math.hypot(prevX - x, prevY - y) > 2) {
      pathElement.setAttribute('d', (d += `L${(prevX = x).toFixed(2)} ${(prevY = y).toFixed(2)}`));
    }
  };
  const onPointerUp = (event: PointerEvent) => {
    removeEventListeners();
    onPointerMove(event);
    if (d.includes('L')) {
      const points: [number, number][] = [];
      const length = pathElement.getTotalLength();
      const step = Math.max(0.2, Math.min(8, length * 0.02));
      for (let i = 0; i <= length; i += step) {
        const { x, y } = pathElement.getPointAtLength(i);
        points.push([x, y]);
      }
      d = simplifySvgPath(points, { tolerance: 0.5 / scale, precision: scale > 2 ? 1 : 0 });
    } else {
      d += 'v0';
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
