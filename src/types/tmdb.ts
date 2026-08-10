export interface Genre {
  id: number;
  name: string;
}

export interface MediaItem {
  id: number;
  media_type?: 'movie' | 'tv';
  title?: string; // movie
  name?: string; // tv
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string; // movie
  first_air_date?: string; // tv
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  popularity: number;
}

export interface MediaDetail extends MediaItem {
  genres: Genre[];
  runtime?: number; // movie
  episode_run_time?: number[]; // tv
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: SeasonSummary[];
  tagline?: string;
  status?: string;
  videos?: { results: VideoResult[] };
  credits?: { cast: CastMember[]; crew: CrewMember[] };
  similar?: { results: MediaItem[] };
}

export interface SeasonSummary {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
  overview: string;
}

export interface VideoResult {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface PagedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export type MediaKind = 'movie' | 'tv';
