import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CommandSearch from './CommandSearch';
import SurpriseMe from './SurpriseMe';
import './Header.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      <div className="container site-header__inner">
        <Link to="/" className="brand" aria-label="FrostByte Movie Hub home">
          <span className="brand__mark" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="2.4" fill="currentColor" />
              <circle cx="12" cy="4.2" r="1.5" fill="currentColor" />
              <circle cx="18.8" cy="8.1" r="1.5" fill="currentColor" />
              <circle cx="18.8" cy="15.9" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19.8" r="1.5" fill="currentColor" />
              <circle cx="5.2" cy="15.9" r="1.5" fill="currentColor" />
              <circle cx="5.2" cy="8.1" r="1.5" fill="currentColor" />
            </svg>
          </span>
          <span className="brand__text">
            FROSTBYTE<span className="brand__accent">MOVIE HUB</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <Link to="/movies">Movies</Link>
          <Link to="/tv">TV Shows</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/watchlist">My List</Link>
        </nav>

        <SurpriseMe />

        <button className="site-search" onClick={() => setSearchOpen(true)} aria-label="Search movies and TV shows">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <span>Search titles...</span>
          <kbd>/</kbd>
        </button>

        <button
          className="menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <button
            className="site-search site-search--mobile"
            onClick={() => {
              setSearchOpen(true);
              setMenuOpen(false);
            }}
            aria-label="Search movies and TV shows"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <span>Search titles...</span>
          </button>
          <Link to="/movies">Movies</Link>
          <Link to="/tv">TV Shows</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/watchlist">My List</Link>
          <SurpriseMe />
        </div>
      )}

      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
