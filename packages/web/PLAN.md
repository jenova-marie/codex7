# 🎨 Web UI - Framework Establishment Plan

> **Goal**: Create React + Vite web application skeleton with routing, components framework, API client, logging, and testing. NO actual features yet!

---

## 🎯 Package Purpose

The `@codex7/web` package provides:
- React 18 single-page application
- Vite for fast development and builds
- React Router for navigation
- API client for backend communication
- Component framework with TypeScript

**What we're NOT doing yet**: Implementing actual pages, data fetching, or real UI functionality.

---

## 🏗️ Foundation Phase Tasks

### 1. Project Structure Setup

```
packages/web/
├── src/
│   ├── main.tsx                   # App entry point
│   ├── App.tsx                    # Root component with routing
│   ├── pages/                     # Page components (stubs)
│   │   ├── Dashboard.tsx         # Dashboard page (stub)
│   │   ├── Libraries.tsx         # Libraries list (stub)
│   │   ├── AddSource.tsx         # Add source form (stub)
│   │   └── Settings.tsx          # Settings page (stub)
│   ├── components/                # Reusable components
│   │   ├── Layout.tsx            # Main layout wrapper
│   │   ├── Navbar.tsx            # Navigation bar
│   │   └── LoadingSpinner.tsx    # Loading indicator
│   ├── api/                       # API client
│   │   ├── client.ts             # Base API client
│   │   ├── libraries.ts          # Library endpoints (stubs)
│   │   └── search.ts             # Search endpoints (stubs)
│   ├── hooks/                     # Custom React hooks
│   │   ├── useLibraries.ts       # Hook for library data (stub)
│   │   └── useSearch.ts          # Hook for search (stub)
│   ├── types/                     # TypeScript types
│   │   └── api.ts                # API response types
│   ├── utils/                     # Utilities
│   │   └── logger.ts             # Logger setup
│   └── __tests__/                 # Tests
│       ├── App.test.tsx
│       └── components.test.tsx
├── public/                        # Static assets
│   └── codex7-logo.svg           # Logo placeholder
├── index.html                     # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

**Deliverable**: Complete directory structure.

---

### 2. Package Configuration

#### package.json
```json
{
  "name": "@codex7/web",
  "version": "0.1.0",
  "description": "Web UI for Codex7",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "@jenova-marie/wonder-logger": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "vitest": "^1.1.0",
    "@vitest/coverage-v8": "^1.1.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "jsdom": "^23.0.1"
  }
}
```

**Deliverable**: Config files ready.

---

### 3. Vite Configuration

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

#### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.tsx',
        '**/*.config.ts'
      ]
    }
  }
});
```

**Deliverable**: Vite and Vitest configured.

---

### 4. Root App Component

#### src/App.tsx
```typescript
import React from 'react';
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
 * Sets up routing and layout.
 * STUB: Pages return placeholder content.
 */
export function App() {
  logger.info('App rendered');

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
```

**Deliverable**: Root component with routing.

---

### 5. Layout Components

#### src/components/Layout.tsx
```typescript
import React, { type ReactNode } from 'react';
import { Navbar } from './Navbar.js';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout wrapper
 *
 * Provides consistent page structure with navigation.
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
      <footer style={{ padding: '1rem', textAlign: 'center', background: '#f5f5f5' }}>
        <p>Codex7 - Made with 💜 by the community</p>
      </footer>
    </div>
  );
}
```

#### src/components/Navbar.tsx
```typescript
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Navigation bar component
 */
export function Navbar() {
  return (
    <nav style={{
      background: '#8b5cf6',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      gap: '2rem',
      alignItems: 'center'
    }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
        🚀 Codex7
      </h1>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          Dashboard
        </Link>
        <Link to="/libraries" style={{ color: 'white', textDecoration: 'none' }}>
          Libraries
        </Link>
        <Link to="/add-source" style={{ color: 'white', textDecoration: 'none' }}>
          Add Source
        </Link>
        <Link to="/settings" style={{ color: 'white', textDecoration: 'none' }}>
          Settings
        </Link>
      </div>
    </nav>
  );
}
```

#### src/components/LoadingSpinner.tsx
```typescript
import React from 'react';

/**
 * Loading spinner component
 */
export function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #8b5cf6',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        margin: '0 auto'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
```

**Deliverable**: Layout and reusable components.

---

### 6. Page Components (Stubs)

#### src/pages/Dashboard.tsx
```typescript
import React from 'react';
import { logger } from '../utils/logger.js';

/**
 * Dashboard page
 *
 * STUB: Shows placeholder content
 */
export function Dashboard() {
  logger.debug('Dashboard rendered');

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
```

#### src/pages/Libraries.tsx
```typescript
import React from 'react';
import { logger } from '../utils/logger.js';

/**
 * Libraries list page
 *
 * STUB: Shows placeholder library list
 */
export function Libraries() {
  logger.debug('Libraries rendered');

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
```

#### src/pages/AddSource.tsx
```typescript
import React, { useState } from 'react';
import { logger } from '../utils/logger.js';

/**
 * Add source page
 *
 * STUB: Form doesn't actually submit
 */
export function AddSource() {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('Form submitted (STUB)', { url });
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
```

#### src/pages/Settings.tsx
```typescript
import React from 'react';
import { logger } from '../utils/logger.js';

/**
 * Settings page
 *
 * STUB: Shows placeholder settings
 */
export function Settings() {
  logger.debug('Settings rendered');

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
```

**Deliverable**: All page components as stubs.

---

### 7. API Client (Stub)

#### src/api/client.ts
```typescript
import { logger } from '../utils/logger.js';

/**
 * Base API client
 *
 * Handles HTTP requests to backend API.
 * STUB: Methods return mock data for now.
 */
export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    logger.info('API Client initialized', { baseURL });
  }

  /**
   * Make GET request
   * STUB: Returns mock data
   */
  async get<T>(path: string): Promise<T> {
    logger.debug('GET request (STUB)', { path });

    // TODO Phase 1: Implement real fetch
    // const response = await fetch(`${this.baseURL}${path}`);
    // return response.json();

    return {} as T;
  }

  /**
   * Make POST request
   * STUB: Returns mock data
   */
  async post<T>(path: string, data: any): Promise<T> {
    logger.debug('POST request (STUB)', { path, data });

    // TODO Phase 1: Implement real fetch
    // const response = await fetch(`${this.baseURL}${path}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // return response.json();

    return {} as T;
  }
}

/**
 * Global API client instance
 */
export const apiClient = new APIClient();
```

#### src/api/libraries.ts
```typescript
import { apiClient } from './client.js';
import type { Library } from '../types/api.js';

/**
 * Library API endpoints
 *
 * STUB: All methods return empty arrays/objects
 */
export const librariesAPI = {
  /**
   * List all libraries
   */
  async list(): Promise<Library[]> {
    return apiClient.get<Library[]>('/libraries');
  },

  /**
   * Add new library source
   */
  async add(source: { type: string; url: string }): Promise<{ job_id: string }> {
    return apiClient.post('/libraries', source);
  }
};
```

**Deliverable**: API client framework with stubs.

---

### 8. Entry Point

#### src/main.tsx
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import { logger } from './utils/logger.js';

logger.info('Codex7 Web UI starting...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Codex7 - Open Source Documentation MCP Server</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
          Ubuntu, Cantarell, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Deliverable**: Entry point and HTML template.

---

### 9. Logger Setup

#### src/utils/logger.ts
```typescript
import { createLogger } from '@jenova-marie/wonder-logger';

/**
 * Logger instance for web UI
 */
export const logger = createLogger({
  serviceName: 'web',
  environment: import.meta.env.MODE || 'development',
  logLevel: 'info',
  prettyPrint: import.meta.env.DEV
});
```

---

### 10. Testing Framework

#### src/__tests__/setup.ts
```typescript
import '@testing-library/jest-dom';
```

#### src/__tests__/App.test.tsx
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App.js';

describe('App', () => {
  it('should render navigation', () => {
    render(<App />);

    expect(screen.getByText(/Codex7/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('should render footer', () => {
    render(<App />);

    expect(screen.getByText(/Made with 💜/i)).toBeInTheDocument();
  });
});
```

#### src/__tests__/components.test.tsx
```typescript
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
  });
});

describe('LoadingSpinner', () => {
  it('should render spinner', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});
```

**Deliverable**: Test suite with React Testing Library.

---

### 11. Types

#### src/types/api.ts
```typescript
/**
 * API response types
 */

export interface Library {
  id: string;
  name: string;
  identifier: string;
  description: string | null;
  repositoryUrl: string | null;
  trustScore: number;
}

export interface SearchResult {
  title: string;
  content: string;
  library: string;
  url: string;
  relevanceScore: number;
}
```

**Deliverable**: TypeScript types for API responses.

---

## ✅ Success Criteria

This phase is complete when:

- [ ] All directories and files created
- [ ] `pnpm install` runs successfully
- [ ] `pnpm build` compiles without errors
- [ ] `pnpm dev` starts dev server on port 5173
- [ ] `pnpm test` runs all tests
- [ ] All 4 pages render with placeholder content
- [ ] Navigation works between pages
- [ ] No TypeScript errors
- [ ] README.md documents usage

---

## 🚫 What We're NOT Doing

- ❌ Fetching real data from API
- ❌ Implementing actual forms
- ❌ Adding real UI styling (just basic inline styles)
- ❌ State management (Redux, Zustand, etc.)
- ❌ User authentication UI

---

## 📚 References

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Architecture](../../docs/ARCHITECTURE.md) - Web UI design

---

**Made with 💜 by the Codex7 team**

*"Building React foundations, one component at a time"* 🎨✨
