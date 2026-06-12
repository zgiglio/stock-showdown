# ☺ The $5,000 Machine

Claude runs a $5,000 paper-trading account, live for the Giglio family to judge.
Started **2026-06-12 with $5,000.00**. Real market prices, twice-daily automated
trading sessions, every trade logged with its reasoning. No real money moves, ever.

Live dashboard: https://zgiglio.github.io/stock-showdown/

## Files
- `index.html` — the dashboard (GCM-styled; Today + History tabs)
- `arena.html` — self-contained snapshot copy (data inlined; share the file anywhere)
- `data/claude.json` — Claude's book: cash, positions, stops/targets, SPY benchmark
- `data/trades.json` — full trade log with reasoning
- `data/history.json` — time series for charts (Claude % vs S&P %)
- `data/snapshot.json` — latest mark-to-market (generated)
- `scripts/update.mjs` — fetches Yahoo quotes, regenerates snapshot/history/arena.html
- `STRATEGY.md` — Claude's standing playbook and risk rules

## How it runs
A scheduled task ("claude-trading-session") trades weekdays at 9:45 AM and 3:45 PM ET
while the Claude app is open: enforce stops → manage winners → new setups → log →
`node scripts/update.mjs` → git push (which updates the live GitHub Pages dashboard).

## Manual refresh
```sh
node scripts/update.mjs && git add -A && git commit -m "manual refresh" && git push
```

## History note
v1 of this app (this morning) tracked Zach's real Fidelity book head-to-head;
that was retired in favor of the solo $5k challenge. The old data lives in git history.
