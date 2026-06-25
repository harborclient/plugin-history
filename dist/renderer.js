// node_modules/.pnpm/@harborclient+plugin-api@0.3.2_react@19.2.7/node_modules/@harborclient/plugin-api/dist/runtime/reactHost.js
var hostReact = null;
function setHostReact(react) {
  hostReact = react;
}
function requireHostReact() {
  if (hostReact == null) {
    throw new Error(
      "Plugin React host is not installed. Call installReact(hc.react) at the start of activate()."
    );
  }
  return hostReact;
}

// node_modules/.pnpm/@harborclient+plugin-api@0.3.2_react@19.2.7/node_modules/@harborclient/plugin-api/dist/runtime/index.js
function installReact(react) {
  setHostReact(react);
}

// node_modules/.pnpm/@harborclient+plugin-api@0.3.2_react@19.2.7/node_modules/@harborclient/plugin-api/dist/runtime-utils.js
function randomId(prefix = "id") {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
function byteLength(value) {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).length;
  }
  let bytes = 0;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 127) {
      bytes += 1;
    } else if (code <= 2047) {
      bytes += 2;
    } else if (code >= 55296 && code <= 56319) {
      bytes += 4;
      index += 1;
    } else {
      bytes += 3;
    }
  }
  return bytes;
}
function truncateToBytes(value, maxBytes) {
  if (typeof TextEncoder !== "undefined") {
    const encoded = new TextEncoder().encode(value);
    if (encoded.length <= maxBytes) {
      return value;
    }
    return new TextDecoder().decode(encoded.slice(0, maxBytes));
  }
  let bytes = 0;
  let index = 0;
  for (; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    let charBytes;
    if (code <= 127) {
      charBytes = 1;
    } else if (code <= 2047) {
      charBytes = 2;
    } else if (code >= 55296 && code <= 56319) {
      charBytes = 4;
    } else {
      charBytes = 3;
    }
    if (bytes + charBytes > maxBytes) {
      break;
    }
    bytes += charBytes;
    if (charBytes === 4) {
      index += 1;
    }
  }
  return value.slice(0, index);
}
function truncateBody(body, maxBytes, suffix = `

[truncated \u2014 body exceeded ${maxBytes} bytes]`) {
  if (byteLength(body) <= maxBytes) {
    return { body, truncated: false };
  }
  return {
    body: `${truncateToBytes(body, maxBytes)}${suffix}`,
    truncated: true
  };
}

// node_modules/.pnpm/@harborclient+plugin-api@0.3.2_react@19.2.7/node_modules/@harborclient/plugin-api/dist/storage/cappedList.js
function mergeById(pending, existing, options) {
  if (pending.length === 0) {
    return existing.slice(0, options.cap);
  }
  const seen = /* @__PURE__ */ new Set();
  const merged = [];
  for (const entry of [...pending, ...existing]) {
    const id = options.idOf(entry);
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    merged.push(entry);
    if (merged.length >= options.cap) {
      break;
    }
  }
  return merged;
}

// src/shared/historyEntry.ts
var MAX_BODY_BYTES = 64 * 1024;
function createEntryId() {
  return randomId("entry");
}
function truncateBody2(body) {
  return truncateBody(
    body,
    MAX_BODY_BYTES,
    `

[truncated \u2014 body exceeded ${MAX_BODY_BYTES} bytes]`
  );
}
function mergeHistoryEntries(pending, existing) {
  return mergeById(pending, existing, {
    cap: Number.MAX_SAFE_INTEGER,
    idOf: (entry) => entry.id
  });
}

// src/renderer/historyCapture.ts
function toHistoryEntry(request, response) {
  const requestBody = truncateBody2(request.body ?? "");
  const responseBody = truncateBody2(response.body ?? "");
  return {
    id: createEntryId(),
    timestamp: Date.now(),
    method: request.method,
    url: request.url,
    requestHeaders: { ...request.headers },
    requestBody: requestBody.body,
    status: response.status,
    statusText: response.statusText,
    responseHeaders: { ...response.headers },
    responseBody: responseBody.body,
    truncated: requestBody.truncated || responseBody.truncated
  };
}

// node_modules/.pnpm/@harborclient+plugin-api@0.3.2_react@19.2.7/node_modules/@harborclient/plugin-api/dist/runtime/react.js
function hook(name) {
  const react = requireHostReact();
  const fn = react[name];
  if (typeof fn !== "function") {
    throw new Error(`React hook "${String(name)}" is not available on hc.react.`);
  }
  return fn;
}
function useState(initialState) {
  return hook("useState")(initialState);
}
function useCallback(callback, deps) {
  return hook("useCallback")(callback, deps);
}
function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
  return hook("useSyncExternalStore")(subscribe, getSnapshot, getServerSnapshot);
}

// node_modules/.pnpm/@harborclient+plugin-api@0.3.2_react@19.2.7/node_modules/@harborclient/plugin-api/dist/ui/format.js
function formatHeaders(headers) {
  const lines = Object.entries(headers).map(([key, value]) => `${key}: ${value}`);
  return lines.length > 0 ? lines.join("\n") : "(none)";
}

// node_modules/.pnpm/@harborclient+plugin-api@0.3.2_react@19.2.7/node_modules/@harborclient/plugin-api/dist/ui/tokens.js
var METHOD_CLASSES = {
  get: "text-method-get",
  post: "text-method-post",
  put: "text-method-put",
  patch: "text-method-patch",
  delete: "text-method-delete",
  head: "text-method-head",
  options: "text-method-options"
};
function methodColorClass(method) {
  return METHOD_CLASSES[method.toLowerCase()] ?? "text-text";
}
function statusColorClass(status) {
  if (status >= 200 && status < 300) {
    return "bg-success";
  }
  if (status >= 300 && status < 400) {
    return "bg-warning";
  }
  if (status >= 400) {
    return "bg-danger";
  }
  return "bg-info";
}

// node_modules/.pnpm/@harborclient+plugin-api@0.3.2_react@19.2.7/node_modules/@harborclient/plugin-api/dist/runtime/jsx-runtime.js
var Fragment = Symbol.for("@harborclient/plugin-api.Fragment");
function build(type, props, key) {
  const react = requireHostReact();
  const elementType = type === Fragment ? react.Fragment : type;
  const { children, ...rest } = props ?? {};
  if (key !== void 0) {
    rest.key = key;
  }
  return react.createElement(elementType, rest, children);
}
var jsx = build;
var jsxs = build;

// src/renderer/HistoryEntryRow.tsx
function HistoryEntryRow({ entry, expanded, onToggle }) {
  const methodClass = methodColorClass(entry.method);
  const statusLabel = `${entry.status} ${entry.statusText}`;
  const detailsId = `history-entry-${entry.id}-details`;
  return /* @__PURE__ */ jsxs("div", { className: "border-b border-separator last:border-b-0", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[14px] hover:bg-selection/60 app-no-drag",
        "aria-expanded": expanded,
        "aria-controls": detailsId,
        onClick: onToggle,
        children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: `inline-block h-2 w-2 shrink-0 rounded-full ${statusColorClass(
                entry.status
              )}`,
              "aria-hidden": "true"
            }
          ),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: `shrink-0 px-1.5 py-0.5 text-[14px] uppercase ${methodClass}`,
              children: entry.method
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate font-mono text-[14px] text-text", children: entry.url }),
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted", children: statusLabel }),
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[14px] text-muted", children: new Date(entry.timestamp).toLocaleTimeString() }),
          entry.truncated && /* @__PURE__ */ jsx(
            "span",
            {
              className: "shrink-0 text-[14px] text-warning",
              title: "Body truncated",
              children: "truncated"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted", "aria-hidden": "true", children: expanded ? "\u25BE" : "\u25B8" })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        id: detailsId,
        hidden: !expanded,
        className: "border-t border-separator bg-surface px-3 py-3",
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-[14px]", children: [
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h4", { className: "mb-1 font-medium text-text", children: "Request headers" }),
            /* @__PURE__ */ jsx("pre", { className: "max-h-32 overflow-auto whitespace-pre-wrap break-all rounded border border-separator bg-field p-2 font-mono text-[14px] text-text", children: formatHeaders(entry.requestHeaders) })
          ] }),
          entry.requestBody ? /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h4", { className: "mb-1 font-medium text-text", children: "Request body" }),
            /* @__PURE__ */ jsx("pre", { className: "max-h-48 overflow-auto whitespace-pre-wrap break-all rounded border border-separator bg-field p-2 font-mono text-[14px] text-text", children: entry.requestBody })
          ] }) : null,
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h4", { className: "mb-1 font-medium text-text", children: "Response headers" }),
            /* @__PURE__ */ jsx("pre", { className: "max-h-32 overflow-auto whitespace-pre-wrap break-all rounded border border-separator bg-field p-2 font-mono text-[14px] text-text", children: formatHeaders(entry.responseHeaders) })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h4", { className: "mb-1 font-medium text-text", children: "Response body" }),
            /* @__PURE__ */ jsx("pre", { className: "max-h-48 overflow-auto whitespace-pre-wrap break-all rounded border border-separator bg-field p-2 font-mono text-[14px] text-text", children: entry.responseBody || "(empty)" })
          ] })
        ] })
      }
    )
  ] });
}

// src/shared/constants.ts
var STORAGE_KEY = "entries";

// src/renderer/historyStorage.ts
async function loadHistoryEntries(storage) {
  return await storage.get(STORAGE_KEY) ?? [];
}
async function clearHistoryEntries(storage) {
  await storage.set(STORAGE_KEY, []);
}
async function saveHistoryEntries(storage, entries) {
  await storage.set(STORAGE_KEY, entries);
}

// node_modules/.pnpm/@harborclient+plugin-api@0.3.2_react@19.2.7/node_modules/@harborclient/plugin-api/dist/runtime/store.js
function createExternalStore(initial) {
  let state = initial;
  const listeners = /* @__PURE__ */ new Set();
  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => state,
    setState: (next) => {
      state = next;
      for (const listener of listeners) {
        listener();
      }
    }
  };
}

// src/renderer/historyStore.ts
var historyStore = createExternalStore([]);

// src/renderer/HistoryPanel.tsx
function HistoryPanel({ hc }) {
  const { storage } = hc;
  const entries = useSyncExternalStore(
    historyStore.subscribe,
    historyStore.getSnapshot,
    () => []
  );
  const [expandedId, setExpandedId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);
  const handleClear = useCallback(async () => {
    setBusy(true);
    try {
      await clearHistoryEntries(storage);
      historyStore.setState([]);
      setExpandedId(null);
      setConfirmClear(false);
    } finally {
      setBusy(false);
    }
  }, [storage]);
  const toggleExpanded = useCallback((id) => {
    setExpandedId((current) => current === id ? null : id);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full min-h-0 flex-col bg-control", children: [
    /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-center border-b border-separator px-3 py-2", children: /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-wrap items-center gap-2 text-[14px] font-medium text-text", children: [
      /* @__PURE__ */ jsx("span", { children: "History" }),
      /* @__PURE__ */ jsxs("span", { className: "text-[14px] font-normal text-muted", children: [
        "(",
        entries.length,
        ")"
      ] }),
      confirmClear ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "text-[14px] font-normal text-muted", children: "Clear all history?" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "cursor-pointer rounded-md border border-separator bg-control px-3 py-1 text-[14px] font-normal text-text shadow-sm hover:bg-selection disabled:cursor-not-allowed disabled:opacity-50",
            disabled: busy,
            onClick: () => void handleClear(),
            children: "Confirm"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "cursor-pointer rounded-md border border-separator bg-control px-3 py-1 text-[14px] font-normal text-muted shadow-sm hover:bg-selection disabled:cursor-not-allowed disabled:opacity-50",
            disabled: busy,
            onClick: () => setConfirmClear(false),
            children: "Cancel"
          }
        )
      ] }) : /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "cursor-pointer rounded-md border border-separator bg-control px-3 py-1 text-[14px] font-normal text-text shadow-sm hover:bg-selection disabled:cursor-not-allowed disabled:opacity-50",
          disabled: entries.length === 0 || busy,
          onClick: () => setConfirmClear(true),
          children: "Clear"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-auto", role: "list", children: entries.length === 0 ? /* @__PURE__ */ jsx("p", { className: "px-3 py-4 text-[14px] text-muted", role: "status", children: "No requests recorded yet. Send a request to populate history." }) : entries.map((entry) => /* @__PURE__ */ jsx(
      HistoryEntryRow,
      {
        entry,
        expanded: expandedId === entry.id,
        onToggle: () => toggleExpanded(entry.id)
      },
      entry.id
    )) })
  ] });
}

// src/renderer/index.tsx
function activate(hc) {
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
  function HistoryPanelHost() {
    return /* @__PURE__ */ jsx(HistoryPanel, { hc });
  }
  hc.subscriptions.push(
    hc.ui.registerFooterPanel({
      id: "history",
      title: "History",
      Component: HistoryPanelHost
    })
  );
}
function deactivate() {
  historyStore.setState([]);
}
export {
  activate,
  deactivate
};
