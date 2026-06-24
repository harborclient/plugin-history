/**
 * Plugin manifest id — must match manifest.json.
 */
export const PLUGIN_ID = "com.harborclient.plugins.history";

/**
 * IPC channel registered in the main entry for pulling captured entries.
 */
export const IPC_PULL_PENDING = "pullPending";

/**
 * Plugin storage key for persisted history entries.
 */
export const STORAGE_KEY = "entries";
