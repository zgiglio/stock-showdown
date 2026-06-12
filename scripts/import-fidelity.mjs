#!/usr/bin/env node
// Syncs data/zach.json from a Fidelity "Positions" CSV export.
// Usage: node scripts/import-fidelity.mjs [path-to-csv]
// With no arg, picks the newest Portfolio_Positions_*.csv in ~/Downloads and
// skips silently if it was already imported (tracked in data/.fidelity-import).
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const stamp = join(root, 'data/.fidelity-import');

let file = process.argv[2];
if (!file) {
  const dl = join(homedir(), 'Downloads');
  const candidates = readdirSync(dl)
    .filter(f => /^Portfolio_Positions.*\.csv$/i.test(f))
    .map(f => ({ f: join(dl, f), m: statSync(join(dl, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  if (!candidates.length) { console.log('no Fidelity positions CSV in ~/Downloads — nothing to import'); process.exit(0); }
  file = candidates[0].f;
  const last = existsSync(stamp) ? readFileSync(stamp, 'utf8').trim() : '';
  if (last === `${file}:${candidates[0].m}`) { console.log('newest CSV already imported — nothing to do'); process.exit(0); }
}

const text = readFileSync(file, 'utf8');
// Tolerant CSV row parser (handles quoted fields with commas).
const parseRow = line => {
  const out = []; let cur = '', q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === ',' && !q) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur); return out.map(s => s.trim());
};

const lines = text.split(/\r?\n/).filter(l => l.trim());
const headerIdx = lines.findIndex(l => /symbol/i.test(l) && /quantity/i.test(l));
if (headerIdx < 0) { console.error('could not find a header row with Symbol+Quantity columns'); process.exit(1); }
const header = parseRow(lines[headerIdx]).map(h => h.toLowerCase());
const col = name => header.findIndex(h => h.includes(name));
const iSym = col('symbol'), iQty = col('quantity'), iVal = col('current value');

const zachFile = join(root, 'data/zach.json');
const zach = JSON.parse(readFileSync(zachFile, 'utf8'));
const oldBaselines = Object.fromEntries(zach.positions.map(p => [p.symbol, p]));

const num = s => parseFloat(String(s).replace(/[$,"]/g, '')) || 0;
let cash = 0; const positions = [];
for (const line of lines.slice(headerIdx + 1)) {
  const row = parseRow(line);
  const sym = (row[iSym] || '').replace(/\*+$/, '').trim().toUpperCase();
  if (!sym || /pending|account|total|^the |^date /i.test(sym)) continue;
  const qty = num(row[iQty]), val = iVal >= 0 ? num(row[iVal]) : 0;
  if (sym === 'SPAXX' || /money market|fdrxx|core/i.test(sym)) { cash += val; continue; }
  if (!qty) continue;
  const old = oldBaselines[sym];
  positions.push({
    symbol: sym, shares: qty,
    // Frozen baseline for original holdings; new buys baseline at import value.
    baselinePrice: old ? old.baselinePrice : +(val / qty).toFixed(4),
    ...(old?.note ? { note: old.note } : {}),
  });
}

if (!positions.length) { console.error('parsed zero positions — CSV format not recognized, zach.json untouched'); process.exit(1); }

zach.positions = positions;
if (cash > 0) zach.cash = +cash.toFixed(2);
zach.lastImport = { file: file.split('/').pop(), at: new Date().toISOString() };
writeFileSync(zachFile, JSON.stringify(zach, null, 2));
if (!process.argv[2]) writeFileSync(stamp, `${file}:${statSync(file).mtimeMs}`);
console.log(`imported ${positions.length} positions, cash $${zach.cash.toLocaleString()} from ${file.split('/').pop()}`);
console.log('now run: node scripts/update.mjs');
