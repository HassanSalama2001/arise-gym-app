# ARISE

A gamified, offline-first gym tracker. You log workouts to earn XP and move up hunter ranks
(E → S → National Level). It also tracks body composition, nutrition and posture correction.
It's an installable PWA; all data lives on the device, with optional cloud backup.

## Features

- **Training**: 1,300+ exercises with animated demos, workout plans and templates, guided logging with
  target sets/reps, supersets, RPE, rest timer, plate calculator, PR detection and exercise notes.
- **Progression**: XP per set, streak multipliers, ranks, daily quests, achievements, muscle-frequency stats.
- **Body**: body weight, InBody scans (with score estimation and progress charts), measurements.
- **Nutrition**: meal and water tracking against calorie/macro targets computed from your profile.
- **Posture**: diagnostics and corrective protocols that get added to your workouts automatically.
- **Data**: works fully offline (IndexedDB via Dexie). Optional Supabase account syncs per record, so
  several devices merge rather than overwrite each other; JSON export/import from Settings.

## Tech

React 19, Vite, React Router, Framer Motion, Dexie (IndexedDB), vite-plugin-pwa, Supabase (auth + backup),
Vitest. Hosted on Firebase Hosting.

## Getting started

```bash
npm ci
cp .env.example .env   # optional: fill in Supabase keys to enable sign-in and cloud backup
npm run dev
```

Without Supabase keys the app runs in local-only mode.

### Supabase (optional)

1. Create a Supabase project.
2. Run the files in `supabase/migrations/` in order: `20260513000000_init.sql` (backups table) and
   `20260923120000_sync_records.sql` (per-record sync). Both set up row-level security.
3. Put the project URL and anon key in `.env` (see `.env.example`).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm test` | Unit and database tests (Vitest + fake-indexeddb) |
| `npm run lint` | ESLint |
| `npm run build` | Production build + service worker into `dist/` |
| `npm run dataset:fetch` | Regenerate `src/data/exercises.js` from the upstream dataset |

## Project layout

```
src/
  screens/      one file per route
  components/   shared UI (sheets, overlays, timers)
  context/      workout session + alert providers
  hooks/        shared hooks (e.g. useBackup)
  db/           Dexie schema, seeding, migrations, backup format, cloud sync
  data/         exercise dataset, correctives, templates, ranks/quests, posture content
  utils/        calorie engine, achievements, images, notifications, audio/haptics
docs/           improvement plan, migration rules
scripts/        dataset tooling
```

Before changing the database schema or the exercise dataset, read [docs/MIGRATIONS.md](docs/MIGRATIONS.md).
Migrations run once on users' phones and can't be undone.

## Deployment

Pushing to `main` builds and deploys to Firebase Hosting (`.github/workflows/`).

To install on iPhone: open the hosting URL in Safari → Share → **Add to Home Screen**. ARISE runs
fullscreen and works offline.
