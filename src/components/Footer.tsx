import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="sprocket-rule">
          <span className="holes" aria-hidden="true">
            <span /><span /><span /><span /><span /><span />
          </span>
        </div>
        <div className="site-footer__grid">
          <div>
            <p className="site-footer__brand">FROSTBYTE MOVIE HUB</p>
            <p className="site-footer__tag">Discover films &amp; series worth your evening.</p>
          </div>
          <div className="site-footer__meta">
            <p>Movie and TV metadata provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
            <p className="site-footer__credit">Built by FrostByte</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
