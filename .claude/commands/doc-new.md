# 📝 doc-new - Find & Document Missing APIs

Find all exports without TypeDoc documentation and write skeleton TSDoc comments.

## Purpose

Scans the current package for exported functions, classes, interfaces, and types that lack TSDoc comments, then generates skeleton documentation with proper structure.

## When to Use

- After creating new functions/classes without docs
- Before releases to ensure complete API documentation
- When onboarding to document existing undocumented code
- Periodically to maintain documentation coverage

## Scope

- **Target**: Current package only (run from package directory)
- **Files**: `src/**/*.ts` and `src/**/*.tsx`
- **Excludes**: Test files (`**/__tests__/**`, `**/*.test.ts`, `**/*.test.tsx`)
- **Coverage**: Both public APIs AND internal functions

## What Gets Documented

### Exported APIs (Priority)
- Functions
- Classes
- Interfaces
- Type aliases
- Constants
- Enums

### Internal Functions (Secondary)
- Non-exported functions
- Private class methods
- Helper utilities

## TSDoc Comment Structure

Generate skeleton comments following TypeDoc format (https://typedoc.org/):

```typescript
/**
 * [PLACEHOLDER: Add description of what this function does]
 *
 * @param paramName - [PLACEHOLDER: Describe this parameter]
 * @param anotherParam - [PLACEHOLDER: Describe this parameter]
 * @returns [PLACEHOLDER: Describe return value]
 * @throws {ErrorType} [PLACEHOLDER: When this error occurs] (for Result types)
 *
 * @example
 * ```typescript
 * // [PLACEHOLDER: Add usage example]
 * const result = functionName(param1, param2);
 * ```
 */
```

### Required Elements

1. **Description** - What the function/class does
2. **@param** - One entry per parameter with name and description
3. **@returns** - Description of return value
4. **@throws** - For Result<T, E> error types (per ERROR_HANDLING.md)

### Optional Elements (Add if applicable)

5. **@example** - Usage example (encouraged but not required)
6. **@since** - Version when added (for public APIs)
7. **@deprecated** - If function is deprecated
8. **@see** - Links to related functions/docs
9. **@remarks** - Additional notes

## Workflow

### Step 1: Scan for Undocumented Exports

Use TypeScript AST or grep to find:
- Functions without `/**` comment above them
- Classes without TSDoc
- Exported interfaces/types without docs

```bash
# Example detection pattern
grep -r "export (function|class|interface|type|const)" src/ \
  | grep -v "__tests__" \
  | grep -v ".test.ts"
```

### Step 2: Analyze Function Signatures

For each undocumented item, extract:
- Function/class name
- Parameter names and types
- Return type
- Whether it returns Result<T, E>

### Step 3: Generate Skeleton Comments

Create TSDoc comment with:
- Placeholder description
- All `@param` entries from signature
- `@returns` entry
- `@throws` for Result error types

### Step 4: Insert Comments

Insert generated comments directly above the function/class definition.

### Step 5: Generate Report

Output summary:
```
📝 Documentation Added

Exports documented:
- src/utils/library-id.ts: parseLibraryId, formatLibraryId (2 functions)
- src/storage/adapter.ts: StorageAdapter (1 interface)
- src/errors/factories.ts: 5 error factory functions

Internal functions documented:
- src/utils/helpers.ts: 3 helper functions

Total: 11 items documented
```

## Result Error Types (@throws)

For functions returning `Result<T, E>`, document possible errors per ERROR_HANDLING.md:

```typescript
/**
 * Retrieves a library by ID from storage.
 *
 * @param id - The library identifier
 * @returns Library data if found, or error
 * @throws {LibraryNotFoundError} When library doesn't exist
 * @throws {DatabaseQueryError} When database query fails
 *
 * @example
 * ```typescript
 * const result = await getLibrary('/vercel/next.js');
 * if (result.isOk()) {
 *   console.log(result.value);
 * }
 * ```
 */
export async function getLibrary(id: string): StorageResult<Library> {
  // ...
}
```

### Identifying Result Errors

1. Look at function return type: `Result<T, ErrorUnion>`
2. Extract error union type: `LibraryNotFoundError | DatabaseQueryError`
3. Create `@throws` entry for each error type
4. Reference ERROR_HANDLING.md for error descriptions

## Validation Rules

Before writing skeleton comments, validate:

✅ **Required checks:**
- Function signature is parseable
- All parameters are identified
- Return type is identified
- If Result type, error union is extractable

⚠️ **Optional checks:**
- Function name follows naming conventions
- Parameters use descriptive names
- Return type is specific (not `any` or `unknown`)

## Output Format

### Success
```
✅ Added documentation to 11 items

Run these commands to review:
  git diff src/

To fill in placeholders, edit the files and replace:
  [PLACEHOLDER: ...]
```

### Already Documented
```
✅ All exports are already documented!

Scanned:
  - src/utils/*.ts (5 files)
  - src/storage/*.ts (3 files)

Total: 8 files, 23 exports, 100% documented
```

### Partial Coverage
```
📝 Added documentation to 5 items

Already documented: 18 items
Newly documented: 5 items
Total coverage: 23/23 (100%)

Files modified:
  - src/utils/helpers.ts
  - src/validation/rules.ts
```

## Best Practices

### DO ✅
- Run this command **before** doc-diff.md (find missing first)
- Review generated skeletons - replace ALL placeholders
- Add meaningful examples for complex functions
- Document error conditions with `@throws`
- Use present tense in descriptions ("Retrieves" not "Retrieved")
- Be specific in parameter descriptions

### DON'T ❌
- Leave placeholders in the code
- Auto-commit without reviewing
- Document private implementation details
- Copy-paste descriptions between similar functions
- Skip error documentation for Result types

## Integration with Other Commands

**Workflow:**
1. **doc-new.md** - Find and add skeleton comments (this command)
2. Edit files to replace placeholders with real descriptions
3. **doc-diff.md** - Validate docs match code after changes
4. **make-docs.md** - Generate HTML documentation

## Package-Specific Usage

```bash
# From package directory
cd packages/shared
# Run command via Claude Code
/doc-new

# Or from monorepo root
cd packages/mcp-server
/doc-new
```

## Configuration

Reference TypeDoc configuration: https://typedoc.org/

Key settings to be aware of:
- `--exclude` - Files to skip
- `--excludeInternal` - Skip `@internal` tagged items
- `--excludePrivate` - Skip private members

## Example Before/After

### Before
```typescript
export function parseLibraryId(id: string): Result<LibraryId, Error> {
  if (!PATTERNS.LIBRARY_ID.test(id)) {
    return Err(new Error(`Invalid library ID format: ${id}`));
  }

  const parts = id.split('/').filter(Boolean);
  const [org, project, version] = parts;

  return Ok({ org, project, version });
}
```

### After
```typescript
/**
 * Parses a library identifier into its component parts.
 *
 * Accepts Context7-compatible library IDs in the format:
 * - `/org/project` (without version)
 * - `/org/project/version` (with specific version)
 *
 * @param id - The library identifier to parse
 * @returns Parsed library ID with org, project, and optional version
 * @throws {Error} When the ID format is invalid
 *
 * @example
 * ```typescript
 * const result = parseLibraryId('/vercel/next.js');
 * if (result.isOk()) {
 *   console.log(result.value.org); // 'vercel'
 *   console.log(result.value.project); // 'next.js'
 * }
 * ```
 */
export function parseLibraryId(id: string): Result<LibraryId, Error> {
  if (!PATTERNS.LIBRARY_ID.test(id)) {
    return Err(new Error(`Invalid library ID format: ${id}`));
  }

  const parts = id.split('/').filter(Boolean);
  const [org, project, version] = parts;

  return Ok({ org, project, version });
}
```

## Troubleshooting

**Issue**: Can't parse function signature
- **Solution**: Check for syntax errors, ensure file compiles

**Issue**: Wrong parameter types detected
- **Solution**: Verify TypeScript types are explicit, not inferred

**Issue**: Can't identify Result error types
- **Solution**: Ensure error union is explicitly typed in return type

## References

- **TypeDoc**: https://typedoc.org/
- **TSDoc Spec**: https://tsdoc.org/
- **ERROR_HANDLING.md**: `../../docs/ERROR_HANDLING.md`
- **Codex7 Style**: `../../CLAUDE.md`

---

**Remember**: This command generates skeletons. YOU must fill in the placeholders with meaningful descriptions! 💜
