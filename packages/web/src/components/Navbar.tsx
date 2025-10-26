/**
 * Codex7 - Web Dashboard
 *
 * Copyright (C) 2025 Jenova Marie and Codex7 Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
