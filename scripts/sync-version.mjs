import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './version-targets.mjs';
import { sync } from './version-control.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.exitCode = sync(root, config, process.argv.slice(2));
