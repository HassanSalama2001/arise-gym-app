# Database migrations and the exercise dataset

ARISE keeps everything in IndexedDB (Dexie, `src/db/db.js`). A migration runs once on each user's
phone, with no undo and usually no backup. Treat every migration as irreversible.

## Rules

1. **Never clear user tables.** Workouts, sets, plans, PRs, notes, meals, scans, quests and
   achievements belong to the user. If data needs to change shape, transform it in place.
2. **Changing the exercise dataset means remapping IDs, not wiping history.** Build an old ID → new ID
   map (match by GIF file or name, then check by hand), then use `remapExerciseIds(tx, mapId)` from
   `src/db/remap.js`, which rewrites every table that references exercises.
3. **Anything that can't be mapped becomes a custom exercise with its old name.** Losing the name loses
   the history's meaning. See `legacyResolver()`.
4. **Inside a Dexie `upgrade()`, await only Dexie calls.** Awaiting anything else (a dynamic
   `import()`, `fetch`, a timer) lets IndexedDB auto-commit the transaction halfway through.
5. **Add a test that opens an old-schema database and upgrades it** (see `src/db/migration.test.js`
   and `src/test/legacySchema.js`).
6. **When the seeded data changes, bump `EXERCISE_SEED_VERSION`** in `src/db/seed.js`. The
   referential-integrity tests fail if templates or corrective protocols point at missing exercises.

## Exercise ID ranges

| Range | Contents |
|---|---|
| `< 10001` | Unified exercise dataset (sparse, currently up to 5201) |
| `10001 – 19999` | Seeded corrective/mobility exercises (`src/data/correctiveExercises.js`) |
| `20000 – 99999` | Exercises recreated from the pre-2026-07 dataset: old ID + 20000 |
| `>= 100000` | Exercises the user creates (`nextCustomExerciseId`) |

## Tables that reference exercises

`sets`, `planExercises`, `personalRecords`, `exerciseNotes` (`exerciseId`), and
`customPosturalIssues` (`correctiveProtocol[].exerciseId`). If you add another,
add it to `EXERCISE_REF_TABLES` / `forEachExerciseRef` in `src/db/remap.js`.

## Backups

`src/db/backup.js` owns the backup format. Every Dexie table must be listed in `USER_TABLES` or
`EXCLUDED_TABLES`; `backup.test.js` fails otherwise. Bump `BACKUP_SCHEMA_VERSION` when the format
changes in a way older app versions can't read, and keep `parseBackup()` able to read every older
format.

## History

| Version | Change |
|---|---|
| v11 | Moves pre-2026-07 databases onto the unified dataset. Originally deleted all workout history. Since 2026-09 it remaps IDs through `LEGACY_ID_MAP` instead. Data already deleted on devices that upgraded before then can't be recovered from the device; an old backup restores correctly. |
| v12 | Moves custom exercises from right after the dataset into the `>= 100000` range. |
