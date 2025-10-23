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
