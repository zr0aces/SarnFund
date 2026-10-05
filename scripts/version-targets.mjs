import { packageVersion, npmLockVersion } from './version-control.mjs';

export default {
  targets: ['backend', 'frontend'].flatMap((directory) => [
    { path: `${directory}/package.json`, transform: packageVersion },
    { path: `${directory}/package-lock.json`, transform: npmLockVersion },
  ]),
  build: [{ command: 'docker', args: ['compose', 'build'] }],
};
