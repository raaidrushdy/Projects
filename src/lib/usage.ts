export const FREE_TIER_LIMIT = 3;
const STORAGE_KEY = "resumate_free_uses";
const CHANGE_EVENT = "resumate-usage-change";

export function getUsedCount(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function getRemaining(): number {
  return Math.max(0, FREE_TIER_LIMIT - getUsedCount());
}

export function recordUse(): number {
  const next = getUsedCount() + 1;
  window.localStorage.setItem(STORAGE_KEY, String(next));
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return next;
}

export function subscribeToUsage(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

/** Snapshot used during SSR/initial render, before we know the real usage count. */
export function getServerRemaining(): number {
  return FREE_TIER_LIMIT;
}
