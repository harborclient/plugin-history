import { buildRenderer } from '@harborclient/sdk/build';

await buildRenderer({
  entry: 'src/renderer/index.tsx',
  jsxRuntime: 'runtime',
  watch: process.argv.includes('--watch')
});
