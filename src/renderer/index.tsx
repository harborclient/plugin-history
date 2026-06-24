import type { PluginContext } from "@harborclient/plugin-api";
import { HistoryPanel } from "./HistoryPanel.js";
import { installReactHost } from "./reactHost.js";
import { ReactHost } from "./reactHost.js";

/**
 * Activates the request history renderer entry and registers the footer panel.
 *
 * @param hc - Renderer plugin context from the host.
 */
export function activate(hc: PluginContext): void {
  installReactHost(hc.react);
  const { useState, useEffect, useCallback } = hc.react;

  /**
   * Footer panel host wired to plugin storage and React from the host.
   */
  function HistoryPanelHost() {
    return (
      <HistoryPanel
        storage={hc.storage}
        hooks={{ useState, useEffect, useCallback }}
      />
    );
  }

  hc.subscriptions.push(
    hc.ui.registerFooterPanel({
      id: "history",
      title: "History",
      Component: HistoryPanelHost,
    })
  );
}
