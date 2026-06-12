# 🥊 Stock Showdown — Giglio vs. The Machine

Paper-trading arena: Zach's real Fidelity portfolio vs. Claude's sandbox book.
Both sides started at **$128,398.48 on 2026-06-12**. Winner = highest % return.
No real money moves, ever — this is a scoreboard, not a broker.

## Files
- `index.html` — the dashboard (serve the folder, or open via preview)
- `arena.html` — self-contained snapshot copy (data inlined; share this file anywhere)
- `data/zach.json` — Zach's real holdings (update when he trades)
- `data/claude.json` — Claude's paper book (cash, positions, stops, targets)
- `data/trades.json` — Claude's trade log with reasoning
- `data/history.json` — % return time series for the race chart
- `data/snapshot.json` — latest mark-to-market (generated)
- `scripts/update.mjs` — fetches Yahoo quotes, regenerates snapshot/history/arena.html
- `STRATEGY.md` — Claude's standing trading playbook

## Update marks
```sh
node scripts/update.mjs
```

## Run locally
```sh
python3 -m http.server 8743 --directory stock-showdown   # then open http://localhost:8743
```

## When Zach trades
Easiest: in Fidelity (web or app), Positions → download/export CSV. Drop it in
`~/Downloads` — the next scheduled session imports it automatically, or run:
```sh
node scripts/import-fidelity.mjs && node scripts/update.mjs
```
Or just tell Claude what you traded. Baseline prices stay frozen at the
2026-06-12 snapshot so % return stays honest (new buys baseline at import price).
Assumes no deposits/withdrawals — external cash flows would skew the % race.
