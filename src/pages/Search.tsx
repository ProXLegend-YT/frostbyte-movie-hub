import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MediaCard from '../components/MediaCard';
import { GridSkeleton } from '../components/Skeletons';
import { tmdb } from '../api/tmdb';
import type { MediaItem } from '../types/tmdb';
import { useDebounce } from '../hooks/useDebounce';
import '../pages/Browse.css';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [input, setInput] = useState(q);
  const debounced = useDebounce(input, 400);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setInput(q);
  }, [q]);

  useEffect(() => {
    if (debounced !== q) {
      setParams(debounced ? { q: debounced } : {}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setSearched(true);
    tmdb
      .search(q)
      .then((res) => {
        if (!cancelled) setResults(res.results);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="container browse">
      <h1>Search</h1>
      <div className="search-input-wrap">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search for a movie or TV show..."
          aria-label="Search"
        />
      </div>

      {loading && <GridSkeleton count={12} />}

      {!loading && searched && results.length === 0 && (
        <p className="browse__empty">No results for "{q}". Try another title.</p>
      )}

      {!loading && results.length > 0 && (
        <div className="browse__grid" style={{ marginTop: 24 }}>
          {results.map((item) => (
            <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
          ))}
        </div>
      )}

      {!searched && !loading && (
        <p className="browse__empty">Start typing to find movies and TV shows.</p>
      )}
    </div>
  );
}
