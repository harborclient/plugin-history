import { ReactHost } from "./reactHost.js";
import type { PluginStorage } from "@harborclient/plugin-api";
import type { HistoryEntry } from "../shared/historyEntry.js";
import { HistoryEntryRow } from "./HistoryEntryRow.js";
import {
  clearHistoryEntries,
  loadHistoryEntries,
  syncPendingEntries,
} from "./historyStorage.js";

/** React hooks supplied by the host via hc.react. */
export interface HistoryPanelHooks {
  useState: typeof import("react").useState;
  useEffect: typeof import("react").useEffect;
  useCallback: typeof import("react").useCallback;
}

interface Props {
  /**
   * Plugin-scoped persistent storage.
   */
  storage: PluginStorage;

  /**
   * React hooks from hc.react — do not bundle React in the plugin.
   */
  hooks: HistoryPanelHooks;
}

/**
 * Footer History panel: syncs captured requests and renders a persistent list.
 */
export function HistoryPanel({ storage, hooks }: Props) {
  const { useState, useEffect, useCallback } = hooks;

  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);

  /**
   * Loads storage and pulls any pending captures from the main entry.
   */
  const refresh = useCallback(async (): Promise<void> => {
    const merged = await syncPendingEntries(storage);
    if (merged) {
      setEntries(merged);
      return;
    }
    setEntries(await loadHistoryEntries(storage));
  }, [storage, setEntries]);

  /**
   * Loads history when the panel mounts and polls while visible.
   */
  useEffect(() => {
    let active = true;

    /**
     * Refreshes entries when the panel is still mounted.
     */
    const runRefresh = (): void => {
      void refresh().catch(() => {
        if (active) {
          // Ignore transient sync errors; next poll retries.
        }
      });
    };

    runRefresh();
    const interval = window.setInterval(runRefresh, 1000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [refresh]);

  /**
   * Clears all persisted history after confirmation.
   */
  const handleClear = useCallback(async (): Promise<void> => {
    setBusy(true);
    try {
      await clearHistoryEntries(storage);
      setEntries([]);
      setExpandedId(null);
      setConfirmClear(false);
    } finally {
      setBusy(false);
    }
  }, [storage, setEntries, setExpandedId, setConfirmClear, setBusy]);

  /**
   * Toggles expanded state for one history row.
   */
  const toggleExpanded = useCallback(
    (id: string): void => {
      setExpandedId((current) => (current === id ? null : id));
    },
    [setExpandedId]
  );

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
