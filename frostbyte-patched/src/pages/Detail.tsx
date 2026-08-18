import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdb, IMG } from '../api/tmdb';
import type { MediaDetail, MediaKind } from '../types/tmdb';
import { ratingOf, runtimeLabel, titleOf, yearOf } from '../utils/media';
import { useWatchlist } from '../hooks/useWatchlist';
import { useToast } from '../components/Toast';
import Row from '../components/Row';
import TrailerModal from '../components/TrailerModal';
import WatchModal from '../components/WatchModal';
import SeasonBrowser from '../components/SeasonBrowser';
import WatchProviders from '../components/WatchProviders';
import './Detail.css';

export default function Detail() {
  const { kind, id } = useParams<{ kind: MediaKind; id: string }>();
  const [item, setItem] = useState<MediaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [watchOpen, setWatchOpen] = useState(false);
  const { has, toggle } = useWatchlist();
  const { show } = useToast();

  useEffect(() => {
    if (!kind || !id) return;
    let cancelled = false;
    setLoading(true);
    setItem(null);

    tmdb
      .detail(kind, Number(id))
      .then((res) => {
        if (!cancelled) setItem(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load this title.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    return () => {
      cancelled = true;
    };
  }, [kind, id]);

  if (loading) {
    return (
      <div className="detail-loading" aria-busy="true">
        <div className="skel" style={{ height: '52vh' }} />
      </div>
    );
  }

  if (error || !item || !kind) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--stock-dim)' }}>{error ?? 'Title not found.'}</p>
        <Link to="/" className="btn btn--ghost" style={{ marginTop: 20 }}>
          Back home
        </Link>
      </div>
    );
  }

  const backdrop = IMG.backdrop(item.backdrop_path, 'original');
  const poster = IMG.poster(item.poster_path, 'w500');
  const trailer = item.videos?.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official)
    ?? item.videos?.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer');
  const cast = item.credits?.cast.slice(0, 10) ?? [];
  const director = item.credits?.crew.find((c) => c.job === 'Director');
  const inWatchlist = has(item.id, kind);
  const runtime = kind === 'movie' ? runtimeLabel(item.runtime) : item.episode_run_time?.[0] ? `${item.episode_run_time[0]}m / ep` : '';

  return (
    <div className="detail">
      <div className="detail__backdrop" style={backdrop ? { backgroundImage: `url(${backdrop})` } : undefined}>
        <div className="detail__backdrop-fade" />
      </div>

      <div className="container detail__content">
        <div className="detail__main">
          <div className="detail__poster-wrap">
            {poster ? (
              <img src={poster} alt="" className="detail__poster" />
            ) : (
              <div className="detail__poster detail__poster--empty">{titleOf(item)}</div>
            )}
          </div>

          <div className="detail__info">
            <p className="detail__type">{kind === 'tv' ? 'Series' : 'Film'} {item.status ? `· ${item.status}` : ''}</p>
            <h1>{titleOf(item)}</h1>
            {item.tagline && <p className="detail__tagline">"{item.tagline}"</p>}

            <div className="detail__facts">
              <span className="detail__rating">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6z" />
                </svg>
                {ratingOf(item)} <span className="detail__votes">({item.vote_count.toLocaleString()})</span>
              </span>
              <span>{yearOf(item)}</span>
              {runtime && <span>{runtime}</span>}
              {kind === 'tv' && item.number_of_seasons && (
                <span>{item.number_of_seasons} season{item.number_of_seasons > 1 ? 's' : ''}</span>
              )}
            </div>

            {item.genres?.length > 0 && (
              <div className="detail__genres">
                {item.genres.map((g) => (
                  <Link key={g.id} to={`/${kind}/genre/${g.id}`} className="detail__genre-pill">
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            <WatchProviders kind={kind} id={item.id} />

            <p className="detail__overview">{item.overview || 'No synopsis available for this title yet.'}</p>

            {director && <p className="detail__crew"><strong>Director:</strong> {director.name}</p>}

            <div className="detail__actions">
              {/* Watch Now — real movie embed via vidsrc.to */}
              <button className="btn btn--primary" onClick={() => setWatchOpen(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                Watch Now
              </button>
              <button
                className={`btn ${inWatchlist ? 'btn--ghost' : 'btn--ghost'}`}
                onClick={() => {
                  toggle({
                    id: item.id,
                    media_type: kind,
                    title: titleOf(item),
                    poster_path: item.poster_path,
                    vote_average: item.vote_average,
                    addedAt: Date.now(),
                  });
                  show(
                    inWatchlist ? `Removed "${titleOf(item)}" from your list` : `Added "${titleOf(item)}" to your list`,
                    inWatchlist ? 'remove' : 'success'
                  );
                }}
              >
                {inWatchlist ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>
                    In your list
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14" /></svg>
                    Add to list
                  </>
                )}
              </button>
              {trailer && (
                <button className="btn btn--ghost" onClick={() => setTrailerOpen(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  Watch trailer
                </button>
              )}
            </div>
          </div>
        </div>

        {cast.length > 0 && (
          <section className="detail__cast" aria-label="Cast">
            <div className="sprocket-rule">
              <span className="holes" aria-hidden="true"><span /><span /><span /></span>
            </div>
            <h2>Cast</h2>
            <div className="detail__cast-scroller">
              {cast.map((c) => {
                const photo = IMG.profile(c.profile_path);
                return (
                  <Link key={c.id} to={`/person/${c.id}`} className="cast-chip">
                    {photo ? (
                      <img src={photo} alt="" loading="lazy" />
                    ) : (
                      <div className="cast-chip__placeholder" aria-hidden="true">
                        {c.name.charAt(0)}
                      </div>
                    )}
                    <p className="cast-chip__name">{c.name}</p>
                    <p className="cast-chip__role">{c.character}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {kind === 'tv' && item.seasons && item.seasons.length > 0 && (
          <SeasonBrowser tvId={item.id} seasons={item.seasons} />
        )}
      </div>

      {item.similar && item.similar.results.length > 0 && (
        <div className="container">
          <Row title="You Might Also Like" eyebrow="Because you're viewing this" items={item.similar.results.map((r) => ({ ...r, media_type: kind }))} />
        </div>
      )}

      {trailerOpen && trailer && (
        <TrailerModal videoKey={trailer.key} title={titleOf(item)} onClose={() => setTrailerOpen(false)} />
      )}

      {watchOpen && (
        <WatchModal
          id={item.id}
          kind={kind}
          title={titleOf(item)}
          season={1}
          episode={1}
          onClose={() => setWatchOpen(false)}
        />
      )}
    </div>
  );
}
