#!/usr/bin/env node
// Privacy scan: fails (exit code 1) if anything that could identify you, or any secret,
// is found in the source, the built site, or the git history.
//
// Usage:
//   npm run check:privacy                 (uses ./privacy-denylist.txt if it exists)
//   node scripts/privacy-scan.mjs --denylist /path/to/list.txt
//
// privacy-denylist.txt is in .gitignore. Put one term per line: your real name,
// phone number, personal email, street, username on other sites, etc.
// It never gets committed, so the list itself can't leak.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const denyIdx = args.indexOf('--denylist');
const denylistPath = denyIdx >= 0 ? args[denyIdx + 1] : join(root, 'privacy-denylist.txt');

const SKIP_DIRS = new Set(['node_modules', '.git', '.astro', '.vscode', '.idea']);
const SKIP_FILES = new Set(['package-lock.json', 'privacy-denylist.txt', 'privacy-denylist.example.txt']);
const TEXT_EXT = new Set([
  '.astro', '.ts', '.mjs', '.js', '.json', '.md', '.css', '.html', '.svg', '.yml', '.yaml', '.txt', '.xml', '',
]);

// Files you have reviewed by hand and approved for publication (for example a
// PII-stripped resume). Add the path deliberately, e.g. 'public/approved-resume.pdf'.
const APPROVED_FILES = [];

// Known-safe values that look like secrets or contacts.
const ALLOW = [
  '275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f', // EICAR test file SHA-256 (public, harmless)
];

const checks = [
  { name: 'email address', re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, allow: (m) => /@(users\.noreply\.github\.com|corp\.example|example\.(com|net|org))$/i.test(m) },
  { name: 'phone number', re: /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g },
  { name: 'possible API key or token (long hex)', re: /\b[a-f0-9]{40,}\b/gi },
  { name: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g },
  { name: 'AWS access key', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: 'private key', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { name: 'Windows user path with a real-looking name', re: /C:\\\\?Users\\\\?(?!Public|acct\.|it\.|hr\.|sales\.|eng\.|mkt\.|new\.)[A-Za-z][\w.-]+/g },
];

const problems = [];
const report = (file, what, detail) => problems.push({ file, what, detail });

function loadDenylist() {
  if (!existsSync(denylistPath)) return [];
  return readFileSync(denylistPath, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) yield* walk(path);
    else yield path;
  }
}

function scanText(file, text, deny) {
  for (const { name, re, allow } of checks) {
    for (const m of text.matchAll(re)) {
      const v = m[0];
      if (ALLOW.includes(v.toLowerCase())) continue;
      if (allow && allow(v)) continue;
      report(file, name, v);
    }
  }
  const lower = text.toLowerCase();
  for (const term of deny) {
    if (lower.includes(term.toLowerCase())) report(file, 'term from your private denylist', '(hidden)');
  }
}

function scanBinary(file, buf) {
  const ext = extname(file).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') {
    if (buf.includes(Buffer.from('Exif'))) report(file, 'image metadata (EXIF)', 'strip it before publishing');
  }
  if (ext === '.png') {
    for (const chunk of ['eXIf', 'tEXt', 'iTXt', 'zTXt']) {
      if (buf.includes(Buffer.from(chunk))) report(file, `image metadata (${chunk} chunk)`, 'strip it before publishing');
    }
  }
  if (ext === '.pdf') {
    report(file, 'PDF file', 'PDFs carry author metadata and personal details; review manually and allow it on purpose');
  }
}

function scanGitHistory(deny) {
  let log = '';
  try {
    log = execSync('git log --all --format=%an%x09%ae%x09%cn%x09%ce', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  } catch {
    return 'skipped (not a git repository or no commits yet)';
  }
  const identities = new Set(log.split('\n').filter(Boolean));
  for (const id of identities) {
    const [an, ae, cn, ce] = id.split('\t');
    for (const email of new Set([ae, ce])) {
      if (!/@users\.noreply\.github\.com$/i.test(email) && email !== 'noreply@github.com') {
        report('git history', 'commit email is not a GitHub noreply address', email);
      }
    }
    const lower = `${an} ${cn} ${ae} ${ce}`.toLowerCase();
    for (const term of deny) if (lower.includes(term.toLowerCase())) report('git history', 'denylisted term in commit identity', '(hidden)');
  }
  // Also search every version of every file ever committed.
  for (const term of deny) {
    try {
      const hits = execSync(`git log --all -i -S ${JSON.stringify(term)} --format=%h`, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim();
      if (hits) report('git history', 'denylisted term appears in an old commit', `commits: ${hits.split('\n').join(', ')}`);
    } catch {
      /* ignore */
    }
  }
  return `checked ${identities.size} commit identit${identities.size === 1 ? 'y' : 'ies'}`;
}

const deny = loadDenylist();
let files = 0;
for (const file of walk(root)) {
  const rel = relative(root, file);
  if (SKIP_FILES.has(rel) || rel.startsWith('scripts/privacy-scan')) continue;
  if (APPROVED_FILES.includes(rel) || APPROVED_FILES.some((f) => rel === `dist/${f.replace(/^public\//, '')}`)) continue;
  files += 1;
  const base = rel.split('/').pop();
  if (base === '.env' || base.startsWith('.env.')) report(rel, 'environment file', 'never commit .env files');
  const ext = extname(file).toLowerCase();
  const buf = readFileSync(file);
  if (TEXT_EXT.has(ext) && !buf.includes(0)) scanText(rel, buf.toString('utf8'), deny);
  else scanBinary(rel, buf);
}
const gitNote = scanGitHistory(deny);

console.log(`Privacy scan: ${files} files, git history ${gitNote}.`);
console.log(
  deny.length
    ? `Denylist: ${deny.length} private term(s) checked.`
    : 'Denylist: none found. Create privacy-denylist.txt (see privacy-denylist.example.txt) for a full check.',
);

if (problems.length) {
  console.error(`\n${problems.length} problem(s) found:`);
  for (const p of problems) console.error(`  ${p.file}: ${p.what}: ${p.detail}`);
  process.exit(1);
}
console.log('No problems found.');
