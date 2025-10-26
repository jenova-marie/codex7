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
 * Dashboard page
 *
 * STUB: Shows placeholder content
 * TODO Phase 1: Implement real dashboard with:
 * - Indexed library count
 * - Recent indexing activity
 * - System health status
 * - Quick stats
 */
export function Dashboard() {
  logger.debug('📊 Dashboard rendered');

  return (
    <div>
      <h2>📊 Dashboard</h2>
      <p>Welcome to Codex7! This is a placeholder dashboard.</p>
      <p><strong>STUB:</strong> Real dashboard will show:</p>
      <ul>
        <li>Indexed library count</li>
        <li>Recent indexing activity</li>
        <li>System health status</li>
        <li>Quick stats</li>
      </ul>
      <p>Implementation coming in Phase 1! 🚀</p>
    </div>
  );
}
