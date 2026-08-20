#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateAsset(asset) {
  assert(typeof asset === 'object' && asset !== null, 'ngf-asset.json must be an object');
  assert(asset.asset_symbol === 'NGF•BTC•AM', 'asset_symbol must be NGF•BTC•AM');
  assert(asset.supply && asset.supply.total === 5930000000, 'supply.total must be 5930000000');
  assert(asset.supply && asset.supply.decimals === 0, 'supply.decimals must be 0');
  assert(asset.governance && asset.governance.quorum === 0.66, 'governance.quorum must be 0.66');
}

function validateTokenomics(tokenomics) {
  assert(tokenomics.total_supply === 5930000000, 'tokenomics total_supply mismatch');
  const alloc = tokenomics.allocation;
  assert(alloc && typeof alloc === 'object', 'tokenomics allocation missing');
}

function validateGovernance(gov) {
  assert(gov.model === 'Hybrid DAO + Corporate S.A.S.', 'governance model mismatch');
  assert(gov.dao && gov.dao.quorum === 0.66, 'governance quorum mismatch');
}

function validateStatus(status) {
  assert(status.version === '2026-08-20', 'ecosystem status version mismatch');
  assert(status.asset_issued === true, 'ecosystem status asset_issued must be true');
}

function main() {
  const schemaPath = path.join(repoRoot, 'ngf-asset-schema.json');
  const assetPath = path.join(repoRoot, 'ngf-asset.json');

  const schema = readJson(schemaPath);
  const asset = readJson(assetPath);
  assert(schema && schema.type === 'object', 'schema file must be a JSON schema object');
  validateAsset(asset);

  validateGovernance(readJson(path.join(repoRoot, 'data', 'governance-model.json')));
  validateTokenomics(readJson(path.join(repoRoot, 'data', 'tokenomics.json')));
  validateStatus(readJson(path.join(repoRoot, 'data', 'ecosystem-status.json')));

  console.log('Schema/document data validation passed.');
}

main();
