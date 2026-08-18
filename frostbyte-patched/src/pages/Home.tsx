import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Row from '../components/Row';
import { HeroSkeleton, RowSkeleton } from '../components/Skeletons';
import { tmdb } from '../api/tmdb';
import type { MediaItem } from '../types/tmdb';
import { useWatchlist } from '../hooks/useWatchlist';

interface RowData {
  title: string;
  items: MediaItem[];
  viewAllTo?: string;
  ranked?: boolean;
  eyebrow?: string;
}

export default function Home() {
  const [trending, setTrending] = useState<MediaItem[] | null>(null);
  const [rows, setRows] = useState<RowData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { items: watchlistItems } = useWatchlist();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [trendingRes, popularMovies, popularTv, topRatedMovies, nowPlaying, topRatedTv] = await Promise.all([
          tmdb.trending('week'),
          tmdb.popularMovies(),
          tmdb.popularTv(),
          tmdb.topRatedMovies(),
          tmdb.nowPlayingMovies(),
          tmdb.topRatedTv(),
        ]);

        if (cancelled) return;

        setTrending(trendingRes.results.filter((r) => r.backdrop_path));
        setRows([
          { title: 'Trending This Week', items: trendingRes.results, ranked: true, eyebrow: 'Updated daily' },
          { title: 'Popular Movies', items: popularMovies.results, viewAllTo: '/movies' },
          { title: 'Popular TV Shows', items: popularTv.results, viewAllTo: '/tv' },
          { title: 'In Theaters Now', items: nowPlaying.results, eyebrow: 'Fresh releases' },
          { title: 'Top Rated Movies', items: topRatedMovies.results, eyebrow: 'Critically acclaimed' },
          { title: 'Top Rated TV Shows', items: topRatedTv.results, eyebrow: 'Critically acclaimed' },
        ]);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Something went wrong loading titles.');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--stock-dim)' }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      {trending ? <Hero items={trending} /> : <HeroSkeleton />}
      <div className="container">
        <Link to="/explore" className="explore-cta">
          <div>
            <p className="explore-cta__eyebrow">Not sure what to watch?</p>
            <h3>Explore by genre</h3>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
        {rows
          ? rows.map((r) => <Row key={r.title} {...r} />)
          : Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}
        {watchlistItems.length > 0 && (
          <Row
            title="Continue Your List"
            eyebrow="Saved by you"
            viewAllTo="/watchlist"
            items={watchlistItems.slice(0, 20).map((w) => ({
              id: w.id,
              media_type: w.media_type,
              title: w.media_type === 'movie' ? w.title : undefined,
              name: w.media_type === 'tv' ? w.title : undefined,
              overview: '',
              poster_path: w.poster_path,
              backdrop_path: null,
              vote_average: w.vote_average,
              vote_count: 0,
              popularity: 0,
            }))}
          />
        )}
      </div>
    </>
  );
}
