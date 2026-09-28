#!/usr/bin/env node
/**
 * Mass migration script: replace @zenith → @misan and ZenithCommand → MisanCommand
 * across all TypeScript files in apps/bot/src and packages/
 */

const fs = require('fs');
const path = require('path');

const replacements = [
  ['@zenith/types', '@misan/types'],
  ['@zenith/database', '@misan/database'],
  ['@zenith/logger', '@misan/logger'],
  ['@zenith/config', '@misan/config'],
  ['@zenith/utils', '@misan/utils'],
  ['@zenith/permissions', '@misan/permissions'],
  ['@zenith/premium', '@misan/premium'],
  ['@zenith/security', '@misan/security'],
  ['ZenithCommand', 'MisanCommand'],
  ['ZenithClient', 'MisanClient'],
  ['../client/ZenithClient', '../client/MisanClient'],
  ['./client/ZenithClient', './client/MisanClient'],
  ["'zenithbot.app'", "'misanbot.app'"],
  ['"zenithbot.app"', '"misanbot.app"'],
  ['Zenith online', 'Misan online'],
  ['ZENITH-', 'MISAN-'],
];

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.includes('.next') && !entry.name.includes('dist')) {
      files.push(...walkDir(full));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.json'))) {
      files.push(full);
    }
  }
  return files;
}

const ROOT = path.resolve(__dirname, '..');
const dirs = [
  path.join(ROOT, 'apps', 'bot', 'src'),
  path.join(ROOT, 'packages'),
];

let totalChanged = 0;
let filesChanged = 0;

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = walkDir(dir);
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    for (const [from, to] of replacements) {
      content = content.split(from).join(to);
    }
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      filesChanged++;
      console.log(`✅ Updated: ${path.relative(ROOT, file)}`);
    }
  }
}

console.log(`\n🎉 Done! Updated ${filesChanged} files.`);
