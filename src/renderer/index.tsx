import { installReact } from '@harborclient/sdk';
import type { PluginContext } from '@harborclient/sdk';
import { syncOnWindowFocus } from '@harborclient/sdk/store';
import { toHistoryEntry } from './historyCapture.js';
import { HistoryPanel } from './HistoryPanel.js';
import { createHistoryStore } from './historyStore.js';
import { mergeHistoryEntries } from '../shared/historyEntry.js';

/**
 * Activates the request history renderer entry and registers the footer panel.
 *
 * @param hc - Renderer plugin context from the host.
 */
export async function activate(hc: PluginContext): Promise<void> {
  installReact(hc.react);

  const historyStore = createHistoryStore(hc);

  await historyStore.reloadFromStorage();
  hc.subscriptions.push(syncOnWindowFocus(historyStore));

  hc.subscriptions.push(
    hc.http.onAfterSend(async (request, response) => {
      const entry = toHistoryEntry(request, response);
      const merged = mergeHistoryEntries([entry], historyStore.getSnapshot());
      await historyStore.set(merged);
    })
  );

  /**
   * Footer panel host wired to the storage-backed history store.
   */
  function HistoryPanelHost() {
    return <HistoryPanel store={historyStore} />;
  }

  hc.subscriptions.push(
    hc.ui.registerFooterPanel({
      id: 'history',
      title: 'History',
      Component: HistoryPanelHost
    })
  );
}

/**
 * Resets module state when the plugin deactivates.
 */
export function deactivate(): void {
  // Each webview activation owns its own store instance; nothing to reset globally.
}
