import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tmdb } from '../api/tmdb';
import type { Genre } from '../types/tmdb';
import './Explore.css';

// Curated accent + backdrop-style gradients per common genre, so the grid feels art-directed
// rather than a plain alphabetical list. Falls back to a default gradient for anything unmapped.
const GENRE_STYLES: Record<string, string> = {
  Action: 'linear-gradient(150deg, #3a1410, #0c0a09)',
  Adventure: 'linear-gradient(150deg, #2c2410, #0c0a09)',
  Animation: 'linear-gradient(150deg, #142a2e, #0c0a09)',
  Comedy: 'linear-gradient(150deg, #33280d, #0c0a09)',
  Crime: 'linear-gradient(150deg, #1a1a1a, #0c0a09)',
  Documentary: 'linear-gradient(150deg, #16241c, #0c0a09)',
  Drama: 'linear-gradient(150deg, #2a1420, #0c0a09)',
  Family: 'linear-gradient(150deg, #142e28, #0c0a09)',
  Fantasy: 'linear-gradient(150deg, #241340, #0c0a09)',
  History: 'linear-gradient(150deg, #2e2410, #0c0a09)',
  Horror: 'linear-gradient(150deg, #250e0e, #0c0a09)',
  Music: 'linear-gradient(150deg, #2e1030, #0c0a09)',
  Mystery: 'linear-gradient(150deg, #10161f, #0c0a09)',
  Romance: 'linear-gradient(150deg, #3a1224, #0c0a09)',
  'Science Fiction': 'linear-gradient(150deg, #0d2436, #0c0a09)',
  'Sci-Fi & Fantasy': 'linear-gradient(150deg, #0d2436, #0c0a09)',
  Thriller: 'linear-gradient(150deg, #1c1010, #0c0a09)',
  War: 'linear-gradient(150deg, #201c14, #0c0a09)',
  Western: 'linear-gradient(150deg, #2e1f10, #0c0a09)',
  'War & Politics': 'linear-gradient(150deg, #201c14, #0c0a09)',
  Kids: 'linear-gradient(150deg, #142e28, #0c0a09)',
  News: 'linear-gradient(150deg, #1a1a1a, #0c0a09)',
  Reality: 'linear-gradient(150deg, #2e2410, #0c0a09)',
  Soap: 'linear-gradient(150deg, #3a1224, #0c0a09)',
  Talk: 'linear-gradient(150deg, #1a1a1a, #0c0a09)',
  'TV Movie': 'linear-gradient(150deg, #2a1420, #0c0a09)',
};

const DEFAULT_STYLE = 'linear-gradient(150deg, #241d16, #0c0a09)';

export default function Explore() {
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [tab, setTab] = useState<'movie' | 'tv'>('movie');

  useEffect(() => {
    tmdb.genres('movie').then(setMovieGenres).catch(() => {});
    tmdb.genres('tv').then(setTvGenres).catch(() => {});
  }, []);

  const genres = tab === 'movie' ? movieGenres : tvGenres;

  return (
    <div className="container explore">
      <div className="explore__intro">
        <p className="explore__eyebrow">Browse by mood</p>
        <h1>Explore</h1>
        <p className="explore__lede">Pick a genre and fall down the rabbit hole. Every tile pulls live, popularity-ranked titles.</p>
      </div>

      <div className="explore__tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'movie'} className={tab === 'movie' ? 'is-active' : ''} onClick={() => setTab('movie')}>
          Movies
        </button>
        <button role="tab" aria-selected={tab === 'tv'} className={tab === 'tv' ? 'is-active' : ''} onClick={() => setTab('tv')}>
          TV Shows
        </button>
      </div>

      <div className="explore__grid">
        {genres.map((g, i) => (
          <Link
            key={g.id}
            to={`/${tab}/genre/${g.id}`}
            className="explore__tile"
            style={{ background: GENRE_STYLES[g.name] ?? DEFAULT_STYLE, animationDelay: `${(i % 12) * 35}ms` }}
          >
            <span className="explore__tile-name">{g.name}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="explore__tile-arrow">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
