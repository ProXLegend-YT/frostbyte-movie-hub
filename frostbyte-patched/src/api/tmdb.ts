import type { MediaDetail, MediaItem, MediaKind, PagedResponse } from '../types/tmdb';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
const BASE_URL = 'https://api.themoviedb.org/3';

export const IMG = {
  poster: (path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w500') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
  backdrop: (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
  profile: (path: string | null, size: 'w185' | 'w342' = 'w185') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
};

export class TmdbConfigError extends Error {}

async function request<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  if (!API_KEY) {
    throw new TmdbConfigError('Missing TMDB API key. Set VITE_TMDB_API_KEY in your environment.');
  }
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('include_adult', 'false');
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    if (res.status === 401) throw new TmdbConfigError('Invalid TMDB API key.');
    throw new Error(`TMDB request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function withType<T extends { media_type?: string }>(items: T[], type: MediaKind): T[] {
  return items.map((i) => ({ ...i, media_type: type }));
}

export const tmdb = {
  trending: async (window: 'day' | 'week' = 'week') => {
    const data = await request<PagedResponse<MediaItem>>(`/trending/all/${window}`);
    return data;
  },
  popularMovies: async (page = 1) => {
    const data = await request<PagedResponse<MediaItem>>('/movie/popular', { page });
    return { ...data, results: withType(data.results, 'movie') };
  },
  popularTv: async (page = 1) => {
    const data = await request<PagedResponse<MediaItem>>('/tv/popular', { page });
    return { ...data, results: withType(data.results, 'tv') };
  },
  topRatedMovies: async (page = 1) => {
    const data = await request<PagedResponse<MediaItem>>('/movie/top_rated', { page });
    return { ...data, results: withType(data.results, 'movie') };
  },
  topRatedTv: async (page = 1) => {
    const data = await request<PagedResponse<MediaItem>>('/tv/top_rated', { page });
    return { ...data, results: withType(data.results, 'tv') };
  },
  nowPlayingMovies: async (page = 1) => {
    const data = await request<PagedResponse<MediaItem>>('/movie/now_playing', { page });
    return { ...data, results: withType(data.results, 'movie') };
  },
  upcomingMovies: async (page = 1) => {
    const data = await request<PagedResponse<MediaItem>>('/movie/upcoming', { page });
    return { ...data, results: withType(data.results, 'movie') };
  },
  onTheAirTv: async (page = 1) => {
    const data = await request<PagedResponse<MediaItem>>('/tv/on_the_air', { page });
    return { ...data, results: withType(data.results, 'tv') };
  },
  byGenre: async (kind: MediaKind, genreId: number, page = 1) => {
    const data = await request<PagedResponse<MediaItem>>(`/discover/${kind}`, {
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc',
    });
    return { ...data, results: withType(data.results, kind) };
  },
  discover: async (
    kind: MediaKind,
    opts: { genreId?: number | null; minYear?: number; maxYear?: number; minRating?: number; sortBy?: string; page?: number }
  ) => {
    const dateField = kind === 'movie' ? 'primary_release_date' : 'first_air_date';
    const params: Record<string, string | number | undefined> = {
      page: opts.page ?? 1,
      sort_by: opts.sortBy ?? 'popularity.desc',
      with_genres: opts.genreId ?? undefined,
      [`${dateField}.gte`]: opts.minYear ? `${opts.minYear}-01-01` : undefined,
      [`${dateField}.lte`]: opts.maxYear ? `${opts.maxYear}-12-31` : undefined,
      'vote_average.gte': opts.minRating ?? undefined,
      'vote_count.gte': 20,
    };
    const data = await request<PagedResponse<MediaItem>>(`/discover/${kind}`, params);
    return { ...data, results: withType(data.results, kind) };
  },
  randomTitle: async (kind: MediaKind) => {
    // Pull a random page from a reasonably deep, quality-filtered pool, then pick a random result.
    const page = Math.floor(Math.random() * 20) + 1;
    const data = await request<PagedResponse<MediaItem>>(`/discover/${kind}`, {
      page,
      sort_by: 'popularity.desc',
      'vote_count.gte': 200,
      'vote_average.gte': 6,
    });
    const pool = data.results;
    if (!pool.length) throw new Error('No titles found.');
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return { ...pick, media_type: kind };
  },
  genres: async (kind: MediaKind) => {
    const data = await request<{ genres: { id: number; name: string }[] }>(`/genre/${kind}/list`);
    return data.genres;
  },
  search: async (query: string, page = 1) => {
    if (!query.trim()) return { page: 1, results: [], total_pages: 0, total_results: 0 };
    const data = await request<PagedResponse<MediaItem>>('/search/multi', { query, page });
    return { ...data, results: data.results.filter((r) => r.media_type === 'movie' || r.media_type === 'tv') };
  },
  detail: async (kind: MediaKind, id: number) => {
    const data = await request<MediaDetail>(`/${kind}/${id}`, {
      append_to_response: 'videos,credits,similar,recommendations',
    });
    return { ...data, media_type: kind };
  },
  person: async (id: number) => {
    return request<PersonDetail>(`/person/${id}`, {
      append_to_response: 'combined_credits',
    });
  },
  season: async (tvId: number, seasonNumber: number) => {
    return request<SeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`);
  },
  watchProviders: async (kind: MediaKind, id: number) => {
    return request<{ results: Record<string, WatchProviderRegion> }>(`/${kind}/${id}/watch/providers`);
  },
  searchPeople: async (query: string, page = 1) => {
    if (!query.trim()) return { page: 1, results: [], total_pages: 0, total_results: 0 };
    return request<PagedResponse<PersonSearchResult>>('/search/person', { query, page });
  },
  nowPlayingWithDates: async () => {
    return request<PagedResponse<MediaItem> & { dates?: { minimum: string; maximum: string } }>(
      '/movie/now_playing'
    );
  },
};

export interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;
  runtime: number | null;
}

export interface SeasonDetail {
  id: number;
  name: string;
  season_number: number;
  overview: string;
  air_date: string | null;
  episodes: Episode[];
}

export interface WatchProviderEntry {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProviderRegion {
  link: string;
  flatrate?: WatchProviderEntry[];
  rent?: WatchProviderEntry[];
  buy?: WatchProviderEntry[];
}

export interface PersonSearchResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

export interface PersonDetail {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  birthday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
  combined_credits?: {
    cast: (MediaItem & { character?: string })[];
  };
}
