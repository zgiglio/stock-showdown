#!/usr/bin/env node
// Marks both portfolios to market and regenerates data/snapshot.json,
// data/history.json, and arena.html (self-contained, shareable copy).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => JSON.parse(readFileSync(join(root, f), 'utf8'));

const zach = read('data/zach.json');
const claude = read('data/claude.json');
const trades = read('data/trades.json');

const symbols = [...new Set([...zach.positions, ...claude.positions].map(p => p.symbol))];

async function quote(sym) {
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const d = await r.json();
    const m = d.chart.result[0].meta;
    return { price: m.regularMarketPrice, prevClose: m.chartPreviousClose ?? null };
  } catch { return null; }
}

const quotes = {};
await Promise.all(symbols.map(async s => { quotes[s] = await quote(s); }));

function mark(book) {
  let value = book.cash, dayChange = 0;
  const positions = book.positions.map(p => {
    const q = quotes[p.symbol];
    const price = q?.price ?? p.baselinePrice;
    const val = price * p.shares;
    value += val;
    if (q?.prevClose) dayChange += (q.price - q.prevClose) * p.shares;
    return { ...p, price, value: +val.toFixed(2), stale: !q };
  }).sort((a, b) => b.value - a.value);
  return {
    owner: book.owner, cash: book.cash, value: +value.toFixed(2),
    dayChange: +dayChange.toFixed(2),
    retPct: +((value / book.baselineValue - 1) * 100).toFixed(3),
    baselineValue: book.baselineValue, positions,
  };
}

const snapshot = {
  asOf: new Date().toISOString(),
  startDate: zach.baselineDate,
  zach: mark(zach),
  claude: mark(claude),
};

const histFile = join(root, 'data/history.json');
const history = existsSync(histFile) ? JSON.parse(readFileSync(histFile, 'utf8')) : [];
history.push({ ts: snapshot.asOf, zach: snapshot.zach.retPct, claude: snapshot.claude.retPct });
writeFileSync(histFile, JSON.stringify(history, null, 1));
writeFileSync(join(root, 'data/snapshot.json'), JSON.stringify(snapshot, null, 1));

// Self-contained shareable copy: index.html with data inlined.
const html = readFileSync(join(root, 'index.html'), 'utf8');
const inline = `<script>window.__DATA__=${JSON.stringify({ snapshot, trades, history })}</script>`;
writeFileSync(join(root, 'arena.html'), html.replace('<!--__DATA__-->', inline));

const fails = symbols.filter(s => !quotes[s]);
console.log(`snapshot ${snapshot.asOf}`);
console.log(`  Zach   $${snapshot.zach.value.toLocaleString()} (${snapshot.zach.retPct >= 0 ? '+' : ''}${snapshot.zach.retPct}%)`);
console.log(`  Claude $${snapshot.claude.value.toLocaleString()} (${snapshot.claude.retPct >= 0 ? '+' : ''}${snapshot.claude.retPct}%)`);
if (fails.length) console.log(`  no quote (kept baseline): ${fails.join(', ')}`);
