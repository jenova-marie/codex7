import { Link } from 'react-router-dom';

/**
 * Navigation bar component
 *
 * Provides top-level navigation between main pages.
 * Uses inline styles for simplicity in Phase 0.
 */
export function Navbar() {
  return (
    <nav style={{
      background: '#8b5cf6',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      gap: '2rem',
      alignItems: 'center'
    }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
        🚀 Codex7
      </h1>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          Dashboard
        </Link>
        <Link to="/libraries" style={{ color: 'white', textDecoration: 'none' }}>
          Libraries
        </Link>
        <Link to="/add-source" style={{ color: 'white', textDecoration: 'none' }}>
          Add Source
        </Link>
        <Link to="/settings" style={{ color: 'white', textDecoration: 'none' }}>
          Settings
        </Link>
      </div>
    </nav>
  );
}
