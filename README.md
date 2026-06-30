# Preston's Trading Dashboard

A personal, multi-page trading journal & analytics web app. React + Vite, styled with Tailwind, all data stored locally in your browser, and one-click deployable to GitHub Pages.

## Features

- **PIN lock** — a hashed PIN gate on load (SHA-256, stored hashed; light protection for a personal device).
- **Light / dark mode** — toggle in the top bar; remembered across sessions.
- **Home** — today's P&L, account drawdown meters, rules-followed streak, a journal prompt card, and a red warning banner whenever a trade today broke your rules.
- **Trade Log** — manual entry with auto P&L from tick value/size, **20 grouped behavioural tags** (Setups / Execution / Mistakes), 1–5 quality score, chart screenshot upload, optional journal link, plus **CSV import** (PapaParse) with flexible column mapping. Tags are defined once in `constants.js`, so they flow automatically to the form, filter, charts, calendar, and rules logic.
- **Calendar** — a monthly P&L calendar: each day color-coded green/red by net P&L with trade count, a ⚠ on rule-broken days, and click-through to that day's trades and journal.
- **Journal** — structured **daily** (morning plan + EOD recap), **weekly** summary, and **monthly** review, all prompt-driven, with a **past-entries browser** to revisit anything you've written. Deep-linkable from the Calendar and Trade Log.
- **Analytics** (Chart.js) — equity curve, win/loss by time of day, instrument breakdown, emotion vs P&L, rules-followed vs P&L, and drawdown progression.
- **AI Insights** — sends a rich numeric summary (per-tag/per-hour/per-instrument P&L, rules-followed cohorts) to the Anthropic API (`claude-sonnet-4-6`) with a prompt tuned to cite your real numbers and name your biggest dollar leak — not generic advice.
- **Accounts** — track multiple eval/funded accounts with **built-in prop-firm presets** (Lucid, Apex, Topstep, Take Profit Trader, MyFundedFutures, Tradeify, Bulenox, TradeDay) that auto-fill each plan's rules. Drawdown is computed per type (trailing-intraday / trailing-EOD / static), with profit-target progress, daily-loss-limit and max-contract chips. Preset data lives in [propFirms.js](src/lib/propFirms.js).
- **Pre-trade Checklist** — SND zone, Fib confluence, morning session, confirmation candle, no-FOMO, risk defined. The Trade Log won't let you log a trade until every box is checked, and the checklist is snapshotted onto the trade.

## Run locally

Requires Node 18+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Deploy to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys on every push to `main` — **no local Node required**.

1. Create a GitHub repo and push this project to the `main` branch.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. The action builds and publishes; your site appears at `https://<user>.github.io/<repo>/`.

The build uses `base: './'` (relative asset paths) and **HashRouter**, so it works under any repo path and deep links never 404 — no extra configuration needed.

Manual alternative: `npm run deploy` (uses the `gh-pages` branch).

## Data & privacy

- All trades, journals, accounts, and settings live in your browser's `localStorage` — nothing is sent anywhere except the optional AI Insights call.
- **AI Insights** calls Anthropic directly from the browser (`anthropic-dangerous-direct-browser-access`). Your API key is stored in `localStorage` and sent from your device. Use a key with a strict spend cap and never run this on a shared machine. Only numeric stats and tags are sent — never screenshots or journal prose.
- Clearing browser data wipes the dashboard. Consider exporting trades periodically if that matters to you.

## Tech

React 18 · Vite · React Router (HashRouter) · Tailwind CSS · Chart.js / react-chartjs-2 · PapaParse · Anthropic API.
