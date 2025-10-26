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
