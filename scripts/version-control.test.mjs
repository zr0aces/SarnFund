import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import localConfig from './version-targets.mjs';
import { parseVersion, compareVersions, calendar, targetVersion, parseReleaseArgs, packageVersion, npmLockVersion, replaceRequired, checkVersion, prepareVersion, release, sync } from './version-control.mjs';

const now = new Date('2026-10-05T00:00:00Z');
const here = path.dirname(fileURLToPath(import.meta.url));
const localRoot = path.resolve(here, '..');
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const config = { targets: [
  { path: 'package.json', transform: packageVersion },
  { path: 'package-lock.json', transform: npmLockVersion },
  { path: 'generated.js', generated: true, transform: (_, v) => `export const version = '${v}';\n` },
] };

function temp(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'calver spaced root '));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
function write(root, name, content) {
  fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
  fs.writeFileSync(path.join(root, name), content);
}
function fixture(t, version = '2026.10.1') {
  const root = temp(t);
  write(root, 'VERSION', version + '\n');
  write(root, 'package.json', json({ name: 'fixture', version }));
  write(root, 'package-lock.json', json({ version, lockfileVersion: 3, packages: { '': { version }, 'node_modules/x': { version: '1.2.3', integrity: 'unchanged' } } }));
  return root;
}
function bytes(root, names = ['VERSION', 'package.json', 'package-lock.json', 'generated.js']) {
  return names.map((name) => fs.existsSync(path.join(root, name)) ? fs.readFileSync(path.join(root, name)).toString('base64') : null);
}
function runner(root, command, args, options = {}) {
  return execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options });
}
function git(root, ...args) { return runner(root, 'git', args).trim(); }
function init(root) {
  git(root, 'init', '-b', 'release-test');
  git(root, 'config', 'user.email', 'fixture@example.invalid');
  git(root, 'config', 'user.name', 'CalVer Fixture');
  git(root, 'config', 'commit.gpgsign', 'false');
  git(root, 'config', 'tag.gpgsign', 'false');
  git(root, 'add', '--', 'VERSION', 'package.json', 'package-lock.json');
  git(root, 'commit', '-m', 'fixture');
}
function output(options = {}) {
  const logs = [];
  return { logs, options: { now, log: (s) => logs.push(s), warn: (s) => logs.push(s), ...options } };
}

test('release help gives runnable commands, supported options and a no-double-bump warning without side effects', (t) => {
  for (const extension of ['mjs', 'js']) {
    const root = temp(t);
    write(root, `scripts/release.${extension}`, '// fixture entry');
    const before = bytes(root);
    for (const build of [undefined, [{ command: 'docker', args: ['compose', 'build'] }]]) {
      const out = output({ run: () => assert.fail('help must not execute children') });
      assert.equal(release(root, { ...config, build }, ['--help'], out.options), 0);
      const help = out.logs.join('\n');
      assert.ok(help.includes(`node scripts/release.${extension} --tag`));
      assert.ok(help.includes(`node scripts/release.${extension} --version YYYY.M.N`));
      assert.ok(help.includes(`node scripts/sync-version.${extension} --check`));
      assert.match(help, /Does NOT build, commit, tag, or push/);
      assert.match(help, /Each release invocation prepares a NEW version/);
      assert.match(help, /use the printed Git commands instead of rerunning/);
      assert.equal(help.split('\n').find((line) => line.startsWith('Usage:')).includes('[--build]'), !!build);
      assert.ok(help.includes(build ? 'Run the repository build' : 'Not supported in this repository'));
      assert.deepEqual(bytes(root), before);
    }
  }
});

test('default prepare/check/help leave index and refs unchanged even with unrelated staged content', (t) => {
  const root = fixture(t);
  init(root);
  const head = git(root, 'rev-parse', 'HEAD');
  write(root, 'unrelated.txt', 'keep');
  git(root, 'add', 'unrelated.txt');
  const index = git(root, 'diff', '--cached', '--raw');
  const out = output();
  assert.equal(release(root, config, ['patch'], out.options), 0);
  const prepared = bytes(root);
  assert.equal(sync(root, config, ['--check'], out.options), 0);
  assert.equal(release(root, config, ['--help'], out.options), 0);
  assert.deepEqual(bytes(root), prepared);
  assert.equal(git(root, 'rev-parse', 'HEAD'), head);
  assert.equal(git(root, 'tag', '--list'), '');
  assert.equal(git(root, 'diff', '--cached', '--raw'), index);
  assert.ok(out.logs.some((s) => s.includes('Deprecated alias: patch')));
  assert.ok(out.logs.some((s) => s.startsWith('git add -- ')));
  assert.ok(!out.logs.some((s) => s.includes('git add .') || s.includes('origin main')));
});

test('tag preflight rejects staged content, detached HEAD, existing tag, untracked/ignored targets', (t) => {
  for (const scenario of ['index', 'detached', 'tag', 'untracked', 'ignored']) {
    const root = fixture(t);
    init(root);
    if (scenario === 'index') { write(root, 'unrelated.txt', 'keep'); git(root, 'add', 'unrelated.txt'); }
    if (scenario === 'detached') git(root, 'checkout', '--detach');
    if (scenario === 'tag') git(root, 'tag', 'v2026.10.2');
    if (scenario === 'untracked') { git(root, 'rm', '--cached', 'package.json'); git(root, 'commit', '-m', 'untrack package'); }
    if (scenario === 'ignored') write(root, '.gitignore', 'generated.js\n');
    const before = bytes(root);
    const index = git(root, 'diff', '--cached', '--raw');
    const head = git(root, 'rev-parse', 'HEAD');
    assert.equal(release(root, config, ['--tag'], output().options), 1, scenario);
    assert.deepEqual(bytes(root), before);
    assert.equal(git(root, 'diff', '--cached', '--raw'), index);
    assert.equal(git(root, 'rev-parse', 'HEAD'), head);
  }
});

test('opt-in Git commits exact paths and creates an annotated tag without unrelated files', (t) => {
  const root = fixture(t);
  init(root);
  write(root, 'unrelated.txt', 'not release content');
  const out = output();
  assert.equal(release(root, config, ['--tag'], out.options), 0, out.logs.join('\n'));
  assert.equal(git(root, 'cat-file', '-t', 'refs/tags/v2026.10.2'), 'tag');
  assert.deepEqual(git(root, 'diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD').split('\n').sort(), ['VERSION', 'generated.js', 'package-lock.json', 'package.json']);
  assert.equal(git(root, 'diff', '--cached', '--name-only'), '');
  assert.equal(git(root, 'status', '--porcelain'), '?? unrelated.txt');
  checkVersion(root, config);
});

test('failed build retains prepared files, blocks commit/tag, uses root CWD and redacts child output', (t) => {
  const root = fixture(t);
  init(root);
  const head = git(root, 'rev-parse', 'HEAD');
  let called = 0;
  const building = { ...config, build: [{ command: 'docker', args: ['compose', 'build'] }] };
  const out = output({ run: (cwd, command, args, options) => {
    if (command === 'docker') {
      called++;
      assert.equal(cwd, root);
      // The release version is injected into child options, not read from a file.
      assert.equal(options.env.APP_VERSION, '2026.10.2');
      assert.deepEqual(args, ['compose', 'build']);
      const error = new Error('sensitive child output');
      error.cmd = command; error.status = 17;
      throw error;
    }
    return runner(cwd, command, args, options);
  } });
  assert.equal(release(root, building, ['--tag', '--build'], out.options), 1);
  assert.equal(called, 1);
  assert.equal(fs.readFileSync(path.join(root, 'VERSION'), 'utf8'), '2026.10.2\n');
  checkVersion(root, config);
  assert.equal(git(root, 'rev-parse', 'HEAD'), head);
  assert.equal(git(root, 'tag', '--list'), '');
  assert.ok(out.logs.some((s) => s.includes('prepared/build-failed')));
  assert.ok(!out.logs.join('\n').includes('sensitive child output'));
});

test('explicit build precedes tagging, Node children use process.execPath, no implicit install', (t) => {
  const root = fixture(t);
  init(root);
  const calls = [];
  const building = { ...config, build: [{ command: 'node', args: ['-e', 'process.exit(0)'] }, { command: 'docker', args: ['compose', 'build'] }] };
  const out = output({ run: (cwd, command, args, options) => {
    calls.push([command, ...args]);
    if (command === 'docker') return '';
    return runner(cwd, command, args, options);
  } });
  assert.equal(release(root, building, ['--build', '--tag'], out.options), 0);
  assert.ok(calls.findIndex((c) => c[0] === process.execPath) < calls.findIndex((c) => c[0] === 'git' && c[1] === 'commit'));
  assert.ok(calls.findIndex((c) => c[0] === 'docker') < calls.findIndex((c) => c[0] === 'git' && c[1] === 'tag'));
  assert.ok(!calls.some((c) => c[0] === 'npm'));
});

test('build environment supports static and version-derived values without implicit execution', (t) => {
  const root = fixture(t);
  const calls = [];
  const building = { ...config, build: [
    { command: 'docker', args: ['compose', 'build'], env: { STATIC_VALUE: 'keep' } },
    { command: 'docker', args: ['compose', 'build'], env: (version) => ({ NEXSIGNL_VERSION: version }) },
  ] };
  const out = output({ run: (_cwd, command, _args, { env } = {}) => {
    if (command === 'docker') calls.push(env);
    return '';
  } });
  assert.equal(release(root, building, [], out.options), 0);
  assert.equal(calls.length, 0);
  assert.equal(release(root, building, ['--build'], out.options), 0);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].STATIC_VALUE, 'keep');
  assert.equal(calls[0].APP_VERSION, '2026.10.3');
  assert.equal(calls[1].NEXSIGNL_VERSION, '2026.10.3');
  assert.equal(calls[1].APP_VERSION, '2026.10.3');
});

test('commit failure unstages owned paths; tag failure retains commit and reports SHA', (t) => {
  for (const stage of ['commit', 'tag']) {
    const root = fixture(t);
    init(root);
    const head = git(root, 'rev-parse', 'HEAD');
    const out = output({ run: (cwd, command, args, options) => {
      if (command === 'git' && args[0] === stage) { const error = new Error('injected'); error.cmd = 'git'; error.status = 1; throw error; }
      return runner(cwd, command, args, options);
    } });
    assert.equal(release(root, config, ['--tag'], out.options), 1);
    checkVersion(root, config);
    assert.equal(git(root, 'diff', '--cached', '--name-only'), '');
    assert.equal(git(root, 'tag', '--list'), '');
    if (stage === 'commit') assert.equal(git(root, 'rev-parse', 'HEAD'), head);
    else {
      const sha = git(root, 'rev-parse', 'HEAD');
      assert.notEqual(sha, head);
      assert.ok(out.logs.some((s) => s.includes(sha) && s.includes('committed/tag-failed')));
    }
  }
});

test('manual instructions use actual upstream and separate exact branch/tag pushes', (t) => {
  const root = fixture(t);
  init(root);
  git(root, 'remote', 'add', 'fixture-remote', '/nonexistent-fixture-remote');
  git(root, 'config', 'branch.release-test.remote', 'fixture-remote');
  git(root, 'config', 'branch.release-test.merge', 'refs/heads/trunk');
  git(root, 'update-ref', 'refs/remotes/fixture-remote/trunk', 'HEAD');
  const out = output();
  assert.equal(release(root, config, [], out.options), 0);
  const command = out.logs.find((s) => s.startsWith('git add -- '));
  assert.ok(command);
  assert.ok(command.includes("&& git commit -m 'chore(release): v2026.10.2'"));
  assert.ok(command.includes("&& git tag -a 'v2026.10.2' -m 'Release v2026.10.2'"));
  assert.ok(command.includes("&& git push 'fixture-remote' 'HEAD:refs/heads/trunk'"));
  assert.ok(command.includes("&& git push 'fixture-remote' 'refs/tags/v2026.10.2'"));
  assert.ok(out.logs.some((s) => s.includes('ls-remote')));

  git(root, 'checkout', '--detach');
  const detached = output();
  assert.equal(release(root, config, [], detached.options), 0);
  const detachedCommand = detached.logs.find((s) => s.startsWith('git add -- '));
  assert.ok(detachedCommand);
  assert.ok(detachedCommand.endsWith("git tag -a 'v2026.10.3' -m 'Release v2026.10.3'"));
  assert.ok(!detachedCommand.includes('git push'));
  assert.ok(detached.logs.some((s) => s.includes('No attached branch/upstream available')));
});

test('local inventory and actual entry scripts work from unrelated CWD and spaced paths', (t) => {
  const root = temp(t);
  for (const target of localConfig.targets) {
    if (target.private) continue;
    const source = path.join(localRoot, target.path);
    if (fs.existsSync(source)) write(root, target.path, fs.readFileSync(source));
    else if (target.generated) fs.mkdirSync(path.dirname(path.join(root, target.path)), { recursive: true });
  }
  write(root, 'VERSION', fs.readFileSync(path.join(localRoot, 'VERSION')));
  const releaseName = fs.existsSync(path.join(here, 'release.mjs')) ? 'release.mjs' : 'release.js';
  const syncName = fs.existsSync(path.join(here, 'sync-version.mjs')) ? 'sync-version.mjs' : 'sync-version.js';
  const scriptNames = ['version-control.mjs', 'version-targets.mjs', releaseName, syncName];
  for (const name of scriptNames) write(root, `scripts/${name}`, fs.readFileSync(path.join(here, name)));
  const before = fs.readFileSync(path.join(root, 'VERSION'));
  const check = spawnSync(process.execPath, [path.join(root, 'scripts', syncName), '--check'], { cwd: os.tmpdir(), encoding: 'utf8' });
  assert.equal(check.status, 0, check.stderr);
  assert.deepEqual(fs.readFileSync(path.join(root, 'VERSION')), before);
  const run = spawnSync(process.execPath, [path.join(root, 'scripts', releaseName)], { cwd: os.tmpdir(), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  checkVersion(root, localConfig);
  assert.ok(compareVersions(parseVersion(fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim()), parseVersion(before.toString().trim())) > 0);
  const allowed = new Set(['VERSION', ...localConfig.targets.filter((target) => !target.private).map((target) => target.path), ...scriptNames.map((name) => 'scripts/' + name)]);
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else assert.ok(allowed.has(path.relative(root, absolute)), `unexpected output: ${absolute}`);
    }
  }
  walk(root);
});

test('strict representation rejects malformed input and unsafe counters', () => {
  for (const v of ['1999.1.1', '10000.1.1', '2026.0.1', '2026.13.1', '2026.01.1', '2026.1.0', '2026.1.01', '2026.1.-1', '2026.1.1.0', '2026.1.1e3', 'v2026.1.1', '2026.1.1 ', ' 2026.1.1', '\uFEFF2026.1.1', '2026.1.1\n', '2026.1.9007199254740992']) assert.throws(() => parseVersion(v), undefined, v);
  assert.deepEqual(parseVersion('9999.12.9007199254740991'), [9999, 12, Number.MAX_SAFE_INTEGER]);
  assert.equal(compareVersions([2026, 9, Number.MAX_SAFE_INTEGER], [2026, 10, 1]), -1);
});

test('GMT+7 boundary, future-prefix increment, timezone independence and overflow', () => {
  assert.deepEqual(calendar(new Date('2026-10-31T16:59:59Z')), [2026, 10, 1]);
  assert.deepEqual(calendar(new Date('2026-10-31T17:00:00Z')), [2026, 11, 1]);
  for (const [old, expected] of [['2026.10.1', '2026.10.2'], ['2026.9.99', '2026.10.1'], ['2025.12.99', '2026.10.1'], ['2027.3.1', '2027.3.2']]) assert.equal(targetVersion(old, {}, {}, now), expected);
  assert.throws(() => targetVersion('2026.10.9007199254740991', {}, {}, now));
  assert.throws(() => targetVersion('9999.12.1', { selector: 'major' }, { major: 'year' }, now));
  for (const tz of ['UTC', 'Asia/Bangkok', 'America/Los_Angeles']) {
    const result = runner(here, process.execPath, ['--input-type=module', '-e', `import { calendar } from './version-control.mjs'; console.log(calendar(new Date('2026-10-31T17:00:00Z')).join('.'));`], { env: { ...process.env, TZ: tz } });
    assert.equal(result.trim(), '2026.11.1');
  }
});

test('explicit versions and historical month/year selectors enforce monotonicity and date bounds', () => {
  for (const version of ['2026.10.1', '2026.9.99', '2027.3.1']) assert.throws(() => targetVersion('2026.10.1', { version }, {}, now));
  assert.equal(targetVersion('2026.10.1', { version: '2026.10.2' }, {}, now), '2026.10.2');
  assert.equal(targetVersion('2026.9.1', { selector: 'minor' }, { minor: 'month' }, now), '2026.10.1');
  assert.throws(() => targetVersion('2026.10.1', { selector: 'minor' }, { minor: 'month' }, now));
  assert.equal(targetVersion('2025.12.1', { selector: 'major' }, { major: 'year' }, now), '2026.1.1');
});

test('CLI rejects malformed inputs and compatibility aliases warn', () => {
  for (const args of [['--version'], ['--version='], ['--version', ''], ['--version', '--tag'], ['--wat'], ['--force'], ['--build', '--build'], ['--tag', '--tag'], ['--version=2026.10.2', '-v', '2026.10.3'], ['patch', '2026.10.2'], ['--help', '--tag'], ['-h', 'patch'], ['minor'], ['wat'], ['2026.10.2', 'extra']]) assert.throws(() => parseReleaseArgs(args), undefined, args.join(' '));
  assert.equal(parseReleaseArgs(['--version=2026.10.2']).version, '2026.10.2');
  for (const args of [['v2026.10.2'], ['-v', '2026.10.2'], ['patch'], ['minor']]) assert.ok(parseReleaseArgs(args, { minor: 'auto' }).warnings.length);
});

test('missing/malformed VERSION fails unchanged; only no terminator, LF or CRLF accepted', (t) => {
  const root = fixture(t);
  for (const raw of ['2026.10.1', '2026.10.1\n', '2026.10.1\r\n']) {
    write(root, 'VERSION', raw);
    assert.equal(sync(root, config, [], output().options), 0);
    assert.equal(fs.readFileSync(path.join(root, 'VERSION'), 'utf8'), '2026.10.1\n');
  }
  for (const raw of ['2026.10.1\n\n', '2026.10.1\r', '2026.10.1\n2026.10.2', '\uFEFF2026.10.1\n', '2026.13.1\n']) {
    write(root, 'VERSION', raw);
    const before = bytes(root);
    assert.equal(release(root, config, [], output().options), 1);
    assert.equal(sync(root, config, [], output().options), 1);
    assert.deepEqual(bytes(root), before);
  }
  fs.rmSync(path.join(root, 'VERSION'));
  const before = bytes(root);
  assert.equal(release(root, config, [], output().options), 1);
  assert.equal(sync(root, config, [], output().options), 1);
  assert.deepEqual(bytes(root), before);
});

test('help requires neither source nor Git; malformed CLI/unsupported build do not mutate', (t) => {
  const empty = temp(t);
  assert.equal(release(empty, config, ['--help'], output().options), 0);
  assert.equal(sync(empty, config, ['-h'], output().options), 0);
  assert.deepEqual(fs.readdirSync(empty), []);
  const root = fixture(t);
  const before = bytes(root);
  for (const args of [['--build'], ['--version'], ['--tag', '--tag'], ['--help', '--tag'], ['--version=2027.3.1']]) assert.equal(release(root, config, args, output().options), 1);
  for (const args of [['--check', '--check'], ['--wat'], ['--check', '--help']]) assert.equal(sync(root, config, args, output().options), 1);
  assert.deepEqual(bytes(root), before);
});

test('rollback after each write and independent-check failure restores bytes/deletes new files', (t) => {
  for (const failAt of [1, 2, 3, 4, 'check']) {
    const root = fixture(t);
    write(root, 'package.json', '{\r\n\t"version": "2026.10.1"\r\n}');
    const before = bytes(root);
    const hooks = failAt === 'check' ? { verify: () => { throw new Error('independent check failure'); } } : { afterWrite: (_, count) => { if (count === failAt) throw new Error('injected write failure'); } };
    assert.throws(() => prepareVersion(root, config, '2026.10.2', hooks), /rolled back/);
    assert.deepEqual(bytes(root), before);
  }
});

test('optional targets, deduplicated anchors and generated copies share check/sync rules', (t) => {
  const root = fixture(t);
  write(root, 'doc.md', 'First: 2026.10.1\nSecond: 2026.10.1\n');
  const combined = { targets: [...config.targets,
    { path: 'doc.md', transform: (s, v) => replaceRequired(s, /First: [0-9.]+/g, `First: ${v}`) },
    { path: 'doc.md', transform: (s, v) => replaceRequired(s, /Second: [0-9.]+/g, `Second: ${v}`) },
    { path: 'optional.md', optional: true, transform: (s, v) => replaceRequired(s, /Version: [0-9.]+/, `Version: ${v}`) },
  ] };
  assert.throws(() => checkVersion(root, combined), /generated.js/);
  let writes = 0;
  const result = prepareVersion(root, combined, '2026.10.2', { afterWrite: () => writes++ });
  assert.equal(writes, 5);
  assert.deepEqual(result.skipped, ['optional.md']);
  const names = ['VERSION', 'package.json', 'package-lock.json', 'generated.js', 'doc.md'];
  const before = bytes(root, names);
  checkVersion(root, combined);
  prepareVersion(root, combined, '2026.10.2', { afterWrite: () => assert.fail('consistent sync must not write') });
  assert.deepEqual(bytes(root, names), before);
  write(root, 'optional.md', 'Missing anchor');
  assert.throws(() => checkVersion(root, combined), /anchor-missing/);
  assert.throws(() => prepareVersion(root, combined, '2026.10.3'), /anchor-missing/);
  assert.deepEqual(bytes(root, names), before);
});

test('missing manifests and malformed/unsupported JSON locks fail before mutation', (t) => {
  for (const bad of ['{', '[]', json({ version: 'old', lockfileVersion: 4 }), json({ version: 'old', lockfileVersion: 3, packages: {} })]) {
    const root = fixture(t);
    write(root, 'package-lock.json', bad);
    const before = bytes(root);
    assert.equal(release(root, config, [], output().options), 1);
    assert.deepEqual(bytes(root), before);
  }
  const root = fixture(t);
  fs.rmSync(path.join(root, 'package.json'));
  const before = bytes(root);
  assert.equal(sync(root, config, [], output().options), 1);
  assert.deepEqual(bytes(root), before);
});

test('offline npm v1/v2/v3 changes only mapped local versions and preserves dependency metadata', () => {
  for (const lockfileVersion of [1, 2, 3]) {
    const lock = { version: 'old', lockfileVersion, dependencies: { x: { version: '1.2.3', integrity: 'keep' } } };
    if (lockfileVersion !== 1) lock.packages = { '': { version: 'old' }, backend: { version: 'old', name: 'backend' }, 'node_modules/x': { version: '1.2.3', resolved: 'keep', integrity: 'keep' } };
    const expected = structuredClone(lock);
    expected.version = '2026.10.2';
    if (expected.packages) { expected.packages[''].version = '2026.10.2'; expected.packages.backend.version = '2026.10.2'; }
    assert.deepEqual(JSON.parse(npmLockVersion(json(lock), '2026.10.2', lockfileVersion === 1 ? [] : ['backend'])), expected);
  }
  assert.throws(() => npmLockVersion(json({ version: 'old', lockfileVersion: 1 }), '2026.10.2', ['backend']));
  const formatted = '{\n\t"version": "2026.10.1",\n\t"name": "fixture"\n}\n';
  assert.equal(packageVersion(formatted, '2026.10.1'), formatted);
  assert.match(packageVersion(formatted, '2026.10.2'), /\n\t"version"/);
});
