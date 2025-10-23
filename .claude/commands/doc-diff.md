# 🔍 doc-diff - Git-Aware Smart Documentation Updates

Intelligently update TSDoc comments based on staged git changes.

## Purpose

Analyzes staged code changes and updates TSDoc documentation to match. Only modifies docs when code changes require it - if docs are still accurate, does nothing.

## When to Use

- **Before committing** - Ensure docs match code changes
- **After refactoring** - Update docs for renamed/modified functions
- **Parameter changes** - Sync @param entries with new signatures
- **Return type changes** - Update @returns documentation
- **Error handling changes** - Update @throws for Result types

## Scope

- **Target**: Current package only (run from package directory)
- **Changes**: **Staged** changes only (`git diff --staged`)
- **Files**: `src/**/*.ts` and `src/**/*.tsx`
- **Excludes**: Test files (`**/__tests__/**`, `**/*.test.ts`, `**/*.test.tsx`)

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

### Step 1: Get Staged Changes

```bash
git diff --staged --name-only | grep "^src/" | grep -v "test"
```

Identify:
- Which files changed
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

src/storage/adapter.ts:
  getLibrary()
    ✅ Added @param options - Query options
    ✅ Updated description to mention filters

src/utils/library-id.ts:
  parseLibraryId()
    ✅ Fixed @example to handle Result properly
    ⚠️ Review description - logic changed significantly

src/errors/factories.ts:
  ✅ All docs are accurate - no updates needed

Summary:
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
✅ Documentation updated for 3 functions

Modified files:
  src/storage/adapter.ts
  src/utils/library-id.ts

Review changes:
  git diff src/

Commit suggestion:
  📝 docs: update TSDoc comments to match code changes
```

### No Updates Needed
```
✅ All documentation is accurate!

Analyzed staged changes in:
  - src/storage/adapter.ts (2 functions)
  - src/utils/helpers.ts (1 function)

No doc updates required - changes were implementation-only.
```

### Review Required
```
⚠️ Please review these manually:

src/indexer/processor.ts:
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

```bash
# From package directory
cd packages/mcp-server
git add src/tools/resolve-library-id.ts
/doc-diff

# Reviews only staged changes in current package
```

## Related Documentation Updates

If code changes affect content in `../../docs/`, report it:

```
⚠️ Related documentation might need updates:

Code changes in src/storage/adapter.ts affect:
  ../../docs/ARCHITECTURE.md (mentions storage adapter interface)

Code changes in src/errors/factories.ts affect:
  ../../docs/ERROR_HANDLING.md (documents error factory patterns)

Review these files manually to ensure consistency.
```

## Troubleshooting

**Issue**: Can't determine if docs need updating
- **Solution**: When in doubt, report for manual review

**Issue**: Example validation fails but looks correct
- **Solution**: Example might reference external types - flag for review

**Issue**: Can't extract Result error types
- **Solution**: Check that error union type is explicitly defined

## References

- **TypeDoc**: https://typedoc.org/
- **ERROR_HANDLING.md**: `../../docs/ERROR_HANDLING.md`
- **Git Diff**: `git diff --staged`
- **Codex7 Style**: `../../CLAUDE.md`

---

**Remember**: Only update docs when code changes require it. If docs are accurate, leave them alone! 💜
