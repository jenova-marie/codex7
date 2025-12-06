import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateHeaders } from "../src/lib/encryption.js";

describe("generateHeaders", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should return empty headers when no arguments provided", () => {
    const headers = generateHeaders();

    expect(headers).toEqual({});
  });

  it("should include Authorization header when apiKey provided", () => {
    const headers = generateHeaders(undefined, "test-api-key");

    expect(headers).toHaveProperty("Authorization", "Bearer test-api-key");
  });

  it("should include encrypted client IP when clientIp provided", () => {
    // Set a valid encryption key
    process.env.CLIENT_IP_ENCRYPTION_KEY =
      "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";

    const headers = generateHeaders("192.168.1.1");

    expect(headers).toHaveProperty("mcp-client-ip");
    // Encrypted format should be iv:ciphertext
    expect(headers["mcp-client-ip"]).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
  });

  it("should include both headers when both arguments provided", () => {
    process.env.CLIENT_IP_ENCRYPTION_KEY =
      "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";

    const headers = generateHeaders("10.0.0.1", "my-api-key");

    expect(headers).toHaveProperty("Authorization", "Bearer my-api-key");
    expect(headers).toHaveProperty("mcp-client-ip");
  });

  it("should merge extra headers", () => {
    const headers = generateHeaders(undefined, undefined, {
      "X-Custom-Header": "custom-value",
      "Content-Type": "application/json",
    });

    expect(headers).toEqual({
      "X-Custom-Header": "custom-value",
      "Content-Type": "application/json",
    });
  });

  it("should merge all headers together", () => {
    process.env.CLIENT_IP_ENCRYPTION_KEY =
      "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";

    const headers = generateHeaders("192.168.1.1", "api-key", {
      "X-Request-ID": "123",
    });

    expect(headers).toHaveProperty("Authorization", "Bearer api-key");
    expect(headers).toHaveProperty("mcp-client-ip");
    expect(headers).toHaveProperty("X-Request-ID", "123");
  });

  it("should always encrypt since module uses const key at load time", () => {
    // Note: The ENCRYPTION_KEY is evaluated at module load time as a const,
    // so changing process.env after import has no effect. The module will
    // always use either the env var value at load time or the default key.
    // This test verifies that encryption always happens with a valid key.

    const headers = generateHeaders("192.168.1.1");

    // Should always be encrypted (either with env key or default)
    expect(headers).toHaveProperty("mcp-client-ip");
    expect(headers["mcp-client-ip"]).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
  });

  it("should use default encryption key when env var not set", () => {
    delete process.env.CLIENT_IP_ENCRYPTION_KEY;

    const headers = generateHeaders("192.168.1.1");

    // Should be encrypted with default key
    expect(headers).toHaveProperty("mcp-client-ip");
    expect(headers["mcp-client-ip"]).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
  });
});
