import { useEffect, useState } from 'react';
import { tmdb } from '../api/tmdb';
import type { WatchProviderRegion } from '../api/tmdb';
import type { MediaKind } from '../types/tmdb';
import './WatchProviders.css';

interface Props {
  kind: MediaKind;
  id: number;
}

const LOGO_BASE = 'https://image.tmdb.org/t/p/w92';

// Best-effort region guess from the browser locale; falls back to US.
function guessRegion(): string {
  try {
    const locale = navigator.language || 'en-US';
    const parts = locale.split('-');
    return parts[1]?.toUpperCase() || 'US';
  } catch {
    return 'US';
  }
}

export default function WatchProviders({ kind, id }: Props) {
  const [region, setRegion] = useState<WatchProviderRegion | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    tmdb
      .watchProviders(kind, id)
      .then((res) => {
        if (cancelled) return;
        const preferred = guessRegion();
        const data = res.results[preferred] ?? res.results.US ?? null;
        if (!data) {
          setNotFound(true);
        } else {
          setRegion(data);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [kind, id]);

  if (loading) {
    return (
      <div className="watch-providers watch-providers--loading" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skel" style={{ width: 40, height: 40, borderRadius: 10 }} />
        ))}
      </div>
    );
  }

  if (notFound || !region) return null;

  const flatrate = region.flatrate ?? [];
  const rent = region.rent ?? [];
  const buy = region.buy ?? [];

  if (!flatrate.length && !rent.length && !buy.length) return null;

  const renderGroup = (label: string, list: typeof flatrate) =>
    list.length > 0 && (
      <div className="watch-providers__group">
        <span className="watch-providers__label">{label}</span>
        <div className="watch-providers__logos">
          {list.slice(0, 6).map((p) => (
            <a
              key={p.provider_id}
              href={region.link}
              target="_blank"
              rel="noreferrer"
              className="watch-providers__logo"
              title={p.provider_name}
            >
              <img src={`${LOGO_BASE}${p.logo_path}`} alt={p.provider_name} loading="lazy" />
            </a>
          ))}
        </div>
      </div>
    );

  return (
    <div className="watch-providers">
      {renderGroup('Stream', flatrate)}
      {renderGroup('Rent', rent)}
      {renderGroup('Buy', buy)}
      <a href={region.link} target="_blank" rel="noreferrer" className="watch-providers__jw">
        More options
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
          <path d="M7 17L17 7M7 7h10v10" />
        </svg>
      </a>
    </div>
  );
}
