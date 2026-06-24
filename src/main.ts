import type {
  MainPluginContext,
  PluginHttpRequest,
  PluginHttpResponse,
} from "@harborclient/plugin-api";
import { IPC_PULL_PENDING } from "./shared/constants.js";
import {
  createEntryId,
  truncateBody,
  type HistoryEntry,
} from "./shared/historyEntry.js";

/** Entries captured since the renderer last pulled. */
const pending: HistoryEntry[] = [];

/**
 * Maps an HTTP hook exchange into a storable history entry.
 *
 * @param request - Request that was sent.
 * @param response - Response payload from the host.
 * @returns History entry ready for persistence.
 */
function toHistoryEntry(
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

/**
 * Activates the request history main entry: HTTP capture and IPC bridge.
 *
 * @param hc - Main-process plugin context.
 */
export function activate(hc: MainPluginContext): void {
  hc.subscriptions.push(
    hc.http.onAfterSend((request, response) => {
      pending.unshift(toHistoryEntry(request, response));
    })
  );

  hc.subscriptions.push(
    hc.ipc.handle(IPC_PULL_PENDING, () => {
      const snapshot = [...pending];
      pending.length = 0;
      return snapshot;
    })
  );
}
