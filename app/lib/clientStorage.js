export function subscribeToStorage(eventName, callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(eventName, callback);
  };
}

export function notifyStorageChange(eventName) {
  window.dispatchEvent(new Event(eventName));
}

export function readJsonStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
