import type { MediaItem, MediaKind } from '../types/tmdb';

export function titleOf(item: MediaItem): string {
  return item.title ?? item.name ?? 'Untitled';
}

export function yearOf(item: MediaItem): string {
  const date = item.release_date ?? item.first_air_date;
  return date ? date.slice(0, 4) : '—';
}

export function kindOf(item: MediaItem): MediaKind {
  return item.media_type === 'tv' ? 'tv' : 'movie';
}

export function ratingOf(item: MediaItem): string {
  return item.vote_average ? item.vote_average.toFixed(1) : '—';
}

export function runtimeLabel(minutes?: number): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
