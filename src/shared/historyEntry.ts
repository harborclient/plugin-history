import {
  randomId,
  truncateBody as truncateBodyBytes,
} from "@harborclient/sdk/runtime-utils";
import { mergeById } from "@harborclient/sdk/storage";

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
 * @returns Unique entry id string.
 */
export function createEntryId(): string {
  return randomId("entry");
}

/**
 * Truncates a body string to the configured byte limit.
 *
 * @param body - Raw body text.
 * @returns Truncated body and whether truncation occurred.
 */
export function truncateBody(body: string): {
  body: string;
  truncated: boolean;
} {
  return truncateBodyBytes(
    body,
    MAX_BODY_BYTES,
    `\n\n[truncated — body exceeded ${MAX_BODY_BYTES} bytes]`
  );
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
  return mergeById(pending, existing, {
    cap: Number.MAX_SAFE_INTEGER,
    idOf: (entry) => entry.id,
  });
}
