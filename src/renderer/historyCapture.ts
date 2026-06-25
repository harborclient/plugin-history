import type {
  PluginHttpRequest,
  PluginHttpResponse,
} from "@harborclient/sdk";
import {
  createEntryId,
  truncateBody,
  type HistoryEntry,
} from "../shared/historyEntry.js";

/**
 * Maps an HTTP hook exchange into a storable history entry.
 *
 * @param request - Request that was sent.
 * @param response - Response payload from the host.
 * @returns History entry ready for persistence.
 */
export function toHistoryEntry(
  request: PluginHttpRequest,
  response: PluginHttpResponse
): HistoryEntry {
  const requestBody = truncateBody(request.body ?? "");
  const responseBody = truncateBody(response.body ?? "");

  return {
    id: createEntryId(),
    timestamp: Date.now(),
    method: request.method,
    url: request.url,
    requestHeaders: { ...request.headers },
    requestBody: requestBody.body,
    status: response.status,
    statusText: response.statusText,
    responseHeaders: { ...response.headers },
    responseBody: responseBody.body,
    truncated: requestBody.truncated || responseBody.truncated,
  };
}
