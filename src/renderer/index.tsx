import { installReact } from "@harborclient/sdk";
import type { PluginContext } from "@harborclient/sdk";
import { toHistoryEntry } from "./historyCapture.js";
import { HistoryPanel } from "./HistoryPanel.js";
import { loadHistoryEntries, saveHistoryEntries } from "./historyStorage.js";
import { historyStore } from "./historyStore.js";
import { mergeHistoryEntries } from "../shared/historyEntry.js";

/**
 * Activates the request history renderer entry and registers the footer panel.
 *
 * @param hc - Renderer plugin context from the host.
 */
export function activate(hc: PluginContext): void {
  installReact(hc.react);

  void loadHistoryEntries(hc.storage).then((entries) => {
    historyStore.setState(entries);
  });

  hc.subscriptions.push(
    hc.http.onAfterSend(async (request, response) => {
      const entry = toHistoryEntry(request, response);
      const existing = historyStore.getSnapshot();
      const merged = mergeHistoryEntries([entry], existing);
      await saveHistoryEntries(hc.storage, merged);
      historyStore.setState(merged);
    })
  );

  /**
   * Footer panel host wired to plugin storage and React from the host.
   */
  function HistoryPanelHost() {
    return <HistoryPanel hc={hc} />;
  }

  hc.subscriptions.push(
    hc.ui.registerFooterPanel({
      id: "history",
      title: "History",
      Component: HistoryPanelHost,
    })
  );
}

/**
 * Resets module state when the plugin deactivates.
 */
export function deactivate(): void {
  historyStore.setState([]);
}
