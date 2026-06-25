import {
  useCallback,
  useState,
  useSyncExternalStore,
} from "@harborclient/plugin-api/react";
import type { PluginContext } from "@harborclient/plugin-api";
import { HistoryEntryRow } from "./HistoryEntryRow.js";
import { clearHistoryEntries, saveHistoryEntries } from "./historyStorage.js";
import { historyStore } from "./historyStore.js";

interface Props {
  /**
   * Renderer plugin context from the host.
   */
  hc: PluginContext;
}

/**
 * Footer History panel: renders captured requests from the module store.
 */
export function HistoryPanel({ hc }: Props) {
  const { storage } = hc;

  const entries = useSyncExternalStore(
    historyStore.subscribe,
    historyStore.getSnapshot,
    () => []
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);

  /**
   * Clears all persisted history after confirmation.
   */
  const handleClear = useCallback(async (): Promise<void> => {
    setBusy(true);
    try {
      await clearHistoryEntries(storage);
      historyStore.setState([]);
      setExpandedId(null);
      setConfirmClear(false);
    } finally {
      setBusy(false);
    }
  }, [storage]);

  /**
   * Toggles expanded state for one history row.
   */
  const toggleExpanded = useCallback((id: string): void => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col bg-control">
      <div className="flex shrink-0 items-center border-b border-separator px-3 py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-[14px] font-medium text-text">
          <span>History</span>
          <span className="text-[14px] font-normal text-muted">
            ({entries.length})
          </span>
          {confirmClear ? (
            <>
              <span className="text-[14px] font-normal text-muted">
                Clear all history?
              </span>
              <button
                type="button"
                className="cursor-pointer rounded-md border border-separator bg-control px-3 py-1 text-[14px] font-normal text-text shadow-sm hover:bg-selection disabled:cursor-not-allowed disabled:opacity-50"
                disabled={busy}
                onClick={() => void handleClear()}
              >
                Confirm
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-md border border-separator bg-control px-3 py-1 text-[14px] font-normal text-muted shadow-sm hover:bg-selection disabled:cursor-not-allowed disabled:opacity-50"
                disabled={busy}
                onClick={() => setConfirmClear(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="cursor-pointer rounded-md border border-separator bg-control px-3 py-1 text-[14px] font-normal text-text shadow-sm hover:bg-selection disabled:cursor-not-allowed disabled:opacity-50"
              disabled={entries.length === 0 || busy}
              onClick={() => setConfirmClear(true)}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto" role="list">
        {entries.length === 0 ? (
          <p className="px-3 py-4 text-[14px] text-muted" role="status">
            No requests recorded yet. Send a request to populate history.
          </p>
        ) : (
          entries.map((entry) => (
            <HistoryEntryRow
              key={entry.id}
              entry={entry}
              expanded={expandedId === entry.id}
              onToggle={() => toggleExpanded(entry.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
