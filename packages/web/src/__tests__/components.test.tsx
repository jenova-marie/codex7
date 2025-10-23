/**
 * 🧪 Tests for components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';

describe('Navbar', () => {
  it('should render navigation links', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Libraries')).toBeInTheDocument();
    expect(screen.getByText('Add Source')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render Codex7 title', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Codex7/i })).toBeInTheDocument();
  });
});

describe('LoadingSpinner', () => {
  it('should render spinner', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});
