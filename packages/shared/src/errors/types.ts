/**
 * Codex7 Error Types
 *
 * All errors use the @jenova-marie/ts-rust-result pattern
 */
export type CodexError = {
  message: string;
  code?: string;
  cause?: unknown;
};
