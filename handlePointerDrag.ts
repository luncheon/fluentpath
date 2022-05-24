export interface PointerDragOptions {
  distanceThreshold?: number;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp?: (event: PointerEvent) => void;
  onCancel?: () => void;
}

let dragging = false;

export const handlePointerDrag = (
  { pointerId, clientX: previousX, clientY: previousY }: PointerEvent,
  { distanceThreshold = 0, onPointerMove, onPointerUp, onCancel }: PointerDragOptions,
) => {
  if (dragging) {
    onCancel?.();
    return () => {};
  }
  dragging = true;

  const _onPointerDown = () => {
    removeEventListeners();
    onCancel?.();
  };

  const _onPointerMove = (event: PointerEvent) => {
    if (event.pointerId === pointerId && Math.hypot(previousX - event.clientX, previousY - event.clientY) >= distanceThreshold) {
      ({ clientX: previousX, clientY: previousY } = event);
      onPointerMove(event);
    }
  };

  const _onPointerUp = (event: PointerEvent) => {
    if (event.pointerId === pointerId) {
      removeEventListeners();
      onPointerUp?.(event);
    }
  };

  const _onPointerCancel = () => {
    removeEventListeners();
    onCancel?.();
  };

  const _onKeyDown = (event: KeyboardEvent) => {
    if (event.keyCode === 27) {
      removeEventListeners();
      onCancel?.();
    }
  };

  // [iOS] #setPointerCapture does not dispatch pointer events outside element boundary
  // https://bugs.webkit.org/show_bug.cgi?id=220196

  // `setPointerCapture()` does not work on Mobile Safari 15
  // so use `window.addEventListener()` instead

  const removeEventListeners = () => {
    dragging = false;
    removeEventListener('pointerdown', _onPointerDown);
    removeEventListener('pointermove', _onPointerMove);
    removeEventListener('pointerup', _onPointerUp);
    removeEventListener('pointercancel', _onPointerCancel);
    removeEventListener('keydown', _onKeyDown);
  };

  addEventListener('pointerdown', _onPointerDown);
  addEventListener('pointermove', _onPointerMove);
  addEventListener('pointerup', _onPointerUp);
  addEventListener('pointercancel', _onPointerCancel);
  addEventListener('keydown', _onKeyDown);

  return removeEventListeners;
};
