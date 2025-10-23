# 📚 make-docs - Generate TypeDoc HTML Documentation

Generate beautiful HTML API documentation from TSDoc comments using TypeDoc.

## Purpose

Runs TypeDoc to generate HTML documentation for the current package, outputting to `./api-docs/` directory. User decides when to run this (typically before releases).

## When to Use

- **Before releases** - Generate docs for new version
- **After major changes** - Update published API docs
- **For review** - Preview documentation locally
- **Before publishing** - Ensure docs are current

## Scope

- **Target**: Current package only (run from package directory)
- **Input**: TSDoc comments in `src/**/*.ts` and `src/**/*.tsx`
- **Output**: HTML documentation in `./api-docs/`
- **Publishing**: GitHub Pages at `https://codex7.dev/api-docs/`

## Prerequisites

Ensure TypeDoc is installed:

```bash
# Should already be in devDependencies
pnpm add -D typedoc

# Verify installation
pnpm typedoc --version
```

## Workflow

### Step 1: Clean Previous Build

Remove old generated docs:

```bash
rm -rf ./api-docs
```

### Step 2: Run TypeDoc

Generate documentation:

```bash
pnpm typedoc \
  --out ./api-docs \
  --entryPoints src/index.ts \
  --exclude "**/*.test.ts" \
  --exclude "**/__tests__/**" \
  --excludePrivate \
  --readme README.md \
  --name "@codex7/package-name" \
  --includeVersion
```

### Step 3: Verify Output

Check generated files:

```bash
ls -la ./api-docs/
# Should see:
#   index.html
#   modules/
#   classes/
#   interfaces/
#   ...
```

### Step 4: Preview Locally

Open in browser:

```bash
open ./api-docs/index.html
```

### Step 5: Report Results

```
📚 Documentation generated successfully!

Output: ./api-docs/
Modules: 12
Classes: 8
Interfaces: 15
Functions: 45

Preview:
  open ./api-docs/index.html

To publish to GitHub Pages:
  git add api-docs/
  git commit -m "📚 docs: update API documentation"
  git push
```

## TypeDoc Configuration

Reference: https://typedoc.org/

### Common Options

```bash
# Entry point
--entryPoints src/index.ts

# Output directory
--out ./api-docs

# Exclude patterns
--exclude "**/*.test.ts"
--exclude "**/__tests__/**"

# Privacy settings
--excludePrivate        # Skip private members
--excludeProtected      # Skip protected members
--excludeInternal       # Skip @internal tagged items

# Display options
--name "Package Name"   # Documentation title
--readme README.md      # Include README in docs
--includeVersion        # Add version from package.json

# Theme
--theme default         # or 'minimal'
```

### Package-Specific Config

Create `typedoc.json` in package root:

```json
{
  "entryPoints": ["src/index.ts"],
  "out": "./api-docs",
  "exclude": [
    "**/*.test.ts",
    "**/__tests__/**",
    "**/__fixtures__/**"
  ],
  "excludePrivate": true,
  "excludeInternal": true,
  "readme": "README.md",
  "name": "@codex7/shared",
  "includeVersion": true,
  "navigation": {
    "includeCategories": true,
    "includeGroups": true
  },
  "categorizeByGroup": true,
  "sort": ["source-order"]
}
```

Then run simply:
```bash
pnpm typedoc
```

## Output Structure

```
api-docs/
├── index.html              # Main entry point
├── modules.html            # Module overview
├── classes/                # Class documentation
│   ├── StorageAdapter.html
│   └── ...
├── interfaces/             # Interface documentation
│   ├── Library.html
│   └── ...
├── functions/              # Function documentation
│   ├── parseLibraryId.html
│   └── ...
├── types/                  # Type alias documentation
├── enums/                  # Enum documentation
└── assets/                 # CSS, JS, images
    ├── style.css
    ├── main.js
    └── ...
```

## Organizing Documentation

### Using @category

Group related items:

```typescript
/**
 * Parses a library identifier.
 *
 * @category Library Utils
 */
export function parseLibraryId(id: string): Result<LibraryId, Error> {
  // ...
}

/**
 * Formats a library identifier.
 *
 * @category Library Utils
 */
export function formatLibraryId(lib: LibraryId): string {
  // ...
}
```

### Using @group

Group module exports:

```typescript
/**
 * Core storage adapter interface.
 *
 * @group Storage
 */
export interface StorageAdapter {
  // ...
}

/**
 * PostgreSQL implementation.
 *
 * @group Storage
 */
export class PostgresAdapter implements StorageAdapter {
  // ...
}
```

## Publishing to GitHub Pages

### One-Time Setup

1. Create `gh-pages` branch
2. Configure GitHub Pages to use `gh-pages` branch
3. Set custom domain: `codex7.dev`

### Publishing Workflow

```bash
# Generate docs for all packages
cd packages/shared && pnpm typedoc && cd ../..
cd packages/mcp-server && pnpm typedoc && cd ../..
cd packages/api && pnpm typedoc && cd ../..

# Collect all api-docs/ directories
mkdir -p gh-pages/api
cp -r packages/shared/api-docs gh-pages/api/shared
cp -r packages/mcp-server/api-docs gh-pages/api/mcp-server
cp -r packages/api/api-docs gh-pages/api/api

# Create index page
cat > gh-pages/index.html <<EOF
<!DOCTYPE html>
<html>
<head>
  <title>Codex7 API Documentation</title>
</head>
<body>
  <h1>Codex7 API Documentation</h1>
  <ul>
    <li><a href="/api/shared">@codex7/shared</a></li>
    <li><a href="/api/mcp-server">@codex7/mcp-server</a></li>
    <li><a href="/api/api">@codex7/api</a></li>
  </ul>
</body>
</html>
EOF

# Commit to gh-pages branch
git checkout gh-pages
cp -r gh-pages/* .
git add .
git commit -m "📚 docs: update API documentation"
git push origin gh-pages
git checkout main
```

### Automated Publishing

Create `.github/workflows/docs.yml`:

```yaml
name: Deploy API Docs

on:
  push:
    branches: [main]
    paths:
      - 'packages/*/src/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4

      - run: pnpm install
      - run: pnpm --filter @codex7/shared typedoc
      - run: pnpm --filter @codex7/mcp-server typedoc
      - run: pnpm --filter @codex7/api typedoc

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./api-docs
```

## Package-Specific Usage

### @codex7/shared
```bash
cd packages/shared
pnpm typedoc
open api-docs/index.html
```

### @codex7/mcp-server
```bash
cd packages/mcp-server
pnpm typedoc
open api-docs/index.html
```

### @codex7/api
```bash
cd packages/api
pnpm typedoc
open api-docs/index.html
```

## Best Practices

### DO ✅
- Run before releases to ensure docs are current
- Preview locally before publishing
- Use @category and @group to organize
- Include README.md in documentation
- Add version numbers to docs
- Keep api-docs/ in .gitignore (generated files)
- Publish to GitHub Pages for public packages

### DON'T ❌
- Commit api-docs/ to main branch (generated files)
- Run on every change (slow, unnecessary)
- Skip previewing before publishing
- Publish incomplete documentation
- Forget to update version in package.json first

## Troubleshooting

**Issue**: TypeDoc not found
```bash
# Install it
pnpm add -D typedoc

# Or install globally
npm install -g typedoc
```

**Issue**: No documentation generated
- Check that functions have TSDoc comments
- Verify entryPoints is correct
- Ensure files aren't excluded

**Issue**: Documentation looks wrong
- Check TSDoc comment syntax
- Validate @param names match parameters
- Ensure @returns describes return value

**Issue**: Missing types/interfaces
- Check that items are exported
- Verify excludePrivate isn't hiding them
- Make sure comments use /** not /*

## Quality Checks

Before publishing, verify:

- [ ] All public APIs are documented
- [ ] Examples compile and work
- [ ] Links aren't broken
- [ ] Sections are well-organized
- [ ] README is included
- [ ] Version is current
- [ ] No "TODO" or "FIXME" in docs
- [ ] Preview looks good locally

## Output Validation

```bash
# Check for common issues
grep -r "TODO" api-docs/
grep -r "FIXME" api-docs/
grep -r "\[PLACEHOLDER" api-docs/

# Should return nothing if docs are complete
```

## Integration with Other Commands

**Recommended Workflow:**

1. Run `/doc-new` - Add missing docs
2. Fill in placeholders manually
3. Make code changes
4. Run `/doc-diff` - Update docs to match changes
5. Run `/make-docs` - Generate HTML (this command)
6. Preview locally
7. Publish to GitHub Pages

## Monorepo Aggregation

To generate combined docs for all packages:

```bash
# Create combined config
cat > typedoc.json <<EOF
{
  "entryPoints": [
    "packages/shared/src/index.ts",
    "packages/mcp-server/src/index.ts",
    "packages/api/src/index.ts"
  ],
  "out": "./api-docs",
  "entryPointStrategy": "packages",
  "name": "Codex7 API Documentation"
}
EOF

# Generate combined docs
pnpm typedoc
```

## Customization

### Custom Theme

```bash
# Install a theme
pnpm add -D typedoc-theme-hierarchy

# Use it
pnpm typedoc --theme hierarchy
```

### Custom CSS

Create `typedoc-custom.css`:

```css
:root {
  --color-accent: #8b5cf6; /* Purple accent */
}

.tsd-signature {
  font-family: 'Fira Code', monospace;
}
```

Add to config:
```json
{
  "customCss": "./typedoc-custom.css"
}
```

## References

- **TypeDoc**: https://typedoc.org/
- **TSDoc**: https://tsdoc.org/
- **GitHub Pages**: https://pages.github.com/
- **Codex7 Style**: `../../CLAUDE.md`

---

**Remember**: User decides when to generate docs. Don't auto-run this command! 💜
