#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const requiredFiles = [
  'README.md',
  'CHANGELOG.md',
  'INDEX.md',
  'GOVERNANCE.md',
  'TOKENOMICS.md',
  'LEGAL.md',
  'docs/01-OVERVIEW.md',
  'docs/02-ASSET-MODEL.md',
  'docs/03-TOKENOMICS.md',
  'docs/04-GOVERNANCE.md',
  'docs/05-RWA-COLLATERAL.md',
  'docs/06-PROOF-OF-PRODUCTION.md',
  'docs/07-ORACLE-SYSTEM.md',
  'docs/08-AUDIT-POLICY.md',
  'docs/09-RISK-FRAMEWORK.md',
  'docs/10-TECHNICAL-SPECS.md'
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  requiredFiles.forEach((file) => {
    const abs = path.join(repoRoot, file);
    assert(fs.existsSync(abs), `Missing required documentation file: ${file}`);
  });

  const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  assert(readme.includes('NGF•BTC•AM — Institutional Bitcoin-Based Asset Model (2026 Edition)'), 'README title mismatch');
  assert(readme.includes('Version:** 2.0'), 'README version mismatch');
  assert(readme.includes('RUC:** 1091799299001'), 'README RUC missing');

  const index = fs.readFileSync(path.join(repoRoot, 'INDEX.md'), 'utf8');
  requiredFiles.slice(6).forEach((docPath) => {
    assert(index.includes(docPath), `INDEX reference missing for ${docPath}`);
  });

  console.log('Documentation validation passed.');
}

main();
