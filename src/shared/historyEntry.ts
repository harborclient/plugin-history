/**
 * Maximum bytes stored per request or response body before truncation.
 */
export const MAX_BODY_BYTES = 64 * 1024;

/**
 * One captured HTTP exchange persisted in plugin storage.
 */
export interface HistoryEntry {
  /**
   * Stable entry identifier.
   */
  id: string;

  /**
   * Unix timestamp (ms) when the response was received.
   */
  timestamp: number;

  /**
   * HTTP method (for example GET, POST).
   */
  method: string;

  /**
   * Request URL including scheme, host, path, and query string.
   */
  url: string;

  /**
   * Outgoing request headers as a flat key/value map.
   */
  requestHeaders: Record<string, string>;

  /**
   * Request body content as a string.
   */
  requestBody: string;

  /**
   * HTTP status code (for example 200, 404).
   */
  status: number;

  /**
   * HTTP status text (for example OK, Not Found).
   */
  statusText: string;

  /**
   * Response headers as a flat key/value map.
   */
  responseHeaders: Record<string, string>;

  /**
   * Response body content as a string.
   */
  responseBody: string;

  /**
   * True when either body was truncated to fit the storage cap.
   */
  truncated: boolean;
}

/**
 * Creates a new unique entry id.
 *
 * Uses crypto.randomUUID when available (renderer); falls back for SES main runtime.
 *
 * @returns Unique entry id string.
 */
export function createEntryId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Returns the UTF-8 byte length of a string without relying on TextEncoder.
 *
 * Used in the SES plugin main runtime where TextEncoder is unavailable.
 *
 * @param value - String to measure.
 * @returns Byte length when encoded as UTF-8.
 */
function utf8ByteLength(value: string): number {
  let bytes = 0;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x7f) {
      bytes += 1;
    } else if (code <= 0x7ff) {
      bytes += 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      bytes += 4;
      index += 1;
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

/**
 * Truncates a string to a maximum UTF-8 byte length without TextEncoder.
 *
 * @param value - String to truncate.
 * @param maxBytes - Maximum UTF-8 bytes to retain.
 * @returns Truncated prefix of the input string.
 */
function truncateUtf8Bytes(value: string, maxBytes: number): string {
  let bytes = 0;
  let index = 0;
  for (; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    let charBytes = 1;
    if (code <= 0x7f) {
      charBytes = 1;
    } else if (code <= 0x7ff) {
      charBytes = 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      charBytes = 4;
    } else {
      charBytes = 3;
    }
    if (bytes + charBytes > maxBytes) {
      break;
    }
    bytes += charBytes;
    if (charBytes === 4) {
      index += 1;
    }
  }
  return value.slice(0, index);
}

/**
 * Truncates a body string to the configured byte limit.
 *
 * Avoids TextEncoder so this helper works in the SES plugin main runtime.
 *
 * @param body - Raw body text.
 * @returns Truncated body and whether truncation occurred.
 */
export function truncateBody(body: string): {
  body: string;
  truncated: boolean;
} {
  if (utf8ByteLength(body) <= MAX_BODY_BYTES) {
    return { body, truncated: false };
  }
  return {
    body: `${truncateUtf8Bytes(
      body,
      MAX_BODY_BYTES
    )}\n\n[truncated — body exceeded ${MAX_BODY_BYTES} bytes]`,
    truncated: true,
  };
}

/**
 * Merges newly captured entries ahead of existing persisted history.
 *
 * @param pending - Entries captured since the last sync (newest first).
 * @param existing - Previously persisted entries (newest first).
 * @returns Combined list with pending entries first.
 */
export function mergeHistoryEntries(
  pending: HistoryEntry[],
  existing: HistoryEntry[]
): HistoryEntry[] {
  if (pending.length === 0) {
    return existing;
  }
  if (existing.length === 0) {
    return pending;
  }
  const seen = new Set<string>();
  const merged: HistoryEntry[] = [];
  for (const entry of [...pending, ...existing]) {
    if (seen.has(entry.id)) {
      continue;
    }
    seen.add(entry.id);
    merged.push(entry);
  }
  return merged;
}
