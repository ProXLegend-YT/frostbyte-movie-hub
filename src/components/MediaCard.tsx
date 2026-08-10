import { Link } from 'react-router-dom';
import type { MediaItem } from '../types/tmdb';
import { IMG } from '../api/tmdb';
import { kindOf, ratingOf, titleOf, yearOf } from '../utils/media';
import './MediaCard.css';

interface Props {
  item: MediaItem;
  rank?: number;
}

export default function MediaCard({ item, rank }: Props) {
  const kind = kindOf(item);
  const poster = IMG.poster(item.poster_path, 'w342');

  return (
    <Link to={`/${kind}/${item.id}`} className="media-card" aria-label={`${titleOf(item)}, ${yearOf(item)}`}>
      {rank !== undefined && <span className="media-card__rank">{rank}</span>}
      <div className="media-card__frame">
        {poster ? (
          <img src={poster} alt="" loading="lazy" className="media-card__poster" />
        ) : (
          <div className="media-card__placeholder" aria-hidden="true">
            <span>{titleOf(item)}</span>
          </div>
        )}
        <div className="media-card__sheen" aria-hidden="true" />
        <div className="media-card__badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6z" />
          </svg>
          {ratingOf(item)}
        </div>
      </div>
      <div className="media-card__meta">
        <p className="media-card__title">{titleOf(item)}</p>
        <p className="media-card__year">{yearOf(item)} · {kind === 'tv' ? 'Series' : 'Film'}</p>
      </div>
    </Link>
  );
}
