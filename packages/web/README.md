# 🎨 Codex7 Web UI

React + Vite web dashboard for Codex7 documentation MCP server.

---

## 🎯 Status

**Phase 0: Foundation Complete** ✅

This package provides the web UI framework with:
- React 18 + TypeScript
- Vite for fast development
- React Router for navigation
- Stub pages ready for Phase 1 implementation

**Current Implementation:**
- ✅ Project structure and configuration
- ✅ Basic routing (Dashboard, Libraries, Add Source, Settings)
- ✅ Layout components (Navbar, Footer)
- ✅ Logging with wonder-logger
- ✅ Test framework with Vitest
- ⏳ **All pages show placeholder content** - real functionality coming in Phase 1!

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

```bash
# From monorepo root
pnpm install

# Install web package dependencies
pnpm --filter @codex7/web install
```

### Development

```bash
# Start dev server (http://localhost:5173)
pnpm --filter @codex7/web dev

# Build for production
pnpm --filter @codex7/web build

# Preview production build
pnpm --filter @codex7/web preview

# Run tests
pnpm --filter @codex7/web test

# Run tests in watch mode
pnpm --filter @codex7/web test:watch

# Generate coverage report
pnpm --filter @codex7/web test:coverage

# Type checking
pnpm --filter @codex7/web type-check
```

---

## 📁 Project Structure

```
packages/web/
├── src/
│   ├── main.tsx                   # App entry point
│   ├── App.tsx                    # Root component with routing
│   ├── pages/                     # Page components (stubs)
│   │   ├── Dashboard.tsx         # Dashboard page
│   │   ├── Libraries.tsx         # Libraries list
│   │   ├── AddSource.tsx         # Add source form
│   │   └── Settings.tsx          # Settings page
│   ├── components/                # Reusable components
│   │   ├── Layout.tsx            # Main layout wrapper
│   │   ├── Navbar.tsx            # Navigation bar
│   │   └── LoadingSpinner.tsx    # Loading indicator
│   ├── api/                       # API client
│   │   ├── client.ts             # Base API client
│   │   └── libraries.ts          # Library endpoints (stubs)
│   ├── types/                     # TypeScript types
│   │   └── api.ts                # API response types
│   ├── utils/                     # Utilities
│   │   └── logger.ts             # Logger setup
│   └── __tests__/                 # Tests
│       ├── setup.ts
│       ├── App.test.tsx
│       └── components.test.tsx
├── public/                        # Static assets
├── index.html                     # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

---

## 🧪 Testing

Tests are written using Vitest and React Testing Library.

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

**Coverage goal:** 80%+ (enforced in CI)

---

## 🔧 Configuration

### Vite

- **Dev server:** Port 5173
- **API proxy:** `/api` → `http://localhost:3000`
- **Hot reload:** Enabled
- **Source maps:** Generated for debugging

### TypeScript

- **Strict mode:** Enabled
- **Target:** ES2020
- **JSX:** react-jsx
- **Path references:** Links to `@codex7/shared`

### Logging

Uses `@jenova-marie/wonder-logger` for structured logging:
- Console output in development (pretty-printed)
- JSON output in production
- Log level: `info`

---

## 🎨 Current Pages (Stubs)

### Dashboard (`/`)
Placeholder showing future dashboard features:
- Indexed library count
- Recent activity
- System health
- Quick stats

### Libraries (`/libraries`)
Placeholder library list with mock data

### Add Source (`/add-source`)
Form stub for adding GitHub repositories

### Settings (`/settings`)
Placeholder settings management

**All pages are functional stubs ready for Phase 1 implementation!**

---

## 🚧 Phase 1 TODO

- [ ] Implement real API client with fetch
- [ ] Add data fetching to all pages
- [ ] Implement library listing with search/filter
- [ ] Add working form submission for Add Source
- [ ] Implement settings management
- [ ] Add proper CSS styling (Tailwind/CSS modules)
- [ ] Add state management (React Query/Zustand)
- [ ] Implement error boundaries
- [ ] Add loading states
- [ ] Create reusable UI components

---

## 📚 Dependencies

### Runtime
- `react` ^18.2.0
- `react-dom` ^18.2.0
- `react-router-dom` ^6.21.1
- `@codex7/shared` workspace:*
- `@jenova-marie/wonder-logger` ^1.0.12

### Development
- `vite` ^5.0.8
- `vitest` ^1.1.0
- `@testing-library/react` ^14.1.2
- `@testing-library/jest-dom` ^6.1.5
- TypeScript, ESLint, etc.

---

## 🤝 Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

When working on the web UI:
1. Keep components small and focused
2. Use TypeScript for all files
3. Write tests for new components
4. Follow the existing code style
5. Use wonder-logger for logging

---

## 📖 Documentation

- [Project Plan](./PLAN.md) - Complete implementation plan
- [Architecture](../../docs/ARCHITECTURE.md) - System design
- [Testing Guide](../../docs/TESTING.md) - Testing patterns

---

**Made with 💜 by the Codex7 team**

*"Building beautiful interfaces, one component at a time"* 🎨✨
