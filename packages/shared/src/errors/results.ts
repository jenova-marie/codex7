import { Result, Ok, Err } from '@jenova-marie/ts-rust-result';
import type { CodexError } from './types';

// Result type aliases for Codex7
export type CodexResult<T> = Result<T, CodexError>;
export type LibraryResult<T> = Result<T, CodexError>;
export type VersionResult<T> = Result<T, CodexError>;
export type DocumentResult<T> = Result<T, CodexError>;

// Re-export Result constructors
export { ok, err } from '@jenova-marie/ts-rust-result';
