import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout.js';
import { Dashboard } from './pages/Dashboard.js';
import { Libraries } from './pages/Libraries.js';
import { AddSource } from './pages/AddSource.js';
import { Settings } from './pages/Settings.js';
import { logger } from './utils/logger.js';

/**
 * Root application component
 *
 * Sets up routing and layout for the entire application.
 * All pages are wrapped in the Layout component for consistent structure.
 *
 * STUB: Pages return placeholder content.
 * TODO Phase 1: Add real data fetching and functionality.
 */
export function App() {
  logger.info('🚀 App rendered');

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/libraries" element={<Libraries />} />
          <Route path="/add-source" element={<AddSource />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
