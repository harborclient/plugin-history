import { Button, EmptyState } from '@harborclient/sdk/components';
import type { StorageStore } from '@harborclient/sdk/store';
import { useCallback, useState } from '@harborclient/sdk/react';
import { HistoryEntryRow } from './HistoryEntryRow.js';
import type { HistoryEntry } from '../shared/historyEntry.js';

interface Props {
  /**
   * Storage-backed history store for this webview activation.
   */
  store: StorageStore<HistoryEntry[]>;
}

/**
 * Footer History panel: renders captured requests from the storage-backed store.
 */
export function HistoryPanel({ store }: Props) {
  const entries = store.useValue();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);

  /**
   * Clears all persisted history after confirmation.
   */
  const handleClear = useCallback(async (): Promise<void> => {
    setBusy(true);
    try {
      await store.set([]);
      setExpandedId(null);
      setConfirmClear(false);
    } finally {
      setBusy(false);
    }
  }, [store]);

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
          <span className="text-[14px] font-normal text-muted">({entries.length})</span>
          {confirmClear ? (
            <>
              <span className="text-[14px] font-normal text-muted">Clear all history?</span>
              <Button variant="secondaryDanger" disabled={busy} onClick={() => void handleClear()}>
                Confirm
              </Button>
              <Button variant="secondary" disabled={busy} onClick={() => setConfirmClear(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              disabled={entries.length === 0 || busy}
              onClick={() => setConfirmClear(true)}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto" role="list">
        {entries.length === 0 ? (
          <EmptyState variant="inline" className="px-3 py-4">
            No requests recorded yet. Send a request to populate history.
          </EmptyState>
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
