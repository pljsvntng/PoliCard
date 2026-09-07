// Thin persistence layer. Swappable for a real database without touching callers.
const NS = "marginal";

function key(name) {
  return `${NS}:${name}`;
}

export function loadCollection(name, fallback = []) {
  try {
    const raw = localStorage.getItem(key(name));
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveCollection(name, data) {
  try {
    localStorage.setItem(key(name), JSON.stringify(data));
  } catch (err) {
    console.error("Storage write failed", err);
  }
}

export function clearAll() {
  ["documents", "quizzes", "flashcardSets", "history", "settings"].forEach((n) =>
    localStorage.removeItem(key(n))
  );
}

export function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
