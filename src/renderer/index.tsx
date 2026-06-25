import { installReact } from "@harborclient/plugin-api";
import type { PluginContext } from "@harborclient/plugin-api";
import { HistoryPanel } from "./HistoryPanel.js";

/**
 * Activates the request history renderer entry and registers the footer panel.
 *
 * @param hc - Renderer plugin context from the host.
 */
export function activate(hc: PluginContext): void {
  installReact(hc.react);

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
