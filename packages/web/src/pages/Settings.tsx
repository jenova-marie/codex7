import { logger } from '../utils/logger.js';

/**
 * Settings page
 *
 * STUB: Shows placeholder settings
 * TODO Phase 1: Implement real settings management:
 * - API Key Management
 * - Indexing Configuration
 * - Search Preferences
 * - System Configuration
 */
export function Settings() {
  logger.debug('⚙️ Settings rendered');

  return (
    <div>
      <h2>⚙️ Settings</h2>
      <p><strong>STUB:</strong> Settings management coming in Phase 1!</p>
      <div style={{ marginTop: '1rem' }}>
        <h3>Placeholder Settings:</h3>
        <ul>
          <li>API Key Management</li>
          <li>Indexing Configuration</li>
          <li>Search Preferences</li>
          <li>System Configuration</li>
        </ul>
      </div>
    </div>
  );
}
