import './SetupNotice.css';

export default function SetupNotice() {
  return (
    <div className="setup container">
      <div className="setup__card">
        <span className="setup__eyebrow">One step left</span>
        <h1>Connect your TMDB key</h1>
        <p>
          FrostByte Movie Hub pulls live posters, ratings, and details from The Movie Database (TMDB).
          Add a free API key to bring it to life.
        </p>
        <ol>
          <li>
            Create a free account at{' '}
            <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer">
              themoviedb.org/signup
            </a>
          </li>
          <li>
            Go to <strong>Settings → API</strong> and request a free "Developer" API key
          </li>
          <li>
            Create a file named <code>.env.local</code> in the project root with:
            <pre>VITE_TMDB_API_KEY=your_key_here</pre>
          </li>
          <li>
            Restart the dev server (<code>npm run dev</code>), or for GitHub Pages, add
            <code> TMDB_API_KEY</code> as a repository secret so the deploy workflow can build with it
          </li>
        </ol>
        <p className="setup__note">
          This key is free, has no cost tier, and only reads public movie/TV metadata.
        </p>
      </div>
    </div>
  );
}
