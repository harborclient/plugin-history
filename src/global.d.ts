import type * as React from "react";

/**
 * HarborClient preload APIs used by this plugin but not exposed on PluginContext.
 */
interface HarborClientPluginApi {
  /**
   * Invokes a handler registered in the plugin main entry.
   */
  invokePluginMain: (
    pluginId: string,
    channel: string,
    args: unknown[]
  ) => Promise<unknown>;
}

declare global {
  interface Window {
    api: HarborClientPluginApi;
  }

  /**
   * Classic JSX (custom jsxFactory) expects a global JSX namespace; @types/react 19
   * only declares React.JSX.
   */
  namespace JSX {
    interface Element extends React.JSX.Element { }
    interface ElementClass extends React.JSX.ElementClass { }
    interface ElementAttributesProperty extends React.JSX.ElementAttributesProperty { }
    interface ElementChildrenAttribute extends React.JSX.ElementChildrenAttribute { }
    type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>;
    interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes { }
    interface IntrinsicClassAttributes<T> extends React.JSX.IntrinsicClassAttributes<T> { }
    interface IntrinsicElements extends React.JSX.IntrinsicElements { }
  }
}

export { };
