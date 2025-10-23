import { Result } from '@jenova-marie/ts-rust-result';
import type { CodexError } from './types';
export type CodexResult<T> = Result<T, CodexError>;
export type LibraryResult<T> = Result<T, CodexError>;
export type VersionResult<T> = Result<T, CodexError>;
export type DocumentResult<T> = Result<T, CodexError>;
export { ok, err } from '@jenova-marie/ts-rust-result';
