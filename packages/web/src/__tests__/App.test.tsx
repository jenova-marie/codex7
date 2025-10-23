/**
 * 🧪 Tests for App component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App.js';

describe('App', () => {
  it('should render navigation', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Codex7/i })).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render footer', () => {
    render(<App />);

    expect(screen.getByText(/Made with 💜/i)).toBeInTheDocument();
  });

  it('should render dashboard by default', () => {
    render(<App />);

    expect(screen.getByText(/Welcome to Codex7/i)).toBeInTheDocument();
  });
});
