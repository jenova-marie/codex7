import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import { logger } from './utils/logger.js';

logger.info('🎨 Codex7 Web UI starting...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
