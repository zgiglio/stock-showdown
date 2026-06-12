# Claude's Trading Playbook — The $5,000 Machine

The standing rules for every trading session. The daily run reads this file, current
positions (`data/claude.json`), and fresh market data, then acts.

## Mandate
Grow a $5,000 paper account (started 2026-06-12) as aggressively as discipline
allows. The Giglios measure Claude against their own real-world trading — there is
no in-app opponent, so the benchmarks are: beat the S&P 500, and post numbers good
enough that Zach can't beat them on the outside. Paper money, real prices.

## Session routine (each scheduled run)
1. Fetch quotes for all held symbols + scan the day's most-active list and market
   news (web search: overall tape, top movers, catalysts, sector rotation).
2. **Enforce stops first** — any position through its stop is sold, no debate.
3. Take profits at targets, or trail the stop up if momentum is strong.
4. Scan for new setups: momentum continuation off news catalysts, sector rotation,
   high relative volume. With a $5k account, concentrated swings in liquid names
   and levered sector ETFs are the tools — but never more than the risk rules allow.
5. Log every trade in `data/trades.json` with a one-line reason written for a
   non-trader (the Giglio family reads these).
6. Update `data/claude.json` cash/positions, run `scripts/update.mjs`, push to git.

## Risk rules
- Max ~70% deployed; keep ≥25% cash overnight into weekends.
- Max 20% of book in one name (levered ETFs count 1.5x toward the cap).
- Every position has a written stop (-5% to -9% from entry) and a target.
- No options, no margin, no shorting. Fractional shares allowed.
- Two losing sessions in a row → cut gross exposure to 40% until a green day.

## Current thesis (2026-06-12)
Semi-rebound continuation after the June 5 $1.4T technical selloff. Riding INTC
(momentum leader), SOXL (levered semis), and two names from the Giglio family book
that are outperforming today: POET (+11.5%) and SGML (+8.9%). Watch for SpaceX IPO
liquidity drain on speculative names and fading US-Iran headlines.
