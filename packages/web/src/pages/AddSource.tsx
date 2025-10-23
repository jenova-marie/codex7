import { useState } from 'react';
import { logger } from '../utils/logger.js';

/**
 * Add source page
 *
 * STUB: Form doesn't actually submit
 * TODO Phase 1: Implement real form that:
 * - Validates GitHub repository URLs
 * - Submits to API to queue indexing job
 * - Shows job progress/status
 * - Handles errors gracefully
 */
export function AddSource() {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logger.info({ url }, '➕ Form submitted (STUB)');
    alert('STUB: Form submission not implemented yet!');
  };

  return (
    <div>
      <h2>➕ Add Documentation Source</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            GitHub Repository URL:
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/facebook/react"
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            background: '#8b5cf6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Add Source (STUB)
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <strong>STUB:</strong> Real implementation in Phase 1 will queue indexing job! 🚀
      </p>
    </div>
  );
}
