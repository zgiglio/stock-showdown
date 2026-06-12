# Running the trader on an always-on machine (Mac mini)

The app's entire state lives in this repo, so any Mac with the Claude Code app
can host the trading sessions. One machine at a time — disable the scheduled
task elsewhere to avoid duplicate trades.

## One-time setup (Claude does this when given docs/SETUP-MINI.md)

1. **Tooling**: ensure `node` (v20+), `git`, and `gh` are installed
   (`brew install node gh` as needed).
2. **GitHub auth**: `gh auth login --hostname github.com --git-protocol https --web`
   — the human enters the one-time code at github.com/login/device (account: zgiglio).
   Then `gh auth setup-git`.
3. **Clone**: `git clone https://github.com/zgiglio/stock-showdown.git ~/stock-showdown`
4. **Smoke test**: `cd ~/stock-showdown && node scripts/update.mjs` — should print
   a snapshot line. Do NOT commit/push the smoke test (`git checkout -- .`).
5. **Create the scheduled task**: read `docs/TRADING-SESSION-PROMPT.md`, replace
   PROJECT_PATH with the clone path, and create a scheduled task named
   `claude-trading-session` with cron `45 9-15 * * 1-5` (local time must be ET;
   if the machine is in another timezone, shift the hours accordingly).
6. **Run it once manually** ("Run now") so the human can pre-approve the tools
   the task needs (Bash, web search, file edits) — future runs then never stall
   on permission prompts.
7. **Keep it alive**: add the Claude Code app to System Settings → Login Items
   so it relaunches after reboots. Scheduled tasks only fire while the app is open.

## Hand-off checklist (human)
- Tell the old machine's Claude the mini is live, so it disables its copy of
  `claude-trading-session`. Two active copies = duplicate trades and git races.
