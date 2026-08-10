import { Link } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';
import { useToast } from '../components/Toast';
import { IMG } from '../api/tmdb';
import './Watchlist.css';

export default function Watchlist() {
  const { items, toggle } = useWatchlist();
  const { show } = useToast();

  return (
    <div className="container browse">
      <div className="sprocket-rule">
        <span className="holes" aria-hidden="true"><span /><span /><span /><span /></span>
      </div>
      <h1>My List</h1>

      {items.length === 0 ? (
        <div className="watchlist-empty">
          <p>Your list is empty. Add titles from any movie or show page to keep track of what to watch next.</p>
          <Link to="/" className="btn btn--primary">Browse titles</Link>
        </div>
      ) : (
        <div className="watchlist-grid">
          {items.map((entry) => {
            const poster = IMG.poster(entry.poster_path, 'w342');
            return (
              <div key={`${entry.media_type}-${entry.id}`} className="watchlist-item">
                <Link to={`/${entry.media_type}/${entry.id}`} className="watchlist-item__link">
                  {poster ? (
                    <img src={poster} alt="" loading="lazy" />
                  ) : (
                    <div className="watchlist-item__placeholder">{entry.title}</div>
                  )}
                </Link>
                <div className="watchlist-item__meta">
                  <p>{entry.title}</p>
                  <button
                    className="watchlist-item__remove"
                    onClick={() => {
                      toggle(entry);
                      show(`Removed "${entry.title}" from your list`, 'remove');
                    }}
                    aria-label={`Remove ${entry.title} from list`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
