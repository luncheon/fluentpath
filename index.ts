import { fluentpath, FluentpathOptions } from './fluentpath';

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

const svgPointFactory = (svg: SVGGraphicsElement) => {
  const ctm = svg.getScreenCTM()!;

  // Safari: getScreenCTM doesn't include ancestor transformations
  // https://bugs.webkit.org/show_bug.cgi?id=209220
  if ('GestureEvent' in self) {
    let ancestorCtmString = '';
    for (let element: Element | null = svg.parentElement; element; element = element.parentElement) {
      const transform = getComputedStyle(element).transform;
      transform && transform !== 'none' && (ancestorCtmString = `${transform} ${ancestorCtmString}`);
    }
    const ancestorCtm = new DOMMatrixReadOnly(ancestorCtmString);
    ctm.a *= ancestorCtm.a;
    ctm.d *= ancestorCtm.d;
  }
  const inverseCtm = ctm.inverse();
  return (p: { readonly clientX: number; readonly clientY: number }) => new DOMPoint(p.clientX, p.clientY).matrixTransform(inverseCtm);
};

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
    const createSvgPoint = svgPointFactory(svgElement);

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const _addPoint = fluentpath(fluentpathOptions);
    const addPoint = (event: PointerEvent) => {
      const p = createSvgPoint(event);
      createsCircle && svgElement.appendChild(createCircle({ x: p.x, y: p.y, color: 'blue' }));
      pathElement.setAttribute('d', _addPoint(p));
    };
    addPoint(event);

    let { clientX: previousX, clientY: previousY } = event;
    const onPointerMove = (event: PointerEvent) => {
      if (Math.hypot(previousX - event.clientX, previousY - event.clientY) < 4) {
        return;
      }
      ({ clientX: previousX, clientY: previousY } = event);
      addPoint(event);
    };
    const onPointerUp = (event: PointerEvent) => {
      removeEventListeners();
      addPoint(event);
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

    // element.setPointerCapture() does not seem to work on Mobile Safari 15
    // so use window.addEventListener() instead

    // [iOS] #setPointerCapture does not dispatch pointer events outside element boundary
    // https://bugs.webkit.org/show_bug.cgi?id=220196
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
