#!/usr/bin/env node
// Marks Claude's book to market and regenerates data/snapshot.json,
// data/history.json, and arena.html (self-contained, shareable copy).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => JSON.parse(readFileSync(join(root, f), 'utf8'));

const claude = read('data/claude.json');
const trades = read('data/trades.json');
const symbols = [...new Set([...claude.positions.map(p => p.symbol), claude.benchmark.symbol])];

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

const today = new Date().toISOString().slice(0, 10);
let value = claude.cash, dayChange = 0;
const positions = claude.positions.map(p => {
  const q = quotes[p.symbol];
  const price = q?.price ?? p.entryPrice;
  const val = price * p.shares;
  value += val;
  // Positions entered today count from entry price, not yesterday's close —
  // we only get credit for moves we actually held through.
  const basis = p.entryDate === today ? p.entryPrice : q?.prevClose;
  if (basis) dayChange += (price - basis) * p.shares;
  return { ...p, price, value: +val.toFixed(2), stale: !q };
}).sort((a, b) => b.value - a.value);

const spyQ = quotes[claude.benchmark.symbol];
const spyRet = spyQ ? +((spyQ.price / claude.benchmark.basePrice - 1) * 100).toFixed(3) : null;

const snapshot = {
  asOf: new Date().toISOString(),
  startDate: claude.baselineDate,
  claude: {
    cash: claude.cash, value: +value.toFixed(2),
    dayChange: +dayChange.toFixed(2),
    retPct: +((value / claude.baselineValue - 1) * 100).toFixed(3),
    baselineValue: claude.baselineValue, positions,
  },
  spy: { retPct: spyRet, price: spyQ?.price ?? null },
};

const histFile = join(root, 'data/history.json');
const history = existsSync(histFile) ? JSON.parse(readFileSync(histFile, 'utf8')) : [];
history.push({ ts: snapshot.asOf, claude: snapshot.claude.retPct, spy: spyRet, claudeVal: snapshot.claude.value });
writeFileSync(histFile, JSON.stringify(history, null, 1));
writeFileSync(join(root, 'data/snapshot.json'), JSON.stringify(snapshot, null, 1));

const html = readFileSync(join(root, 'index.html'), 'utf8');
const inline = `<script>window.__DATA__=${JSON.stringify({ snapshot, trades, history })}</script>`;
writeFileSync(join(root, 'arena.html'), html.replace('<!--__DATA__-->', inline));

const fails = symbols.filter(s => !quotes[s]);
console.log(`snapshot ${snapshot.asOf}`);
console.log(`  Claude $${snapshot.claude.value.toLocaleString()} (${snapshot.claude.retPct >= 0 ? '+' : ''}${snapshot.claude.retPct}%) | SPY ${spyRet >= 0 ? '+' : ''}${spyRet}%`);
if (fails.length) console.log(`  no quote (kept entry price): ${fails.join(', ')}`);
