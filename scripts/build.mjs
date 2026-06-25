import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const sharedOptions = {
  bundle: true,
  format: "esm",
  logLevel: "info",
};

const rendererOptions = {
  ...sharedOptions,
  entryPoints: ["src/renderer/index.tsx"],
  outfile: "dist/renderer.js",
  platform: "browser",
  jsx: "automatic",
  jsxImportSource: "@harborclient/plugin-api",
  external: ["react", "react-dom"],
};

const contexts = await Promise.all([
  esbuild.context({
    ...sharedOptions,
    entryPoints: ["src/main.ts"],
    outfile: "dist/main.js",
    platform: "neutral",
  }),
  esbuild.context(rendererOptions),
]);

if (watch) {
  await Promise.all(contexts.map((context) => context.watch()));
  console.log("Watching for changes…");
} else {
  await Promise.all(contexts.map((context) => context.rebuild()));
  await Promise.all(contexts.map((context) => context.dispose()));
}
