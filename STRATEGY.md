# Claude's Trading Playbook

The standing rules for every trading session. The daily run reads this file, current
positions (`data/claude.json`), and fresh market data, then acts.

## Mandate
Beat Zach's real Fidelity portfolio on **% return from the 2026-06-12 baseline**
($128,398.48 both sides). Paper money, real prices, no excuses.

## Session routine (each scheduled run)
1. Fetch quotes for all held symbols + the day's most-active list (web search:
   market news, top movers, "top four" most-active megacaps).
2. **Enforce stops first** — any position through its stop is sold, no debate.
3. Take profits at targets, or trail the stop up if momentum is strong.
4. Scan for new setups: momentum continuation off news catalysts, sector rotation,
   high relative volume. Prefer liquid large caps and liquid ETFs.
5. Log every trade in `data/trades.json` with a one-line reason.
6. Update `data/claude.json` cash/positions, run `scripts/update.mjs`, commit nothing —
   files are the source of truth.

## Risk rules
- Max ~70% deployed; keep ≥25% cash overnight into weekends.
- Max 20% of book in one name; max 50% in one sector.
- Every position has a written stop (-4% to -8% from entry) and a target.
- No options, no margin, no shorting via inverse ETFs above 10% of book.
- Two losing sessions in a row → cut gross exposure to 40% until a green day.

## Current thesis (2026-06-12)
Semi-rebound continuation after the June 5 $1.4T technical selloff (Broadcom guide
miss was the trigger; AI demand intact). Rotation out of megacap software into
semis/cyclicals/financials. SpaceX IPO (largest ever) prints today — watch for
liquidity drain on speculative space names (avoid RKLB/ASTS/LUNR) and an
underwriter fee halo on JPM/GS.
