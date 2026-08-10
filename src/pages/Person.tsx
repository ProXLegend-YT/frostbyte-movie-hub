import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdb, IMG, type PersonDetail } from '../api/tmdb';
import { kindOf, ratingOf, titleOf, yearOf } from '../utils/media';
import './Person.css';

export default function Person() {
  const { id } = useParams();
  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    tmdb
      .person(Number(id))
      .then((res) => {
        if (!cancelled) setPerson(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container person-loading">
        <div className="skel" style={{ width: 160, height: 160, borderRadius: '50%' }} />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--stock-dim)' }}>Person not found.</p>
      </div>
    );
  }

  const photo = IMG.profile(person.profile_path, 'w342');
  const credits = (person.combined_credits?.cast ?? [])
    .filter((c) => c.poster_path)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 24);

  return (
    <div className="container person">
      <div className="person__header">
        <div className="person__photo-wrap">
          {photo ? (
            <img src={photo} alt="" className="person__photo" />
          ) : (
            <div className="person__photo person__photo--empty">{person.name.charAt(0)}</div>
          )}
        </div>
        <div className="person__info">
          <p className="person__eyebrow">{person.known_for_department}</p>
          <h1>{person.name}</h1>
          <div className="person__facts">
            {person.birthday && <span>Born {new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
            {person.place_of_birth && <span>{person.place_of_birth}</span>}
          </div>
          {person.biography && <p className="person__bio">{person.biography}</p>}
        </div>
      </div>

      {credits.length > 0 && (
        <section className="person__credits">
          <div className="sprocket-rule">
            <span className="holes" aria-hidden="true"><span /><span /><span /><span /></span>
          </div>
          <h2>Known for</h2>
          <div className="person__grid">
            {credits.map((c) => {
              const kind = kindOf(c);
              const poster = IMG.poster(c.poster_path, 'w342');
              return (
                <Link key={`${kind}-${c.id}`} to={`/${kind}/${c.id}`} className="person__credit">
                  {poster && <img src={poster} alt="" loading="lazy" />}
                  <div className="person__credit-meta">
                    <p>{titleOf(c)}</p>
                    <span>{yearOf(c)} · ★ {ratingOf(c)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
