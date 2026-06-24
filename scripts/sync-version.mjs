#!/usr/bin/env node

/**
 * sync-version.mjs
 * Propagates the version from VERSION (single source of truth) to package manifests.
 * Usage:
 *   node scripts/sync-version.mjs         # Propagates version to manifests
 *   node scripts/sync-version.mjs --check # Exits 0 if synced, 1 if out of sync
 */

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const VERSION_FILE = path.join(ROOT_DIR, 'VERSION');
const BACKEND_PKG = path.join(ROOT_DIR, 'backend', 'package.json');
const FRONTEND_PKG = path.join(ROOT_DIR, 'frontend', 'package.json');

async function main() {
  const args = process.argv.slice(2);
  const checkMode = args.includes('--check');

  // 1. Read and validate VERSION
  if (!existsSync(VERSION_FILE)) {
    console.error(`ERROR: VERSION file not found at ${VERSION_FILE}`);
    process.exit(1);
  }

  const rawVersion = (await fs.readFile(VERSION_FILE, 'utf8')).trim();
  // Validates format: YYYY.M.MINOR (e.g. 2026.6.1, month 1-12 without leading zero)
  const calVerRegex = /^\d{4}\.(1[0-2]|[1-9])\.\d+$/;
  if (!calVerRegex.test(rawVersion)) {
    console.error(`ERROR: Version "${rawVersion}" in VERSION file does not match CalVer format YYYY.M.MINOR (e.g., 2026.6.1)`);
    process.exit(1);
  }

  console.log(`Source of truth version: ${rawVersion}`);

  // 2. Read package files
  const manifests = [
    { name: 'backend/package.json', path: BACKEND_PKG },
    { name: 'frontend/package.json', path: FRONTEND_PKG }
  ];

  let matches = true;
  const loadedManifests = [];

  for (const m of manifests) {
    if (!existsSync(m.path)) {
      console.error(`ERROR: File not found at ${m.path}`);
      process.exit(1);
    }
    const raw = await fs.readFile(m.path, 'utf8');
    const parsed = JSON.parse(raw);
    loadedManifests.push({ ...m, parsed, rawContent: raw });

    if (parsed.version !== rawVersion) {
      matches = false;
      if (checkMode) {
        console.error(`DIVERGENCE: ${m.name} has version "${parsed.version}" but VERSION has "${rawVersion}"`);
      }
    }
  }

  if (checkMode) {
    if (matches) {
      console.log('✓ Validation successful: all package manifests match VERSION.');
      process.exit(0);
    } else {
      console.error('❌ Validation failed: version mismatch detected.');
      process.exit(1);
    }
  }

  // 3. Write updates if mismatch and not in check mode
  for (const m of loadedManifests) {
    if (m.parsed.version !== rawVersion) {
      m.parsed.version = rawVersion;
      // Preserve format formatting (e.g. indent)
      const indent = m.rawContent.match(/^\s+/m)?.[0] || '  ';
      await fs.writeFile(m.path, JSON.stringify(m.parsed, null, indent) + '\n');
      console.log(`✓ Updated ${m.name} to ${rawVersion}`);
    } else {
      console.log(`- ${m.name} is already at ${rawVersion}`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error in sync-version.mjs:', err);
  process.exit(1);
});
