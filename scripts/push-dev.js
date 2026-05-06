'use strict';
/**
 * Push your current branch to origin.
 * Reminder: origin/production is updated automatically when you push **main** or **master**
 * (GitHub Actions workflow `.github/workflows/sync-production.yml`).
 */
const { execSync, spawnSync } = require('child_process');

function gitTrim(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

let branch;
try {
  branch = gitTrim('git rev-parse --abbrev-ref HEAD');
} catch {
  console.error('Git error: are you in the repo root?');
  process.exit(1);
}

const syncBranches = new Set(['main', 'master']);
const remote = process.argv[2] || 'origin';

if (!syncBranches.has(branch)) {
  console.warn(
    `\n[mempool] Branch "${branch}" — production auto-sync runs only after a push to **main** or **master**.\n` +
      `Merge PR → main/master, then run: npm run push:dev\n`
  );
}

console.log(`git push ${remote} ${branch}`);
const result = spawnSync('git', ['push', remote, branch], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);

if (syncBranches.has(branch)) {
  console.log(
    '\n[mempool] Next: GitHub → Actions → “Sync production branch” should run for this push.\n' +
      'When green, branch production matches your tree (embed flag only).\n' +
      'No second manual push to branch production needed.\n'
  );
}
