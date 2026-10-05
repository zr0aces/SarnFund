import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const FORMAT = /^[2-9][0-9]{3}\.(?:[1-9]|1[0-2])\.[1-9][0-9]*$/;

export function parseVersion(value) {
  if (typeof value !== 'string' || value.match(FORMAT)?.[0] !== value) throw new Error('Expected strict CalVer YYYY.M.N');
  const tuple = value.split('.').map(Number);
  if (!Number.isSafeInteger(tuple[2])) throw new Error('CalVer counter exceeds Number.MAX_SAFE_INTEGER');
  return tuple;
}

export function compareVersions(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
  return 0;
}

export function calendar(now = new Date()) {
  const shifted = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const tuple = [shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 1];
  parseVersion(tuple.join('.'));
  return tuple;
}

export function targetVersion(current, options, aliases = {}, now = new Date()) {
  const old = parseVersion(current);
  const today = calendar(now);
  let next;
  if (options.version !== undefined) next = parseVersion(options.version);
  else if (options.selector && aliases[options.selector] === 'month') {
    next = old[1] === 12 ? [old[0] + 1, 1, 1] : [old[0], old[1] + 1, 1];
  } else if (options.selector && aliases[options.selector] === 'year') next = [old[0] + 1, 1, 1];
  else next = compareVersions(today.slice(0, 2), old.slice(0, 2)) > 0 ? today : [old[0], old[1], old[2] + 1];
  const result = next.join('.');
  parseVersion(result);
  if (compareVersions(next, old) <= 0) throw new Error('Target must be strictly newer than VERSION');
  if ((options.version !== undefined || ['month', 'year'].includes(aliases[options.selector])) &&
      compareVersions(next.slice(0, 2), today.slice(0, 2)) > 0) throw new Error('Explicit target month is later than current GMT+7 month');
  return result;
}

export function parseReleaseArgs(argv, aliases = {}) {
  if (argv.length === 1 && ['--help', '-h'].includes(argv[0])) return { help: true, warnings: [] };
  const options = { warnings: [] };
  const select = (key, value) => {
    if (options.version !== undefined || options.selector !== undefined) throw new Error('Duplicate or conflicting version selectors');
    options[key] = value;
  };
  const version = (value, deprecated) => {
    if (typeof value !== 'string' || !value) throw new Error('Version option requires a value');
    if (value.startsWith('v')) { options.warnings.push('leading v'); value = value.slice(1); }
    parseVersion(value);
    select('version', value);
    if (deprecated) options.warnings.push(deprecated);
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--build' || arg === '--tag') {
      const key = arg.slice(2);
      if (options[key]) throw new Error(`Duplicate ${arg}`);
      options[key] = true;
    } else if (arg === '--version' || arg === '-v') version(argv[++i], arg === '-v' ? '-v' : null);
    else if (arg.startsWith('--version=')) version(arg.slice(10));
    else if (arg === 'patch' || Object.hasOwn(aliases, arg)) {
      select('selector', arg);
      options.warnings.push(arg);
    } else if (/^v?[0-9]/.test(arg)) version(arg, 'positional version');
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function readVersion(root) {
  const raw = fs.readFileSync(path.join(root, 'VERSION'), 'utf8');
  const value = raw.replace(/\r?\n$/, '');
  parseVersion(value);
  return value;
}

function jsonTransform(content, update) {
  const json = JSON.parse(content);
  if (!json || Array.isArray(json) || typeof json !== 'object') throw new Error('Expected JSON object');
  if (!update(json)) return content;
  const indent = content.match(/\n([\t ]+)"/)?.[1] ?? '  ';
  return JSON.stringify(json, null, indent) + '\n';
}

export function packageVersion(content, version) {
  return jsonTransform(content, (json) => {
    if (typeof json.version !== 'string') throw new Error('Missing package version field');
    if (json.version === version) return false;
    json.version = version;
    return true;
  });
}

export function npmLockVersion(content, version, workspaces = []) {
  return jsonTransform(content, (json) => {
    if (![1, 2, 3].includes(json.lockfileVersion) || typeof json.version !== 'string') throw new Error('Unsupported npm lock layout');
    const entries = [json];
    if (json.lockfileVersion !== 1) {
      if (!json.packages || Array.isArray(json.packages) || typeof json.packages !== 'object') throw new Error('Missing npm packages map');
      for (const key of ['', ...workspaces]) {
        const entry = json.packages[key];
        if (!entry || typeof entry.version !== 'string' || entry.link) throw new Error(`Missing local npm version entry: ${key}`);
        entries.push(entry);
      }
    } else if (workspaces.length) throw new Error('npm v1 cannot represent mapped workspaces');
    let changed = false;
    for (const entry of entries) if (entry.version !== version) { entry.version = version; changed = true; }
    return changed;
  });
}

export function replaceRequired(content, pattern, replacement) {
  const probe = new RegExp(pattern.source, pattern.flags);
  if (!probe.test(content)) throw new Error(`anchor-missing: ${pattern.source}`);
  return content.replace(pattern, replacement);
}

function inventory(root, targets, version) {
  const files = new Map();
  const skipped = [];
  for (const target of targets) {
    const absolute = path.resolve(root, target.path);
    const relative = path.relative(root, absolute);
    if (!relative || relative === 'VERSION' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative) || relative === '..') throw new Error('Target must be inside repository and separate from VERSION');
    let file = files.get(absolute);
    if (!file) {
      const exists = fs.existsSync(absolute);
      if (!exists && target.optional) { skipped.push(relative); continue; }
      if (!exists && !target.generated) throw new Error(`Required file missing: ${relative}`);
      if (!exists && !fs.statSync(path.dirname(absolute)).isDirectory()) throw new Error(`Missing generated-file directory: ${relative}`);
      const before = exists ? fs.readFileSync(absolute) : null;
      file = { path: relative, absolute, before, after: before?.toString('utf8') ?? '', generated: !!target.generated, private: !!target.private };
      files.set(absolute, file);
    }
    file.after = target.transform(file.after, version);
    if (typeof file.after !== 'string') throw new Error(`Invalid transform result: ${relative}`);
    file.private ||= !!target.private;
  }
  return { files: [...files.values()], skipped };
}

export function checkVersion(root, config) {
  const version = readVersion(root);
  const result = inventory(root, config.targets, version);
  const drift = result.files.filter((file) => file.before === null || !file.before.equals(Buffer.from(file.after))).map((file) => file.path);
  if (drift.length) throw new Error(`Version divergence: ${drift.join(', ')}`);
  return { version, ...result };
}

export function prepareVersion(root, config, version, { afterWrite = () => {}, verify = checkVersion } = {}) {
  const source = path.join(root, 'VERSION');
  readVersion(root);
  parseVersion(version);
  const result = inventory(root, config.targets, version);
  const files = [{ path: 'VERSION', absolute: source, before: fs.readFileSync(source), after: version + '\n' }, ...result.files];
  const changed = files.filter((file) => file.before === null || !file.before.equals(Buffer.from(file.after)));
  const written = [];
  try {
    for (const file of changed) {
      written.push(file);
      fs.writeFileSync(file.absolute, file.after);
      afterWrite(file, written.length);
    }
    verify(root, config);
  } catch (error) {
    const recovery = [];
    for (const file of written.reverse()) {
      try {
        if (file.before === null) fs.rmSync(file.absolute, { force: true });
        else fs.writeFileSync(file.absolute, file.before);
      } catch { recovery.push(file.path); }
    }
    const failure = new Error(`${recovery.length ? 'Rollback failed for ' + recovery.join(', ') : 'rolled back'}: ${error.message}`);
    failure.state = recovery.length ? 'rollback-failed' : 'rolled back';
    throw failure;
  }
  return { version, changed, ...result };
}

function child(root, command, args, options = {}) {
  return execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options });
}

function git(root, args, run) {
  // check-ignore accepts literal filenames, not Git's literal pathspec magic.
  return run(root, 'git', args, { env: { ...process.env, GIT_LITERAL_PATHSPECS: args[0] === 'check-ignore' ? '0' : '1' } }).trim();
}

function absentGitResult(root, args, run) {
  try { git(root, args, run); return false; }
  catch (error) { if (error.status === 1) return true; throw error; }
}

function tagPreflight(root, version, files, run) {
  if (git(root, ['diff', '--cached', '--name-only', '-z'], run)) throw new Error('Git index must be empty');
  const branch = git(root, ['symbolic-ref', '--quiet', '--short', 'HEAD'], run);
  if (!branch) throw new Error('Attached Git branch required');
  if (!absentGitResult(root, ['show-ref', '--verify', '--quiet', `refs/tags/v${version}`], run)) throw new Error('Local release tag already exists');
  for (const file of files) {
    if (file.private) continue;
    if (!absentGitResult(root, ['check-ignore', '--quiet', '--no-index', '--', file.path], run)) throw new Error(`Ignored release path: ${file.path}`);
    if (!file.generated) git(root, ['ls-files', '--error-unmatch', '--', file.path], run);
  }
}

const quote = (value) => "'" + value.replaceAll("'", "'\\''") + "'";

function instructions(root, version, paths, run, log) {
  const tag = `v${version}`;
  const staging = paths.filter((file) => {
    try { return absentGitResult(root, ['check-ignore', '--quiet', '--no-index', '--', file], run); }
    catch { return true; } // Non-Git preparation still prints its exact inventory.
  });
  log(`Prepared ${version}; review changes before publishing.`);
  log('The Git index must be empty before staging release paths.');
  log(`git add -- ${staging.map(quote).join(' ')}`);
  log(`git commit -m ${quote(`chore(release): ${tag}`)}`);
  log(`git tag -a ${quote(tag)} -m ${quote(`Release ${tag}`)}`);
  try {
    const branch = git(root, ['symbolic-ref', '--quiet', '--short', 'HEAD'], run);
    const [remote, ref] = git(root, ['for-each-ref', '--format=%(upstream:remotename)%00%(upstream:remoteref)', `refs/heads/${branch}`], run).split('\0');
    if (!remote || !ref) throw new Error('No upstream');
    log(`Before pushing, verify the remote tag is absent: git ls-remote --tags ${quote(remote)} ${quote(`refs/tags/${tag}`)}`);
    log(`git push ${quote(remote)} ${quote(`HEAD:${ref}`)}`);
    log(`git push ${quote(remote)} ${quote(`refs/tags/${tag}`)}`);
  } catch { log('No attached branch/upstream available: select and verify the remote branch and release tag manually; no push performed.'); }
}

export function release(root, config, argv, { now = new Date(), run = child, log = console.log, warn = console.error, ...transaction } = {}) {
  let state = 'unchanged';
  try {
    const options = parseReleaseArgs(argv, config.aliases);
    if (options.help) {
      const extension = fs.existsSync(path.join(root, 'scripts', 'release.js')) ? 'js' : 'mjs';
      const command = `node scripts/release.${extension}`;
      const hasBuild = !!config.build?.length;
      log(`Prepare a CalVer release (YYYY.M.N). Nothing is changed by --help.

Usage: ${command} [--version YYYY.M.N]${hasBuild ? ' [--build]' : ''} [--tag]

Common commands:
  ${command}
    Prepare the next version: bump VERSION, sync versioned files, then check them.
    Does NOT build, commit, tag, or push. Prints Git commands for you to review.

  ${command} --tag
    Prepare the next version AND commit release files and create a local annotated tag.
    Requires an empty Git index, an attached branch, and no existing release tag.

  ${command} --version YYYY.M.N
    Replace YYYY.M.N with your chosen version. It must be newer than VERSION
    and its month must not be later than the current GMT+7 calendar month.

  node scripts/sync-version.${extension} --check
    Check the current versioned files without bumping or changing anything.

Options:
  --version VALUE  Choose an exact version (also accepts --version=VALUE).
  --tag            Commit only changed release files, then create an annotated tag.
  --build          ${hasBuild ? 'Run the repository build after preparation, before any commit/tag.' : 'Not supported in this repository; fails without changing files.'}
  -h, --help       Show this help without changing anything.

Important:
  Each release invocation prepares a NEW version. To tag an already-prepared
  version, use the printed Git commands instead of rerunning release --tag.
  No command pushes automatically. Review changes before publishing.

Legacy shortcuts (still accepted, but warn):
  Positional version, -v VALUE, leading v, patch${Object.keys(config.aliases ?? {}).length ? ', ' + Object.keys(config.aliases).join(', ') : ''}.
  Prefer --version VALUE for an exact version, or no selector for the next version.`);
      return 0;
    }
    for (const alias of options.warnings) warn(`Deprecated alias: ${alias}; use --version or no selector.`);
    const version = targetVersion(readVersion(root), options, config.aliases, now);
    if (options.build && !config.build?.length) throw new Error('--build is unsupported in this repository');
    const preview = inventory(root, config.targets, version);
    if (options.tag) tagPreflight(root, version, [{ path: 'VERSION' }, ...preview.files], run);
    const prepared = prepareVersion(root, config, version, transaction);
    state = 'prepared';
    for (const skipped of prepared.skipped) log(`Optional absent target skipped: ${skipped}`);
    if (options.build) {
      state = 'prepared/build-failed';
      for (const { command, args, cwd = '.', env = {} } of config.build) {
        const environment = typeof env === 'function' ? env(version) : env;
        run(path.resolve(root, cwd), command === 'node' ? process.execPath : command, args,
          { stdio: 'ignore', env: { ...process.env, ...environment, APP_VERSION: version } });
      }
      state = 'prepared';
    }
    const paths = prepared.changed.filter((file) => !file.private).map((file) => file.path);
    if (options.tag) {
      state = 'prepared/Git-failed';
      try {
        git(root, ['add', '--', ...paths], run);
        git(root, ['commit', '-m', `chore(release): v${version}`], run);
      } catch {
        try { git(root, ['restore', '--staged', '--', ...paths], run); }
        catch { throw new Error('Git staging/commit failed; could not unstage release paths; inspect index manually'); }
        throw new Error('Git staging/commit failed; release paths unstaged');
      }
      const sha = git(root, ['rev-parse', 'HEAD'], run);
      state = `committed/tag-failed (commit ${sha})`;
      try { git(root, ['tag', '-a', `v${version}`, '-m', `Release v${version}`], run); }
      catch { throw new Error(`Create the annotated tag manually at ${sha}; do not reset HEAD or overwrite an existing tag`); }
      state = 'committed/tagged';
      log(`Committed and tagged v${version}; no push performed.`);
    }
    if (!options.tag) instructions(root, version, paths, run, log);
    else log('Before manually pushing the branch and this exact tag, verify the remote tag is absent.');
    return 0;
  } catch (error) {
    // Child output may contain credentials; report state/status, never captured stdout/stderr.
    const childError = error.cmd || error.syscall || 'stdout' in error || 'stderr' in error || 'status' in error;
    const detail = childError ? `child command failed (status ${error.status ?? 'unknown'})` : error.message;
    warn(`${error.state ?? state}: ${detail}`);
    return 1;
  }
}

export function sync(root, config, argv, { log = console.log, warn = console.error } = {}) {
  try {
    if (argv.length === 1 && ['--help', '-h'].includes(argv[0])) { log('Usage: sync-version [--check]\n--check is read-only; default sync never bumps, builds, installs, or mutates Git.'); return 0; }
    if (argv.length > 1 || (argv.length === 1 && argv[0] !== '--check')) throw new Error('Unknown or duplicate sync arguments');
    const result = argv.length ? checkVersion(root, config) : prepareVersion(root, config, readVersion(root));
    for (const skipped of result.skipped) log(`Optional absent target skipped: ${skipped}`);
    log(`${argv.length ? 'Checked' : 'Synced'} ${result.version}`);
    return 0;
  } catch (error) { warn(`${error.state ?? 'unchanged'}: ${error.message}`); return 1; }
}
