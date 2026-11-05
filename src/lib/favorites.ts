/** Saved offers live on the device (localStorage); there is no account sync yet. */
const KEY = "liky:favorites";

export function readFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(id: string): void {
  try {
    const now = readFavorites();
    const next = now.includes(id) ? now.filter((x) => x !== id) : [...now, id].slice(-100);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage is blocked: the heart just doesn't stick */
  }
  window.dispatchEvent(new Event("liky-favorites"));
}
