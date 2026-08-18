import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MediaKind } from '../types/tmdb';
import './WatchModal.css';

interface Props {
  id: number;
  kind: MediaKind;
  title: string;
  // TV-only — which episode to start on
  season?: number;
  episode?: number;
  onClose: () => void;
}

// Source catalogue — vidsrc.to is primary; fallback chain if iframe errors out
const SOURCES = [
  {
    label: 'VidSrc',
    movie: (id: number) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    label: 'Embed.su',
    movie: (id: number) => `https://embed.su/embed/movie/${id}`,
    tv: (id: number, s: number, e: number) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    label: 'SuperEmbed',
    movie: (id: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id: number, s: number, e: number) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
];

export default function WatchModal({ id, kind, title, season = 1, episode = 1, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [sourceIdx, setSourceIdx] = useState(0);

  const src =
    kind === 'movie'
      ? SOURCES[sourceIdx].movie(id)
      : SOURCES[sourceIdx].tv(id, season, episode);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const nextSource = () => {
    setSourceIdx((i) => (i + 1) % SOURCES.length);
  };

  return createPortal(
    <div
      className="watch-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Watch ${title}`}
      onClick={onClose}
    >
      <div className="watch-modal__frame" onClick={(e) => e.stopPropagation()}>
        {/* Top bar */}
        <div className="watch-modal__bar">
          <span className="watch-modal__title">{title}</span>
          {kind === 'tv' && (
            <span className="watch-modal__episode">
              S{String(season).padStart(2, '0')} · E{String(episode).padStart(2, '0')}
            </span>
          )}
          <div className="watch-modal__bar-actions">
            {/* Source switcher */}
            <button
              className="watch-modal__source-btn"
              onClick={nextSource}
              title={`Currently: ${SOURCES[sourceIdx].label} — click to switch`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              {SOURCES[sourceIdx].label}
            </button>
            {/* Close */}
            <button
              ref={closeRef}
              className="watch-modal__close"
              onClick={onClose}
              aria-label="Close player"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Player */}
        <div className="watch-modal__player">
          <iframe
            key={src}
            src={src}
            title={`Watch ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="origin"
          />
        </div>

        {/* Source info footer */}
        <div className="watch-modal__footer">
          <span className="watch-modal__hint">
            If the player is blank or shows an error, switch the source above.
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
