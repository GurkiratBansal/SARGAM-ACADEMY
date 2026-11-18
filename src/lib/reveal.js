let revealed = false;
const listeners = new Set();

export function signalReveal() {
  revealed = true;
  listeners.forEach((listener) => listener());
  listeners.clear();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sargam:revealed'));
  }
}

export function onReveal(listener) {
  if (revealed) {
    listener();
    return () => {};
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}
