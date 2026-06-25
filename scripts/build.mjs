import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const rendererOptions = {
  bundle: true,
  format: "esm",
  logLevel: "info",
  entryPoints: ["src/renderer/index.tsx"],
  outfile: "dist/renderer.js",
  platform: "browser",
  jsx: "automatic",
  jsxImportSource: "@harborclient/sdk",
  external: ["react", "react-dom"],
};

const context = await esbuild.context(rendererOptions);

if (watch) {
  await context.watch();
  console.log("Watching for changes…");
} else {
  await context.rebuild();
  await context.dispose();
}
