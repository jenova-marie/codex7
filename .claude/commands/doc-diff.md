# 🔍 doc-diff - Git-Aware Smart Documentation Updates

Intelligently update TSDoc comments based on staged git changes within the current package.

## Purpose

Analyzes staged code changes **in the current package only** and updates TSDoc documentation to match. Only modifies docs when code changes require it - if docs are still accurate, does nothing.

**🎯 Package Isolation**: This command is designed for monorepo parallel development with iris-mcp. Each package team analyzes only their own changes using `git diff --staged -- .` to scope analysis to the current working directory.

## When to Use

- **Before committing** - Ensure docs match code changes
- **After refactoring** - Update docs for renamed/modified functions
- **Parameter changes** - Sync @param entries with new signatures
- **Return type changes** - Update @returns documentation
- **Error handling changes** - Update @throws for Result types

## Scope

- **Target**: Current package directory only (automatically determined from PWD)
- **Changes**: **Staged** changes only (`git diff --staged -- .`)
- **Files**: `src/**/*.ts` and `src/**/*.tsx` within current package
- **Excludes**: Test files (`**/__tests__/**`, `**/*.test.ts`, `**/*.test.tsx`)

**Package Isolation**: Each package analyzes only changes within its own directory tree. The command uses `git diff --staged -- .` to limit analysis to files in the current working directory and subdirectories.

## What Triggers Updates

### Code Changes That Require Doc Updates

1. **New functions/classes** - Need full TSDoc comment
2. **Parameter added/removed** - Update @param entries
3. **Parameter renamed** - Update @param name
4. **Parameter type changed** - Update @param description if needed
5. **Return type changed** - Update @returns
6. **Result error types changed** - Update @throws
7. **Function renamed** - Update description if it references old name
8. **Logic change** - Review description for accuracy

### Code Changes That DON'T Require Updates

- ✅ **Implementation details** - Internal logic refactoring
- ✅ **Formatting** - Code style changes
- ✅ **Comments** - Inline comments (not TSDoc)
- ✅ **Whitespace** - Indentation, blank lines
- ✅ **Variable names** - Local variables (not parameters)

**Key Principle**: If docs are still accurate after the change, **do nothing**!

## Workflow

### Step 1: Determine Current Package and Get Staged Changes

First, identify the current package from PWD:

```bash
# Get current working directory
pwd
# Example: /Users/jenova/projects/jenova-marie/codex7/packages/mcp-server

# Extract package name for reporting
basename $(pwd)
# Example: mcp-server
```

Then get staged changes for THIS package only:

```bash
# Only analyze staged changes in current directory and subdirectories
git diff --staged --name-only -- . | grep "^src/" | grep -v "test"
```

This ensures:
- ✅ Only files in current package are analyzed
- ✅ Changes in other packages are ignored
- ✅ Each team works independently
- ✅ No cross-package interference

Identify:
- Which files changed within this package
- What functions/classes were modified
- What specifically changed (params, returns, body)

### Step 2: Analyze Each Change

For each modified function:

1. **Extract current TSDoc** - Read existing comment
2. **Extract new signature** - Parse updated code
3. **Compare** - What changed?
4. **Determine** - Does doc need updating?

### Step 3: Validate Documentation

Run comprehensive checks:

#### ✅ Parameter Validation
```typescript
// Code has these params:
function foo(name: string, age: number): void

// Check @param entries match:
/**
 * @param name - User's name    ✅ Matches
 * @param age - User's age      ✅ Matches
 * @param email - User's email  ❌ EXTRA - Remove!
 */
```

#### ✅ Return Type Validation
```typescript
// Function returns:
function getUser(id: string): Result<User, UserError>

// Check @returns matches:
/**
 * @returns User data if found    ❌ Doesn't mention Result or errors
 */

// Should be:
/**
 * @returns User data if found, or error
 */
```

#### ✅ Error Type Validation (@throws)
```typescript
// Function signature:
function getUser(id: string): StorageResult<User>

// Extract error union from StorageResult:
type StorageError = UserNotFoundError | DatabaseError

// Check @throws entries:
/**
 * @throws {UserNotFoundError} When user doesn't exist  ✅ Matches
 * @throws {DatabaseError} When query fails             ✅ Matches
 */
```

#### ✅ Example Validation
```typescript
// Check if @example code compiles
/**
 * @example
 * ```typescript
 * const result = parseLibraryId('/vercel/next.js');
 * console.log(result.value.org); // ❌ Might fail if result.isErr()!
 * ```
 */

// Should be:
/**
 * @example
 * ```typescript
 * const result = parseLibraryId('/vercel/next.js');
 * if (result.isOk()) {  // ✅ Proper error handling
 *   console.log(result.value.org);
 * }
 * ```
 */
```

#### ✅ Link Validation
```typescript
/**
 * @see {@link parseLibraryId}   ✅ Check function exists
 * @see {@link formatID}          ❌ Function doesn't exist - broken link!
 */
```

#### ✅ Tag Validation
```typescript
/**
 * @since 0.1.0    ✅ Valid version
 * @deprecated Use newFunction() instead  ✅ Has alternative
 */
```

### Step 4: Update Documentation

Only update if validation fails or code change requires it:

```typescript
// BEFORE (staged change adds new parameter):
/**
 * Gets a library by ID.
 *
 * @param id - Library identifier
 * @returns Library data
 */
function getLibrary(id: string): Library

// AFTER (code now includes options):
function getLibrary(id: string, options: GetOptions): Library

// UPDATE DOC:
/**
 * Gets a library by ID with optional filters.
 *
 * @param id - Library identifier
 * @param options - Query options (filters, pagination)  // ← ADDED
 * @returns Library data
 */
```

### Step 5: Generate Report

Show what was updated and why:

```
🔍 Documentation Updates for Staged Changes
📦 Package: mcp-server

src/tools/resolve-library-id.ts:
  resolveLibraryId()
    ✅ Added @param options - Query options
    ✅ Updated description to mention ranking

src/tools/get-library-docs.ts:
  getLibraryDocs()
    ✅ Fixed @example to handle Result properly
    ⚠️ Review description - logic changed significantly

src/utils/helpers.ts:
  ✅ All docs are accurate - no updates needed

Summary:
  Package: mcp-server
  Files analyzed: 3
  Functions checked: 8
  Docs updated: 2
  Docs valid: 6
```

## Smart Analysis

### Detecting Significant Changes

Use git diff context to identify:

1. **Parameter changes**:
```diff
- function foo(name: string): void
+ function foo(name: string, age: number): void
```
→ Need to add @param age

2. **Return type changes**:
```diff
- function getUser(): User | null
+ function getUser(): Result<User, Error>
```
→ Update @returns and add @throws

3. **Error type changes**:
```diff
- type StorageError = DatabaseError
+ type StorageError = DatabaseError | TimeoutError
```
→ Add @throws {TimeoutError}

4. **Logic changes**:
```diff
  function validateEmail(email: string): boolean {
-   return /\w+@\w+/.test(email);
+   return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  }
```
→ Review description - validation stricter now

### When NOT to Update

```typescript
// Only formatting changed - docs still accurate
- function foo(name:string,age:number):void{return;}
+ function foo(name: string, age: number): void {
+   return;
+ }
```
→ ✅ **No doc update needed**

```typescript
// Internal implementation changed - docs still accurate
function calculateTotal(items: Item[]): number {
-  return items.reduce((sum, item) => sum + item.price, 0);
+  let sum = 0;
+  for (const item of items) {
+    sum += item.price;
+  }
+  return sum;
}
```
→ ✅ **No doc update needed** (behavior unchanged)

## Result Error Documentation

For functions returning `Result<T, E>`, ensure @throws matches ERROR_HANDLING.md:

### Step 1: Extract Error Union

```typescript
// From function signature:
function getLibrary(id: string): StorageResult<Library>

// Find type definition:
type StorageResult<T> = Result<T, StorageError>;
type StorageError = LibraryNotFoundError | DatabaseQueryError;

// Extract errors:
- LibraryNotFoundError
- DatabaseQueryError
```

### Step 2: Check @throws Entries

```typescript
/**
 * @throws {LibraryNotFoundError} When library doesn't exist  ✅
 * @throws {DatabaseQueryError} When query fails              ✅
 */
```

### Step 3: Update if Error Union Changed

```diff
- type StorageError = LibraryNotFoundError | DatabaseQueryError
+ type StorageError = LibraryNotFoundError | DatabaseQueryError | TimeoutError
```

Add missing @throws:
```typescript
/**
 * @throws {LibraryNotFoundError} When library doesn't exist
 * @throws {DatabaseQueryError} When query fails
 * @throws {TimeoutError} When database connection times out  // ← ADDED
 */
```

## Validation Rules

### Required Checks ✅

- [ ] @param entries match function parameters
- [ ] @param names are correct
- [ ] @returns matches return type
- [ ] @throws matches Result error types
- [ ] @example code would compile
- [ ] @link references aren't broken
- [ ] @since, @deprecated are appropriate

### Warning Checks ⚠️

- [ ] Description mentions renamed items
- [ ] Description reflects behavior changes
- [ ] Examples use current best practices
- [ ] Related docs in ../../docs/ might need updates

## Output Format

### Updates Made
```
📦 Package: storage-postgres
✅ Documentation updated for 3 functions

Modified files:
  src/adapter.ts
  src/migrations/001_initial.ts

Review changes:
  git diff -- .

Commit suggestion:
  📝 docs(storage-postgres): update TSDoc comments to match code changes
```

### No Updates Needed
```
📦 Package: mcp-server
✅ All documentation is accurate!

Analyzed staged changes in:
  - src/tools/resolve-library-id.ts (2 functions)
  - src/utils/helpers.ts (1 function)

No doc updates required - changes were implementation-only.
```

### Review Required
```
📦 Package: indexer
⚠️ Please review these manually:

src/processor.ts:
  processDocument()
    Logic changed significantly
    Current description might be outdated
    Suggest reviewing and updating manually

Auto-updated:
  - 2 functions (parameter changes)

Manual review needed:
  - 1 function (complex logic change)
```

## Best Practices

### DO ✅
- Run **before every commit** with staged changes
- Review suggested updates before accepting
- Check related docs in `../../docs/` for mentions
- Update examples if API usage changed
- Be specific about error conditions

### DON'T ❌
- Auto-commit doc changes without review
- Update docs for formatting-only changes
- Change working docs unnecessarily
- Skip validation checks
- Ignore broken examples

## Integration with Other Commands

**Recommended Workflow:**

1. Make code changes
2. Stage changes: `git add src/`
3. Run `/doc-diff` - Update docs to match changes
4. Review updates: `git diff`
5. Stage doc updates: `git add src/`
6. Run `/git-commit` - Commit code + doc changes together

## Package-Specific Usage

The command automatically detects the current package from PWD and only analyzes changes within that package:

```bash
# Example: Working in mcp-server package
cd packages/mcp-server

# Stage some changes
git add src/tools/resolve-library-id.ts

# Run doc-diff - only analyzes mcp-server package changes
/doc-diff

# Output will show:
# 📦 Analyzing package: mcp-server
# 🔍 Staged changes in this package: 1 file
#   - src/tools/resolve-library-id.ts
```

**Cross-package changes are ignored:**

```bash
# Even if other packages have staged changes
cd packages/api
git add src/routes/libraries.ts

cd packages/mcp-server
# This only sees mcp-server changes, ignores api changes
/doc-diff

# Output:
# 📦 Analyzing package: mcp-server
# ✅ No staged changes in this package
```

**Each team works in isolation** - perfect for parallel development with iris-mcp!

## Related Documentation Updates

If code changes within this package affect content in root-level `docs/`, report it:

```
⚠️ Related documentation might need updates:

📦 Current package: storage-postgres

Code changes in src/adapter.ts affect:
  ../../docs/ARCHITECTURE.md (mentions storage adapter interface)

Code changes in src/migrations/ affect:
  ../../docs/SELF_HOSTING.md (documents database setup)

Review these files manually to ensure consistency.
```

**Note**: Only report docs affected by THIS package's changes, not other packages.

## Troubleshooting

**Issue**: Can't determine if docs need updating
- **Solution**: When in doubt, report for manual review

**Issue**: Example validation fails but looks correct
- **Solution**: Example might reference external types - flag for review

**Issue**: Can't extract Result error types
- **Solution**: Check that error union type is explicitly defined

**Issue**: Shows changes from other packages
- **Solution**: Ensure using `git diff --staged -- .` not `git diff --staged` (note the `-- .` at end!)

**Issue**: No changes found but I staged files
- **Solution**: Check you're in the correct package directory with `pwd`

## Integration with iris-mcp

This command is designed for parallel development with iris-mcp orchestration:

**Each package team:**
1. Works in their package directory (e.g., `packages/mcp-server`)
2. Makes code changes
3. Stages changes: `git add src/`
4. Runs `/doc-diff` - only sees THEIR changes
5. Updates docs as needed
6. Commits with `/git-commit`

**Benefits:**
- ✅ Teams don't interfere with each other
- ✅ Each team maintains their own docs
- ✅ No cross-package conflicts
- ✅ Fast analysis (only current package)
- ✅ Clear ownership and responsibility

## References

- **TypeDoc**: https://typedoc.org/
- **ERROR_HANDLING.md**: `../../docs/ERROR_HANDLING.md`
- **Git Diff**: `git diff --staged -- .` (package-scoped!)
- **Codex7 Style**: `../../CLAUDE.md`

---

**Remember**: Only update docs when code changes require it. If docs are accurate, leave them alone! 💜

**Package Isolation**: Each package analyzes only its own changes. Perfect for iris-mcp parallel development! 🎯
