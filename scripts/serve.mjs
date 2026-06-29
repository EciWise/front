// Dev-server launcher: loads .env so the dev server honors PORT (and any other vars).
// Run `npm start` instead of `ng serve` directly so these values are read from .env.
import 'dotenv/config';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ngBin = join(
  root,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'ng.cmd' : 'ng',
);

const port = process.env.PORT ?? '4000';
const args = [
  'serve',
  '--port',
  port,
  '--host',
  '0.0.0.0',
  '--allowed-hosts',
  ...process.argv.slice(2),
];

spawn(ngBin, args, { stdio: 'inherit' }).on('exit', (code) => {
  process.exit(code ?? 0);
});
