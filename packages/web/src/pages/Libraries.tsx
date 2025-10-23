import { logger } from '../utils/logger.js';

/**
 * Libraries list page
 *
 * STUB: Shows placeholder library list
 * TODO Phase 1: Implement real library list with:
 * - Fetched data from API
 * - Search/filter functionality
 * - Sorting options
 * - Pagination
 */
export function Libraries() {
  logger.debug('📚 Libraries rendered');

  return (
    <div>
      <h2>📚 Libraries</h2>
      <p><strong>STUB:</strong> This page will list all indexed libraries.</p>
      <div style={{
        border: '1px solid #ddd',
        padding: '1rem',
        borderRadius: '8px',
        marginTop: '1rem'
      }}>
        <h3>Placeholder Library</h3>
        <p>Source: github.com/example/repo</p>
        <p>Status: Indexed</p>
        <p>Last updated: 2025-01-22</p>
      </div>
      <p style={{ marginTop: '1rem' }}>
        Real implementation in Phase 1! 🚀
      </p>
    </div>
  );
}
