import type { PluginStorage } from "@harborclient/plugin-api";
import { IPC_PULL_PENDING, STORAGE_KEY } from "../shared/constants.js";
import {
  mergeHistoryEntries,
  type HistoryEntry,
} from "../shared/historyEntry.js";

/**
 * Pulls pending captures from the main entry and merges them into persisted storage.
 *
 * @param storage - Plugin-scoped persistent storage.
 * @param pluginId - Plugin manifest id for IPC routing.
 * @returns Updated entry list after merge, or null when nothing changed.
 */
export async function syncPendingEntries(
  storage: PluginStorage,
  pluginId: string
): Promise<HistoryEntry[] | null> {
  const raw = await window.api.invokePluginMain(pluginId, IPC_PULL_PENDING, []);
  if (!Array.isArray(raw) || raw.length === 0) {
    return null;
  }

  const pending = raw as HistoryEntry[];
  const existing = (await storage.get<HistoryEntry[]>(STORAGE_KEY)) ?? [];
  const merged = mergeHistoryEntries(pending, existing);
  await storage.set(STORAGE_KEY, merged);
  return merged;
}

/**
 * Loads persisted history entries from storage.
 *
 * @param storage - Plugin-scoped persistent storage.
 * @returns Stored entries, newest first.
 */
export async function loadHistoryEntries(
  storage: PluginStorage
): Promise<HistoryEntry[]> {
  return (await storage.get<HistoryEntry[]>(STORAGE_KEY)) ?? [];
}

/**
 * Clears all persisted history entries.
 *
 * @param storage - Plugin-scoped persistent storage.
 */
export async function clearHistoryEntries(
  storage: PluginStorage
): Promise<void> {
  await storage.set(STORAGE_KEY, []);
}
