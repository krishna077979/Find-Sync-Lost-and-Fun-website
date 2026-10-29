import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const tsxDist = dirname(require.resolve('tsx'));

// tsx falls back to os.userInfo() for a temp-directory suffix on Windows.
// That API can fail in managed environments where USERNAME is still set.
for (const [file, before, after] of [
  [
    join(tsxDist, 'temporary-directory-Du7LpLp9.mjs'),
    'n.userInfo().username',
    '(process.env.USERNAME||process.env.USER||"user")',
  ],
  [
    join(tsxDist, 'client-XItNFmsq.cjs'),
    'a.userInfo().username',
    '(process.env.USERNAME||process.env.USER||"user")',
  ],
]) {
  const source = await readFile(file, 'utf8');
  if (source.includes(before)) await writeFile(file, source.replace(before, after));
}

const tsxCli = require.resolve('tsx/cli');
process.argv = [process.execPath, tsxCli, ...process.argv.slice(2)];
await import(pathToFileURL(tsxCli).href);
