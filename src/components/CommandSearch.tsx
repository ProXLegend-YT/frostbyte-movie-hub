import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { tmdb, IMG } from '../api/tmdb';
import type { MediaItem } from '../types/tmdb';
import type { PersonSearchResult } from '../api/tmdb';
import { useDebounce } from '../hooks/useDebounce';
import { kindOf, ratingOf, titleOf, yearOf } from '../utils/media';
import './CommandSearch.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

type ResultEntry =
  | { type: 'title'; item: MediaItem }
  | { type: 'person'; item: PersonSearchResult };

export default function CommandSearch({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResultEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debounced = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([tmdb.search(debounced), tmdb.searchPeople(debounced)])
      .then(([titleRes, personRes]) => {
        if (cancelled) return;
        const titleEntries: ResultEntry[] = titleRes.results.slice(0, 6).map((item) => ({ type: 'title', item }));
        const personEntries: ResultEntry[] = personRes.results.slice(0, 3).map((item) => ({ type: 'person', item }));
        setResults([...titleEntries, ...personEntries]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[activeIndex]) {
        const entry = results[activeIndex];
        if (entry.type === 'title') {
          navigate(`/${kindOf(entry.item)}/${entry.item.id}`);
        } else {
          navigate(`/person/${entry.item.id}`);
        }
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, results, activeIndex, navigate, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="cmdk" role="dialog" aria-modal="true" aria-label="Search" onClick={onClose}>
      <div className="cmdk__panel" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk__input-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search movies, TV shows..."
            aria-label="Search"
          />
          <kbd>ESC</kbd>
        </div>

        <div className="cmdk__results">
          {loading && <div className="cmdk__hint">Searching...</div>}

          {!loading && query && results.length === 0 && (
            <div className="cmdk__hint">No matches for "{query}"</div>
          )}

          {!loading &&
            results.map((entry, i) => {
              if (entry.type === 'person') {
                const person = entry.item;
                const photo = IMG.profile(person.profile_path, 'w185');
                return (
                  <button
                    key={`person-${person.id}`}
                    className={`cmdk__result ${i === activeIndex ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => {
                      navigate(`/person/${person.id}`);
                      onClose();
                    }}
                  >
                    <div className="cmdk__poster cmdk__poster--round">
                      {photo ? <img src={photo} alt="" loading="lazy" /> : <span>{person.name.charAt(0)}</span>}
                    </div>
                    <div className="cmdk__result-meta">
                      <p className="cmdk__result-title">{person.name}</p>
                      <p className="cmdk__result-sub">{person.known_for_department}</p>
                    </div>
                    <span className="cmdk__person-tag">Person</span>
                  </button>
                );
              }

              const item = entry.item;
              const poster = IMG.poster(item.poster_path, 'w185');
              const kind = kindOf(item);
              return (
                <button
                  key={`${kind}-${item.id}`}
                  className={`cmdk__result ${i === activeIndex ? 'is-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => {
                    navigate(`/${kind}/${item.id}`);
                    onClose();
                  }}
                >
                  <div className="cmdk__poster">
                    {poster ? <img src={poster} alt="" loading="lazy" /> : <span>{titleOf(item).charAt(0)}</span>}
                  </div>
                  <div className="cmdk__result-meta">
                    <p className="cmdk__result-title">{titleOf(item)}</p>
                    <p className="cmdk__result-sub">
                      {yearOf(item)} · {kind === 'tv' ? 'Series' : 'Film'} · ★ {ratingOf(item)}
                    </p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="cmdk__go">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              );
            })}

          {!query && (
            <div className="cmdk__hint cmdk__hint--tips">
              <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> navigate</span>
              <span><kbd>&crarr;</kbd> open</span>
              <span><kbd>ESC</kbd> close</span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
