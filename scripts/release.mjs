#!/usr/bin/env node

/**
 * release.mjs
 * Handles the release lifecycle: version incrementing, bumping, synchronization,
 * and optional git tagging and docker builds.
 * Usage:
 *   node scripts/release.mjs             # Bumps version based on CalVer rules and syncs manifests
 *   node scripts/release.mjs --tag       # Also creates git commit and tag
 *   node scripts/release.mjs --build     # Also runs docker compose build
 */

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const VERSION_FILE = path.join(ROOT_DIR, 'VERSION');
const SYNC_SCRIPT = path.join(ROOT_DIR, 'scripts', 'sync-version.mjs');

async function main() {
  const args = process.argv.slice(2);
  const tagMode = args.includes('--tag');
  const buildMode = args.includes('--build');

  // 1. Read and validate current VERSION
  if (!existsSync(VERSION_FILE)) {
    console.error(`ERROR: VERSION file not found at ${VERSION_FILE}`);
    process.exit(1);
  }

  const rawVersion = (await fs.readFile(VERSION_FILE, 'utf8')).trim();
  const calVerRegex = /^(\d{4})\.(1[0-2]|[1-9])\.(\d+)$/;
  const match = rawVersion.match(calVerRegex);
  if (!match) {
    console.error(`ERROR: Version "${rawVersion}" in VERSION file does not match CalVer format YYYY.M.MINOR`);
    process.exit(1);
  }

  const [, fileYearStr, fileMonthStr, fileMinorStr] = match;
  const fileYear = parseInt(fileYearStr, 10);
  const fileMonth = parseInt(fileMonthStr, 10);
  const fileMinor = parseInt(fileMinorStr, 10);

  // 2. Get current system year and month (BKK / Local Time)
  const now = new Date();
  const sysYear = now.getFullYear();
  const sysMonth = now.getMonth() + 1; // getMonth is 0-indexed

  let newYear = fileYear;
  let newMonth = fileMonth;
  let newMinor = fileMinor;

  if (sysYear === fileYear && sysMonth === fileMonth) {
    // Current month is same as VERSION month -> increment MINOR
    newMinor = fileMinor + 1;
    console.log(`Bumping minor increment in current month (${sysYear}.${sysMonth}): ${fileMinor} -> ${newMinor}`);
  } else {
    // New month/year -> reset MINOR to 1 and update YYYY.M
    newYear = sysYear;
    newMonth = sysMonth;
    newMinor = 1;
    console.log(`New month detected: shifting from ${fileYear}.${fileMonth}.${fileMinor} to ${newYear}.${newMonth}.${newMinor}`);
  }

  const newVersion = `${newYear}.${newMonth}.${newMinor}`;

  // 3. Write new version to VERSION file
  await fs.writeFile(VERSION_FILE, newVersion + '\n');
  console.log(`✓ Updated VERSION file to ${newVersion}`);

  // 4. Synchronize version to manifests (sync-version.mjs)
  console.log('Running sync-version.mjs to propagate version...');
  try {
    execSync(`node "${SYNC_SCRIPT}"`, { stdio: 'inherit', cwd: ROOT_DIR });
  } catch (err) {
    console.error('ERROR: Manifest synchronization failed.');
    process.exit(1);
  }

  // 5. Git Commit and Tag
  if (tagMode) {
    console.log(`Creating Git commit and tag for version v${newVersion}...`);
    try {
      execSync('git add VERSION backend/package.json frontend/package.json', { stdio: 'inherit', cwd: ROOT_DIR });
      // Run npm install in backend and frontend to update package-lock.json with new version strings
      console.log('Updating backend package-lock.json...');
      execSync('npm install', { stdio: 'inherit', cwd: path.join(ROOT_DIR, 'backend') });
      console.log('Updating frontend package-lock.json...');
      execSync('npm install', { stdio: 'inherit', cwd: path.join(ROOT_DIR, 'frontend') });
      // Add package-lock.json files to git too
      execSync('git add backend/package-lock.json frontend/package-lock.json', { stdio: 'inherit', cwd: ROOT_DIR });

      execSync(`git commit -m "chore: bump version to v${newVersion}"`, { stdio: 'inherit', cwd: ROOT_DIR });
      execSync(`git tag -a "v${newVersion}" -m "Release v${newVersion}"`, { stdio: 'inherit', cwd: ROOT_DIR });
      console.log(`✓ Git commit and tag v${newVersion} created successfully.`);
    } catch (err) {
      console.error('ERROR: Git staging/tagging failed.', err.message);
      process.exit(1);
    }
  }

  // 6. Docker Build
  if (buildMode) {
    console.log('Building Docker images...');
    try {
      // Set the env var and run docker compose build
      execSync(`export APP_VERSION=${newVersion} && docker compose build`, { stdio: 'inherit', shell: true, cwd: ROOT_DIR });
      console.log('✓ Docker build completed successfully.');
    } catch (err) {
      console.error('ERROR: Docker compose build failed.', err.message);
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error('Fatal error in release.mjs:', err);
  process.exit(1);
});
