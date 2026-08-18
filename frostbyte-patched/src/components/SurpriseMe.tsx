import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { tmdb, IMG } from '../api/tmdb';
import type { MediaItem, MediaKind } from '../types/tmdb';
import { kindOf, ratingOf, titleOf, yearOf } from '../utils/media';
import './SurpriseMe.css';

export default function SurpriseMe() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MediaItem | null>(null);
  const [kind, setKind] = useState<MediaKind>('movie');
  const navigate = useNavigate();

  const roll = async (pickKind: MediaKind) => {
    setKind(pickKind);
    setLoading(true);
    setResult(null);
    setOpen(true);
    try {
      const pick = await tmdb.randomTitle(pickKind);
      setResult(pick);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const backdrop = result ? IMG.backdrop(result.backdrop_path, 'w1280') : null;

  return (
    <>
      <div className="surprise-trigger">
        <button className="surprise-trigger__btn" onClick={() => roll('movie')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 20l4-4M4 4l16 16M20 4l-4 4M14 4h6v6M4 14v6h6" />
          </svg>
          Surprise me
        </button>
      </div>

      {open &&
        createPortal(
          <div className="surprise-modal" role="dialog" aria-modal="true" aria-label="Random title" onClick={() => setOpen(false)}>
            <div className="surprise-modal__frame" onClick={(e) => e.stopPropagation()}>
              <button className="surprise-modal__close" onClick={() => setOpen(false)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {loading && (
                <div className="surprise-modal__loading" role="status" aria-live="polite">
                  <div className="surprise-modal__spinner" aria-hidden="true" />
                  <p>Rolling the reel...</p>
                </div>
              )}

              {!loading && result && (
                <div className="surprise-modal__result">
                  {backdrop && (
                    <div className="surprise-modal__backdrop" style={{ backgroundImage: `url(${backdrop})` }}>
                      <div className="surprise-modal__fade" />
                    </div>
                  )}
                  <div className="surprise-modal__body">
                    <p className="surprise-modal__eyebrow">Your pick</p>
                    <h2>{titleOf(result)}</h2>
                    <div className="surprise-modal__facts">
                      <span className="surprise-modal__rating">★ {ratingOf(result)}</span>
                      <span>{yearOf(result)}</span>
                    </div>
                    <p className="surprise-modal__overview">{result.overview || 'No synopsis available.'}</p>
                    <div className="surprise-modal__actions">
                      <button
                        className="btn btn--primary"
                        onClick={() => {
                          navigate(`/${kindOf(result)}/${result.id}`);
                          setOpen(false);
                        }}
                      >
                        View details
                      </button>
                      <button className="btn btn--ghost" onClick={() => roll(kind)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M4 20l4-4M4 4l16 16M20 4l-4 4M14 4h6v6M4 14v6h6" />
                        </svg>
                        Roll again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!loading && !result && (
                <div className="surprise-modal__loading">
                  <p>Couldn't find a pick. Try again?</p>
                  <button className="btn btn--ghost" onClick={() => roll(kind)} style={{ marginTop: 12 }}>
                    Try again
                  </button>
                </div>
              )}

              {!loading && (
                <div className="surprise-modal__switch">
                  <button className={kind === 'movie' ? 'is-active' : ''} onClick={() => roll('movie')}>
                    Movie
                  </button>
                  <button className={kind === 'tv' ? 'is-active' : ''} onClick={() => roll('tv')}>
                    TV Show
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
