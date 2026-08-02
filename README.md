# DEL Airport Operations Control Center — Frontend Wars 2026, Round 2

## Stack
React + TypeScript + Vite + Tailwind CSS v4 + Zustand + Recharts + Papaparse + React Router. No backend — all data is loaded client-side from the CSVs in `public/data`.

## Run locally
```
npm install
npm run dev
```

## What's built
- **Data layer**: raw CSVs shipped without column headers. Headers were reverse-engineered by profiling value patterns (see `SCHEMA_NOTES.md`) and baked into clean CSVs in `public/data`. Typed interfaces for all 8 tables live in `src/types`.
- **Simulated live clock** (`src/store/useAirportStore.ts`): a virtual "now" sweeps through the dataset's real timestamp range (looping when it reaches the end), advancing every 1.5s. Alerts and the live feed are derived relative to that clock, so the app behaves like it's watching a live ops day rather than showing static rows.
- **Dashboard**: KPI cards, delay-reason breakdown, hourly departure volume, live alerts panel, live operations feed.
- **Flights**: searchable/sortable table, on-time/delayed filter, drill-down modal with full flight detail.
- **Gates, Baggage, Passengers, Security, Maintenance, Staff, Retail**: dedicated operational views, each backed by the real dataset with search + sort via the shared `DataTable` component.

## What's still open (your 12-hour list)
1. Cross-table drill-downs beyond Flights (e.g. click a flight -> see its passengers/baggage/gate events in one panel) — high value for "Data Integration" scoring.
2. More alert types (gate conflicts, staff understaffing vs scheduled flights).
3. Mobile nav / responsive pass (carried over pattern from Round 1 — same fix applies here).
4. GitHub push + deploy (Vercel/Netlify) — same two steps you did last round.
5. Read through the code before submission — same disqualification clause likely applies this round too.

## Schema assumptions
See `SCHEMA_NOTES.md` for exactly which columns were inferred vs. clearly labeled, in case a judge asks you to justify a field name.
