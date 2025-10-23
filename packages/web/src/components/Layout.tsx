import { type ReactNode } from 'react';
import { Navbar } from './Navbar.js';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout wrapper
 *
 * Provides consistent page structure with navigation and footer.
 * Used by all pages to maintain consistent layout.
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
      <footer style={{ padding: '1rem', textAlign: 'center', background: '#f5f5f5' }}>
        <p>Codex7 - Made with 💜 by the community</p>
      </footer>
    </div>
  );
}
