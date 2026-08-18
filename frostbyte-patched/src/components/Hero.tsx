import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MediaItem } from '../types/tmdb';
import { IMG } from '../api/tmdb';
import { kindOf, ratingOf, titleOf, yearOf } from '../utils/media';
import './Hero.css';

interface Props {
  items: MediaItem[];
}

export default function Hero({ items }: Props) {
  const slides = useMemo(() => items.slice(0, 6), [items]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setActive((a) => (a + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;
  const item = slides[active];
  const kind = kindOf(item);
  const backdrop = IMG.backdrop(item.backdrop_path, 'original');

  return (
    <section className="hero" aria-label="Featured title">
      <div className="hero__stage">
        {slides.map((s, i) => {
          const bg = IMG.backdrop(s.backdrop_path, 'original');
          return (
            <div
              key={s.id}
              className={`hero__slide ${i === active ? 'is-active' : ''}`}
              style={bg ? { backgroundImage: `url(${bg})` } : undefined}
              aria-hidden={i !== active}
            />
          );
        })}
        <div className="hero__vignette" aria-hidden="true" />
        <div className="hero__grain" aria-hidden="true" />
      </div>

      <div className="container hero__content">
        <p className="hero__eyebrow">
          <span className="hero__dot" /> Now trending {kind === 'tv' ? '· Series' : '· Film'}
        </p>
        <h1 className="hero__title">{titleOf(item)}</h1>
        <div className="hero__facts">
          <span className="hero__rating">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6z" />
            </svg>
            {ratingOf(item)}
          </span>
          <span>{yearOf(item)}</span>
        </div>
        <p className="hero__overview">{item.overview}</p>
        <div className="hero__actions">
          <Link to={`/${kind}/${item.id}`} className="btn btn--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            View details
          </Link>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="hero__dots" role="tablist" aria-label="Featured titles">
          {slides.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === active}
              aria-label={`Show ${titleOf(s)}`}
              className={i === active ? 'is-active' : ''}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      )}
      {backdrop && <link rel="preload" as="image" href={backdrop} />}
    </section>
  );
}
