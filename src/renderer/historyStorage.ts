import type { PluginStorage } from "@harborclient/sdk";
import { STORAGE_KEY } from "../shared/constants.js";
import type { HistoryEntry } from "../shared/historyEntry.js";

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

/**
 * Persists a merged history list.
 *
 * @param storage - Plugin-scoped persistent storage.
 * @param entries - Entries to store, newest first.
 */
export async function saveHistoryEntries(
  storage: PluginStorage,
  entries: HistoryEntry[]
): Promise<void> {
  await storage.set(STORAGE_KEY, entries);
}
