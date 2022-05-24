export const clientToSvgTransformer = (svg: SVGGraphicsElement) => {
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
