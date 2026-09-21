# ARISE Improvement Plan

Living tracker. Every task has an ID, a status, and a "done when" check. Update the status and the
log at the bottom whenever a task changes state.

**Status legend:** ✅ Done · 🟡 In progress · ⬜ Not started · ⏸ Deferred / needs decision

**Working rules**
- Work happens on branch `claude/app-repo-comparison-5181df`, one commit per task (or small group).
- Never push or merge to `main` without the owner's go-ahead — a push to `main` deploys to production.
- Migrations must never clear user tables (see P3).
- Each phase ends with `npm run lint`, `npm test`, `npm run build` all green.

## Baseline (2026-09-22)

| Check | Result |
|---|---|
| `npm run build` | passes; precache 2.66 MB; `db` chunk 1.22 MB (whole exercise dataset bundled with the DB module) |
| `npm run lint` | **85 problems (74 errors, 11 warnings)** — 47 unused vars, 12 `purity`, 11 `exhaustive-deps`, 8 `set-state-in-effect`, 2 `no-undef`, 1 `no-dupe-keys`, 1 `immutability`, 1 `no-empty`, 2 `only-export-components` |
| Tests | none; no test runner installed |

---

## P0 — Crash & dataset-migration fallout (confirmed bugs, highest priority)

The move to the unified dataset (commit `17bac7d`) changed exercise IDs and muscle-group names, but
several parts of the app still use the old values.

| ID | Status | Task | Done when |
|---|---|---|---|
| P0.1 | 🟡 | **Crash when adding an exercise mid-workout.** `LogWorkoutScreen.jsx:1122/1136` calls `setBlocks`/`setSets`, which are undefined (context exposes `updateBlocks`/`updateSets`). Also move `setCurrentExIdx` out of the state updater. | Adding an exercise and a superset exercise during a workout works; lint `no-undef` = 0 — **Fixed in code (`bfd92fb`); waiting on an in-app click test** |
| P0.2 | ✅ | **Muscle-group taxonomy mismatch.** Dataset uses `chest`, `back`, `upper legs`, `lower legs`, `upper arms`, `lower arms`, `shoulders`, `waist`, `cardio`, `neck`; the app filters/counts on `Chest`, `Back`, `Legs`, `Arms`, `Core`… so muscle filters return nothing, weekly Muscle Frequency is always 0, and leg/back/arm quest and achievement counters never increase. Add one `normalizeMuscleGroup()` map applied at seed time (keep raw value as `bodyPart`), bump seed version. | Every muscle filter chip shows exercises; Muscle Frequency and quest counters increase in a test session — **Verified in app: Legs filter shows 286 exercises** |
| P0.3 | ✅ | **Templates point to wrong exercises.** `templates.json` uses old numeric IDs (e.g. "PPL – Push" id 1 now = "3/4 sit-up"); 14 of 25 template names don't match the dataset exactly. Remap all to new IDs by name with a manual mapping for the 14. | Cloning each template yields the named exercises — **Verified: cloning PPL – Push gives bench / incline DB / DB shoulder press / lateral raise / rope pushdown** |
| P0.4 | ✅ | **Corrective protocols inject nothing.** `posturalIssues.js` references IDs 10001–100xx that don't exist in the dataset (and `Face Pull` id 32 now points elsewhere), so the protocol is silently skipped. Add a small seeded corrective-exercise set (reserved ID range, `muscleGroup: 'Corrective'`, `isCorrective: true`) and fix the references. | Starting a workout with an active postural issue injects its corrective exercises — **24 corrective exercises seeded (10001–10024); 10 stale refs remapped; verified Rounded Shoulders resolves** |
| P0.5 | ✅ | **Referential-integrity test** for all static references (templates, corrective protocols) against the dataset, so a future dataset swap fails CI instead of production. | Test fails if any referenced ID is missing — **`src/data/referentialIntegrity.test.js`** |
| P0.6 | ✅ | **Remaining real lint bugs:** duplicate `border` key (`LogWorkoutScreen.jsx:1060`), `setTimeToMidnight` used before declaration (`HomeScreen.jsx:132`), empty catch (`RestTimerOverlay.jsx:23`). | Those rules report 0 |
| P0.7 | ✅ | **Every exercise shows "Beginner".** The dataset has no `difficulty` field, so the UI falls back to the default. Derive difficulty from equipment/category at seed time, or hide the badge. | Library shows a mix of difficulties, or no misleading badge — **815a603 — skills advanced, free weights intermediate, machines/bodyweight beginner** |
| P0.8 | ✅ | **Plate calculator was unreachable.** Its button was removed from the weight input (e2493c8), leaving the sheet with no way to open it. Add a PLATES button in the set actions bar for barbell/smith exercises; show a per-side remainder standard plates can't make. | PLATES opens the calculator with the next set's weight — **4692a0f** |
| P0.9 | ✅ | **"Today" is UTC in several places** (`toISOString().split('T')[0]` for Progress's selected date, session grouping, charts, activity detection). At UTC+3, between midnight and 3 am the app still thinks it's yesterday. Use one local-date helper everywhere. | Sessions logged after local midnight land on the right day — **All toISOString dates replaced; also fixed activity detection (queried a sessions.date field that's never written → always sedentary). One-time effect: a streak whose last session was logged 00:00–03:00 local may reset once** |

## P1 — Test & CI safety net

| ID | Status | Task | Done when |
|---|---|---|---|
| P1.1 | ✅ | Add Vitest + `fake-indexeddb`; `npm test` script. | `npm test` runs — **Vitest + fake-indexeddb; `npm test`** |
| P1.2 | ✅ | Unit tests for pure logic: `calorieEngine`, `progression` (ranks/XP), `achievements`, set XP/PR logic (after P4.2 extracts it). | Tests green — **calorieEngine, progression, achievements (25 tests). Found: InBody score could exceed 100 — capped. XP/PR finish logic gets tests with P4.2** |
| P1.3 | ✅ | Clear the remaining lint errors (unused vars, hook deps, purity, set-state-in-effect) — real fixes, not blanket disables. | `npm run lint` exits 0 — **85 → 0. Real bugs fixed along the way: Mission Complete reshuffling quote/particles on re-render, navigate() during render, GIF-load race, plate calculator (P0.8)** |
| P1.4 | ✅ | CI: add a PR/branch workflow running `npm ci` → lint → test → build. Deploy workflow uses `npm ci`, runs the same gates before deploying. | Failing lint/test blocks deploy — **ci.yml for PRs/branches; deploy runs npm ci → lint → test → build first** |
| P1.5 | 🟡 | Replace the unpinned `w9jds/firebase-action@master` + deprecated `FIREBASE_TOKEN` with `FirebaseExtended/action-hosting-deploy` (pinned) + service account. **Needs owner:** add a `FIREBASE_SERVICE_ACCOUNT` repo secret. I'll prepare the workflow; it switches over once the secret exists. | Deploy works with the service-account secret — **Secret added by owner 2026-09-22; confirmed on the first deploy from main** |
| P1.6 | 🟡 | The deploy build never received `VITE_SUPABASE_*` (`.env` is gitignored), so the deployed app ran in local-only mode unless built locally. Pass them from repo secrets. **Needs owner:** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` secrets. | Deployed app can sign in — **Secrets added by owner 2026-09-22; confirmed on the first deploy from main** |

## P2 — Backup / restore integrity

| ID | Status | Task | Done when |
|---|---|---|---|
| P2.1 | ✅ | Single `USER_TABLES` registry in the DB layer; export/import built from it. Adds the missing `meals`, `hydration`, `exerciseNotes`, `customPosturalIssues`, and custom exercises (`isCustom`). Excludes caches (`exerciseImageCache`) and built-in exercises. | Every user-data table is covered, and a test fails if a new table is added without being classified — **src/db/backup.js; test fails if a Dexie table is unclassified. mealSuggestions classified as cache** |
| P2.2 | ✅ | Versioned backup format: `format: 'arise-backup'`, `schemaVersion`, `exportedAt`; validate before touching the DB; reject newer versions. | Malformed/foreign JSON is rejected with a clear message — **format + schemaVersion; validated before confirm and before any write** |
| P2.3 | ✅ | **Restore = replace, not merge.** Clear user tables and custom exercises, then write the backup inside one transaction (keeps IDs so references stay valid; deleted items don't come back). | Restore onto a device with different data gives exactly the backup's contents — **Verified in a real browser: extra rows removed, custom + built-in exercises and device settings kept** |
| P2.4 | ✅ | **Login auto-restore guard.** `LoginScreen` calls `restoreFromCloud()` on sign-in; once restore replaces data, this would wipe local data. Ask the user when both local data and a cloud backup exist (keep local / use cloud). | Signing in never silently discards local data — **Code + unit-tested helpers; not exercised against live Supabase (no credentials in this environment)** |
| P2.5 | ✅ | Remove the three copies of backup/export/import (Settings, Profile, and Profile's own 8-table export) → one `useBackup` hook + one UI section. | One implementation; Profile and Settings both use it — **src/hooks/useBackup.js; −241 lines across Profile/Settings** |
| P2.6 | ✅ | Legacy backup remap: backups made before `17bac7d` reference old exercise IDs. Build an old-ID → name map from git history and remap by name on import. | Restoring a pre-migration backup shows the right exercises — **Old IDs detected via exercise_seed_version (371_v2) or export date; 120 exercises mapped, 251 recreated as named custom exercises (IDs 20000+)** |
| P2.7 | ✅ | InBody photos are stored as full-size base64 data URLs (inflates IndexedDB and the cloud JSONB). Downscale/compress to JPEG (~1024px) on upload. | New photo < ~200 KB — **Capped at 1600px so printouts stay legible; 4000×3000 test image → 189 KB** |
| P2.8 | ✅ | Round-trip tests: seed → export → wipe → import → deep-equal. | Test green — **src/db/backup.test.js (19 tests)** |

## P3 — Migration policy

| ID | Status | Task | Done when |
|---|---|---|---|
| P3.1 | ✅ | Document the rule in `docs/`: migrations never clear user tables; dataset changes remap IDs. | Doc exists — **docs/MIGRATIONS.md** |
| P3.2 | ✅ | `remapExerciseIds(map)` helper that rewrites `sets`, `planExercises`, `personalRecords`, `exerciseNotes` in one transaction, for future dataset changes. | Unit-tested — **src/db/remap.js. Also used to rewrite the v11 migration so it remaps instead of wiping; tested by upgrading a real v7 database** |
| P3.4 | ✅ | Custom exercises take the next auto-increment ID after the dataset (currently 10025+ once correctives are seeded), so a future dataset that grows into that range would overwrite them. Give custom exercises their own ID space (e.g. string `custom_<uuid>` or a high reserved range) and migrate existing ones via P3.2. | Custom IDs can never collide with seeded ones — **Custom IDs ≥ 100000; v12 upgrade + backup import relocate existing ones** |
| P3.3 | ✅ | Load the 1.2 MB exercise dataset only when seeding/migrating (dynamic import) instead of on every app start through `db.js`. | `db` chunk is small; dataset lives in its own lazily loaded chunk — **db chunk 1.22 MB → 241 KB; dataset (994 KB) loads only when seeding** |

Note: data already wiped by migration v11 can't be recovered from the device. P2.6 makes old cloud or
JSON backups usable again.

## P4 — Code structure

| ID | Status | Task | Done when |
|---|---|---|---|
| P4.1 | ⬜ | Split `LogWorkoutScreen.jsx` (1,399 lines): move `SetRow`, `LogSetupScreen`, `AddExerciseSheet`, `ExerciseJumpSheet`, `PlateCalculatorSheet`, `RPESelectionSheet` to `components/log/`. | Screen file < 600 lines, behaviour unchanged |
| P4.2 | ✅ | Move workout-finish logic (XP, streak multiplier, PR detection, quest progress, corrective progress) into `utils/workoutRules.js` as pure functions. Removes the duplicated muscle-counting blocks (lines ~542 and ~716). | Unit-tested; the screen calls it — **src/utils/workoutRules.js (+ tests). Found and fixed: 2 of 10 quest types could never complete; per-session quests summed across the day** |
| P4.3 | ✅ | Better PRs: keep the heaviest-weight PR and also track an estimated-1RM PR, so a lighter set with more reps can count. | PR toast fires on e1RM improvement — **e1RM or heaviest weight. Found and fixed: each PR added a new row and sets were compared to the oldest → repeated PRs/XP. v13 merges duplicates** |
| P4.4 | ⬜ | Trim `ProgressScreen`, `ProfileScreen`, `SettingsScreen` (870–1,000 lines each) by extracting sections as they're touched (P2.5 removes a lot). | Each < 600 lines |
| P4.5 | ⬜ | Inline `style={{…}}` → CSS classes, only in files already being changed (no big-bang restyle). | Opportunistic |
| P4.6 | ✅ | Tidy `package.json`: name `arise-temp` → `arise`, version. | — — **Renamed to arise** |

## P5 — Repo hygiene

| ID | Status | Task | Done when |
|---|---|---|---|
| P5.1 | ✅ | Untrack `.firebase/`, `temp_dataset.json`, `assets_backup/` (`git rm --cached`) and add them to `.gitignore`. | Not tracked — **Files kept on disk; .firebase/ added to .gitignore** |
| P5.2 | ✅ | Move `fetch_new_dataset.cjs`, `map_exercises.cjs`, `update_urls.cjs` to `scripts/`; delete the unused `src/data/exercises.json` (the app imports `exercises.js`). | Root is clean — **scripts/fetch-exercise-dataset.cjs (npm run dataset:fetch); obsolete scripts and exercises.json removed** |
| P5.3 | ✅ | Real README (what ARISE is, features, setup, Supabase migration, env vars, deploy) + `.env.example`. | — |

## P6 — Offline exercise visuals

| ID | Status | Task | Done when |
|---|---|---|---|
| P6.1 | ⬜ | Settings → "Download exercise visuals" (all, or just exercises in my plans) with progress, cancel, and a storage estimate; request `navigator.storage.persist()`. | Airplane mode shows GIFs for downloaded exercises |
| P6.2 | ⬜ | Workbox runtime cache (`CacheFirst`) for `cdn.jsdelivr.net` GIFs as a fallback. | Cached after first view even outside the Dexie cache |

## P7 — Features

| ID | Status | Task | Done when |
|---|---|---|---|
| P7.1 | ⬜ | Screen wake lock during an active workout (Settings toggle, re-acquire on visibility change). | Screen stays on while logging |
| P7.2 | ⬜ | Progression engine: per plan-exercise scheme (none / linear / double progression), rep range + increment, uses last session + RPE to suggest next weight/reps and pre-fill; deload after N failed sessions. | Suggestions appear and pre-fill; unit-tested |
| P7.3 | ⬜ | Supersets in plans. Logging already supports superset blocks; add `groupId` on `planExercises`, a link/unlink UI in plan details, and rest after the group rather than after each exercise. | A plan's superset starts as one block |
| P7.4 | ⬜ | Unilateral (per-side reps) and timed sets (`duration`) on exercises/sets; UI and volume maths adjusted. | Logged, displayed, counted correctly |
| P7.5 | ⬜ | Import from Hevy / Strong CSV: parse, match exercise names (exact → normalised → manual pick step), preview, then import as sessions. | Sample exports import |
| P7.6 | ⬜ | Progress: GitHub-style activity heatmap + muscle-group volume (week / month / all-time). Depends on P0.2. | Visible on Progress |

## P8 — Sync v2 (deferred)

| ID | Status | Task | Done when |
|---|---|---|---|
| P8.1 | ⏸ | Per-record sync (`updatedAt` + tombstones, stable UUID keys) instead of one whole-DB blob. Large change (key migration for every table). **Decision needed** once P2 lands and the blob size is known. | — |

---

## Execution order

P0 → P1.1–P1.2 → P2 → P3 → P1.3–P1.4 → P5 → P4 → P6 → P7.1 → P7.6 → P7.3 → P7.4 → P7.2 → P7.5.
Data-loss and crash fixes come first; features are built on top of the tested, restructured code.

## Log

| Date | Change |
|---|---|
| 2026-09-22 | Plan created from code review; baseline recorded. |
| 2026-09-22 | P0.1–P0.6 and P1.1 implemented. Found and added P0.7 (difficulty) and P3.4 (custom ID collisions). |
| 2026-09-22 | P0.7 and all of P2 done. Lint 85 → 79. Tests 30/30. |
| 2026-09-22 | P3 done. v11 no longer wipes history on devices that haven't upgraded yet. Tests 40/40, lint 78. |
| 2026-09-22 | P1.3–P1.4, P5 and P4.6 done; P1.5/P1.6 need repo secrets. Found P0.8 (fixed) and P0.9 (UTC dates, open). Lint 0, tests 40/40. |
| 2026-09-22 | P0.9 fixed (local dates). Owner added all three repo secrets. Tests 44/44, lint 0. |
| 2026-09-22 | P1.2 done; PR #1 opened (https://github.com/HassanSalama2001/arise-gym-app/pull/1). Tests 69/69. |
| 2026-09-22 | P4.2/P4.3 done with three game-logic bug fixes. DB now v13. Tests 92/92. |
