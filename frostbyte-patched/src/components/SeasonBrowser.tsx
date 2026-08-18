import { useEffect, useState } from 'react';
import { tmdb, IMG } from '../api/tmdb';
import type { SeasonSummary } from '../types/tmdb';
import type { Episode } from '../api/tmdb';
import './SeasonBrowser.css';

interface Props {
  tvId: number;
  seasons: SeasonSummary[];
}

export default function SeasonBrowser({ tvId, seasons }: Props) {
  const validSeasons = seasons.filter((s) => s.season_number > 0);
  const [activeSeason, setActiveSeason] = useState<number | null>(validSeasons[0]?.season_number ?? null);
  const [episodes, setEpisodes] = useState<Episode[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedEp, setExpandedEp] = useState<number | null>(null);

  useEffect(() => {
    if (activeSeason === null) return;
    let cancelled = false;
    setLoading(true);
    setEpisodes(null);
    tmdb
      .season(tvId, activeSeason)
      .then((res) => {
        if (!cancelled) setEpisodes(res.episodes);
      })
      .catch(() => {
        if (!cancelled) setEpisodes([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tvId, activeSeason]);

  if (validSeasons.length === 0) return null;

  return (
    <section className="season-browser" aria-label="Episodes">
      <div className="sprocket-rule">
        <span className="holes" aria-hidden="true"><span /><span /><span /></span>
      </div>
      <div className="season-browser__head">
        <h2>Episodes</h2>
        <div className="season-browser__tabs" role="tablist">
          {validSeasons.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={activeSeason === s.season_number}
              className={activeSeason === s.season_number ? 'is-active' : ''}
              onClick={() => {
                setActiveSeason(s.season_number);
                setExpandedEp(null);
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="season-browser__list" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ep-skel">
              <div className="skel ep-skel__still" />
              <div className="ep-skel__lines">
                <div className="skel skel--line" style={{ width: '40%' }} />
                <div className="skel skel--line" style={{ width: '90%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && episodes && (
        <div className="season-browser__list">
          {episodes.map((ep) => {
            const still = IMG.backdrop(ep.still_path, 'w780');
            const expanded = expandedEp === ep.id;
            return (
              <button
                key={ep.id}
                className={`ep-row ${expanded ? 'is-expanded' : ''}`}
                onClick={() => setExpandedEp(expanded ? null : ep.id)}
                aria-expanded={expanded}
              >
                <div className="ep-row__still">
                  {still ? (
                    <img src={still} alt="" loading="lazy" />
                  ) : (
                    <div className="ep-row__still-empty" aria-hidden="true">
                      {ep.episode_number}
                    </div>
                  )}
                  <span className="ep-row__number">E{ep.episode_number}</span>
                </div>
                <div className="ep-row__body">
                  <div className="ep-row__top">
                    <p className="ep-row__title">{ep.name}</p>
                    {ep.vote_average > 0 && (
                      <span className="ep-row__rating">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6z" />
                        </svg>
                        {ep.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="ep-row__meta">
                    {ep.air_date ? new Date(ep.air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBA'}
                    {ep.runtime ? ` · ${ep.runtime}m` : ''}
                  </p>
                  <p className={`ep-row__overview ${expanded ? 'is-expanded' : ''}`}>
                    {ep.overview || 'No synopsis available.'}
                  </p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  className="ep-row__chevron"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
