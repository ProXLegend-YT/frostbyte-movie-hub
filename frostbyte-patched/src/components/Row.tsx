import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { MediaItem } from '../types/tmdb';
import MediaCard from './MediaCard';
import { useReveal } from '../hooks/useReveal';
import './Row.css';

interface Props {
  title: string;
  items: MediaItem[];
  viewAllTo?: string;
  ranked?: boolean;
  eyebrow?: string;
}

export default function Row({ title, items, viewAllTo, ranked, eyebrow }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { ref: revealRef, visible } = useReveal<HTMLElement>();

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (!items.length) return null;

  return (
    <section
      className={`row ${visible ? 'row--visible' : ''}`}
      aria-label={title}
      ref={revealRef as React.RefObject<HTMLElement>}
    >
      <div className="sprocket-rule">
        <span className="holes" aria-hidden="true">
          <span /><span /><span /><span />
        </span>
      </div>
      <div className="row__head">
        <div>
          {eyebrow && <p className="row__eyebrow">{eyebrow}</p>}
          <h2 className="row__title">{title}</h2>
        </div>
        <div className="row__controls">
          {viewAllTo && (
            <Link to={viewAllTo} className="row__viewall">
              View all
            </Link>
          )}
          <button aria-label={`Scroll ${title} left`} className="row__arrow" onClick={() => scrollBy(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button aria-label={`Scroll ${title} right`} className="row__arrow" onClick={() => scrollBy(1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="row__scroller" ref={scrollerRef}>
        {items.map((item, i) => (
          <div
            key={`${item.media_type}-${item.id}`}
            className="row__card-enter"
            style={{ transitionDelay: visible ? `${Math.min(i, 10) * 40}ms` : '0ms' }}
          >
            <MediaCard item={item} rank={ranked ? i + 1 : undefined} />
          </div>
        ))}
      </div>
    </section>
  );
}
