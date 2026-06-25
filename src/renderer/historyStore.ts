import { createExternalStore } from "@harborclient/sdk/store";
import type { HistoryEntry } from "../shared/historyEntry.js";

/**
 * Module-level history list shared by capture handlers and the footer panel.
 */
export const historyStore = createExternalStore<HistoryEntry[]>([]);
