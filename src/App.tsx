import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SetupNotice from './components/SetupNotice';
import { ToastProvider } from './components/Toast';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Detail from './pages/Detail';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import Person from './pages/Person';
import Explore from './pages/Explore';
import './App.css';

const hasKey = Boolean(import.meta.env.VITE_TMDB_API_KEY);

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  if (!hasKey) {
    return (
      <>
        <Header />
        <SetupNotice />
        <Footer />
      </>
    );
  }

  return (
    <ToastProvider>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/movies" element={<Browse kind="movie" />} />
          <Route path="/movies/genre/:genreId" element={<Browse kind="movie" />} />
          <Route path="/tv" element={<Browse kind="tv" />} />
          <Route path="/tv/genre/:genreId" element={<Browse kind="tv" />} />
          <Route path="/search" element={<Search />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/person/:id" element={<Person />} />
          <Route path="/:kind/:id" element={<Detail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ScrollToTop />
    </ToastProvider>
  );
}

function NotFound() {
  return (
    <div className="container" style={{ padding: '140px 0', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem' }}>Reel missing</h1>
      <p style={{ color: 'var(--stock-dim)' }}>We couldn't find that page.</p>
    </div>
  );
}
