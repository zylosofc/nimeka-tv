// Hook untuk menyimpan & mengambil riwayat tontonan + progress menit
// Disimpan di localStorage

export interface WatchHistoryItem {
  episodeId: string;
  animeId: string;
  animeTitle: string;
  episodeNumber: string | number;
  poster: string;
  progressSeconds: number; // detik terakhir ditonton
  updatedAt: number; // timestamp
}

const STORAGE_KEY = "nimeka_watch_history";
const MAX_ITEMS = 20;

function getAll(): WatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WatchHistoryItem[];
  } catch {
    return [];
  }
}

function saveAll(items: WatchHistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

export function saveWatchProgress(item: Omit<WatchHistoryItem, "updatedAt">) {
  const all = getAll().filter((h) => h.episodeId !== item.episodeId);
  const updated: WatchHistoryItem = { ...item, updatedAt: Date.now() };
  const next = [updated, ...all].slice(0, MAX_ITEMS);
  saveAll(next);
}

export function getWatchHistory(): WatchHistoryItem[] {
  return getAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getWatchProgress(episodeId: string): number {
  const all = getAll();
  const item = all.find((h) => h.episodeId === episodeId);
  return item?.progressSeconds ?? 0;
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
