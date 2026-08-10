import { useCallback, useEffect, useState } from 'react';
import type { MediaKind } from '../types/tmdb';

export interface WatchlistEntry {
  id: number;
  media_type: MediaKind;
  title: string;
  poster_path: string | null;
  vote_average: number;
  addedAt: number;
}

const STORAGE_KEY = 'frostbyte-watchlist';

function load(): WatchlistEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WatchlistEntry[]) : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistEntry[]>(() => load());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const has = useCallback((id: number, media_type: MediaKind) =>
    items.some((i) => i.id === id && i.media_type === media_type), [items]);

  const toggle = useCallback((entry: WatchlistEntry) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === entry.id && i.media_type === entry.media_type);
      if (exists) return prev.filter((i) => !(i.id === entry.id && i.media_type === entry.media_type));
      return [{ ...entry, addedAt: Date.now() }, ...prev];
    });
  }, []);

  return { items, has, toggle };
}
