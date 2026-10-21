let callback: (() => void) | undefined;

function registerEvent(
  callback: () => void,
  method: typeof addEventListener | typeof removeEventListener,
) {
  const interactionEvents = ['keydown', 'mousedown'];
  const listenerOptions = { capture: true };
  interactionEvents.forEach((type) => {
    method(type, callback, listenerOptions);
  });
}

export function clearInteracted() {
  if (callback) {
    registerEvent(callback, removeEventListener);
    callback = undefined;
  }
}

export function userInteract(handler: () => void) {
  const cb = () => {
    handler();
    registerEvent(cb, removeEventListener);
  };
  callback = cb;
  registerEvent(cb, addEventListener);
}
