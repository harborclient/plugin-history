import {
  formatHeaders,
  methodColorClass,
  statusColorClass,
} from "@harborclient/plugin-api/ui";
import type { HistoryEntry } from "../shared/historyEntry.js";

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
 * One expandable row in the History footer panel.
 */
export function HistoryEntryRow({ entry, expanded, onToggle }: Props) {
  const methodClass = methodColorClass(entry.method);
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
          className={`inline-block h-2 w-2 shrink-0 rounded-full ${statusColorClass(
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
