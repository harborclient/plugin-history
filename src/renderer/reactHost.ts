import type * as React from "react";

/**
 * React namespace wired from hc.react at activation time.
 *
 * JSX compiles to ReactHost.createElement — do not import react in plugin bundles.
 */
export const ReactHost: {
  createElement: typeof React.createElement;
  Fragment: typeof React.Fragment;
} = {
  createElement: ((..._args: unknown[]) => {
    throw new Error(
      "Plugin React host not installed. Call installReactHost() in activate()."
    );
  }) as typeof React.createElement,
  Fragment: (() => null) as unknown as typeof React.Fragment,
};

/**
 * Installs the host React instance for JSX rendering in this plugin.
 *
 * @param react - React namespace from hc.react.
 */
export function installReactHost(react: typeof React): void {
  ReactHost.createElement = react.createElement;
  ReactHost.Fragment = react.Fragment;
}
