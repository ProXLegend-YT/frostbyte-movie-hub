import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MediaCard from '../components/MediaCard';
import { GridSkeleton } from '../components/Skeletons';
import { tmdb } from '../api/tmdb';
import type { Genre, MediaItem, MediaKind } from '../types/tmdb';
import './Browse.css';

interface Props {
  kind: MediaKind;
}

const CURRENT_YEAR = new Date().getFullYear();
const RATING_OPTIONS = [0, 5, 6, 7, 8, 9];

export default function Browse({ kind }: Props) {
  const { genreId } = useParams();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeGenre, setActiveGenre] = useState<number | null>(genreId ? Number(genreId) : null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc'>('popularity.desc');
  const [minYear, setMinYear] = useState<number | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setActiveGenre(genreId ? Number(genreId) : null);
  }, [genreId, kind]);

  useEffect(() => {
    tmdb.genres(kind).then(setGenres).catch(() => {});
  }, [kind]);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [kind, activeGenre, sort, minYear, minRating]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const sortBy = kind === 'tv' && sort === 'primary_release_date.desc' ? 'first_air_date.desc' : sort;

    tmdb
      .discover(kind, {
        genreId: activeGenre,
        minYear: minYear ?? undefined,
        maxYear: minYear ? minYear : undefined,
        minRating: minRating || undefined,
        sortBy,
        page,
      })
      .then((res) => {
        if (cancelled) return;
        setItems((prev) => (page === 1 ? res.results : [...prev, ...res.results]));
        setTotalPages(res.total_pages);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [kind, activeGenre, sort, minYear, minRating, page]);

  const activeFilterCount = (activeGenre ? 1 : 0) + (minYear ? 1 : 0) + (minRating ? 1 : 0);
  const years = Array.from({ length: 40 }, (_, i) => CURRENT_YEAR - i);

  return (
    <div className="container browse">
      <div className="sprocket-rule">
        <span className="holes" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /></span>
      </div>
      <div className="browse__head">
        <h1>{kind === 'movie' ? 'Movies' : 'TV Shows'}</h1>
        <div className="browse__head-controls">
          <button className="browse__filter-toggle" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filters
            {activeFilterCount > 0 && <span className="browse__filter-count">{activeFilterCount}</span>}
          </button>
          <select
            className="browse__sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            aria-label="Sort by"
          >
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Highest Rated</option>
            <option value="primary_release_date.desc">Newest</option>
          </select>
        </div>
      </div>

      {filtersOpen && (
        <div className="browse__filters">
          <div className="browse__filter-group">
            <span className="browse__filter-label">Genre</span>
            <div className="browse__genres">
              <button className={activeGenre === null ? 'is-active' : ''} onClick={() => setActiveGenre(null)}>
                All
              </button>
              {genres.map((g) => (
                <button
                  key={g.id}
                  className={activeGenre === g.id ? 'is-active' : ''}
                  onClick={() => setActiveGenre(g.id)}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div className="browse__filter-group">
            <span className="browse__filter-label">Year</span>
            <div className="browse__genres">
              <button className={minYear === null ? 'is-active' : ''} onClick={() => setMinYear(null)}>
                Any
              </button>
              {years.slice(0, 12).map((y) => (
                <button key={y} className={minYear === y ? 'is-active' : ''} onClick={() => setMinYear(y)}>
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="browse__filter-group">
            <span className="browse__filter-label">Minimum rating</span>
            <div className="browse__genres">
              {RATING_OPTIONS.map((r) => (
                <button key={r} className={minRating === r ? 'is-active' : ''} onClick={() => setMinRating(r)}>
                  {r === 0 ? 'Any' : `${r}+`}
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              className="browse__clear-filters"
              onClick={() => {
                setActiveGenre(null);
                setMinYear(null);
                setMinRating(0);
              }}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {items.length > 0 && (
        <div className="browse__grid">
          {items.map((item) => (
            <MediaCard key={item.id} item={{ ...item, media_type: kind }} />
          ))}
        </div>
      )}

      {loading && <GridSkeleton count={items.length ? 12 : 18} />}

      {!loading && items.length === 0 && (
        <p className="browse__empty">Nothing turned up here yet. Try adjusting your filters.</p>
      )}

      {!loading && page < totalPages && items.length > 0 && (
        <div className="browse__loadmore">
          <button className="btn btn--ghost" onClick={() => setPage((p) => p + 1)}>
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
