import { ReactHost } from "./reactHost.js";
import type { HistoryEntry } from "../shared/historyEntry.js";

/** Tailwind classes for HTTP method badges matching HarborClient tokens. */
const METHOD_CLASSES: Record<string, string> = {
  get: "text-method-get",
  post: "text-method-post",
  put: "text-method-put",
  patch: "text-method-patch",
  delete: "text-method-delete",
  head: "text-method-head",
  options: "text-method-options",
};

/**
 * Status dot color class for an HTTP response code.
 *
 * @param status - HTTP status code.
 * @returns Tailwind background utility class.
 */
function statusDotClass(status: number): string {
  if (status >= 200 && status < 300) {
    return "bg-success";
  }
  if (status >= 300 && status < 400) {
    return "bg-warning";
  }
  if (status >= 400) {
    return "bg-danger";
  }
  return "bg-info";
}

interface Props {
  /**
   * History entry to render.
   */
  entry: HistoryEntry;

  /**
   * Whether request/response details are expanded.
   */
  expanded: boolean;

  /**
   * Toggles expanded details for this row.
   */
  onToggle: () => void;
}

/**
 * Formats a header map as plain text lines.
 *
 * @param headers - Flat header key/value map.
 * @returns Multi-line header text.
 */
function formatHeaders(headers: Record<string, string>): string {
  const lines = Object.entries(headers).map(
    ([key, value]) => `${key}: ${value}`
  );
  return lines.length > 0 ? lines.join("\n") : "(none)";
}

/**
 * One expandable row in the History footer panel.
 */
export function HistoryEntryRow({ entry, expanded, onToggle }: Props) {
  const methodClass =
    METHOD_CLASSES[entry.method.toLowerCase()] ?? METHOD_CLASSES.get;
  const statusLabel = `${entry.status} ${entry.statusText}`;
  const detailsId = `history-entry-${entry.id}-details`;

  return (
    <div className="border-b border-separator last:border-b-0">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[14px] hover:bg-selection/60 app-no-drag"
        aria-expanded={expanded}
        aria-controls={detailsId}
        onClick={onToggle}
      >
        <span
          className={`inline-block h-2 w-2 shrink-0 rounded-full ${statusDotClass(
            entry.status
          )}`}
          aria-hidden="true"
        />
        <span
          className={`shrink-0 px-1.5 py-0.5 text-[14px] uppercase ${methodClass}`}
        >
          {entry.method}
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-[14px] text-text">
          {entry.url}
        </span>
        <span className="shrink-0 text-muted">{statusLabel}</span>
        <span className="shrink-0 text-[14px] text-muted">
          {new Date(entry.timestamp).toLocaleTimeString()}
        </span>
        {entry.truncated && (
          <span
            className="shrink-0 text-[14px] text-warning"
            title="Body truncated"
          >
            truncated
          </span>
        )}
        <span className="shrink-0 text-muted" aria-hidden="true">
          {expanded ? "▾" : "▸"}
        </span>
      </button>
      <div
        id={detailsId}
        hidden={!expanded}
        className="border-t border-separator bg-surface px-3 py-3"
      >
        <div className="space-y-3 text-[14px]">
          <section>
            <h4 className="mb-1 font-medium text-text">Request headers</h4>
            <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all rounded border border-separator bg-field p-2 font-mono text-[14px] text-text">
              {formatHeaders(entry.requestHeaders)}
            </pre>
          </section>
          {entry.requestBody ? (
            <section>
              <h4 className="mb-1 font-medium text-text">Request body</h4>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded border border-separator bg-field p-2 font-mono text-[14px] text-text">
                {entry.requestBody}
              </pre>
            </section>
          ) : null}
          <section>
            <h4 className="mb-1 font-medium text-text">Response headers</h4>
            <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all rounded border border-separator bg-field p-2 font-mono text-[14px] text-text">
              {formatHeaders(entry.responseHeaders)}
            </pre>
          </section>
          <section>
            <h4 className="mb-1 font-medium text-text">Response body</h4>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded border border-separator bg-field p-2 font-mono text-[14px] text-text">
              {entry.responseBody || "(empty)"}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
