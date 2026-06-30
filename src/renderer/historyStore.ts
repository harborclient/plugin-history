import type { PluginContext } from '@harborclient/sdk';
import { createStorageStore, type StorageStore } from '@harborclient/sdk/store';
import { STORAGE_KEY } from '../shared/constants.js';
import type { HistoryEntry } from '../shared/historyEntry.js';

/**
 * Parses persisted history entries from raw plugin storage.
 *
 * @param raw - Raw storage value, or undefined when the key is absent.
 * @returns Validated history entries, newest first.
 */
function parseHistoryEntries(raw: unknown): HistoryEntry[] {
  return Array.isArray(raw) ? (raw as HistoryEntry[]) : [];
}

/**
 * Creates a storage-backed history store for one plugin webview activation.
 *
 * @param hc - Renderer plugin context from the host.
 * @returns Reactive store shared by capture handlers and the footer panel.
 */
export function createHistoryStore(hc: PluginContext): StorageStore<HistoryEntry[]> {
  return createStorageStore<HistoryEntry[]>({
    storage: hc.storage,
    key: STORAGE_KEY,
    parse: parseHistoryEntries
  });
}
