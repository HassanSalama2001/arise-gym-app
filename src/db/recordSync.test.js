import { describe, it, expect, beforeEach } from 'vitest';
import db from './db';
import syncDb, { getSyncState } from './syncDb';
import { syncRecords, collectLocalChanges, applyRemoteChanges, resetSyncCursors } from './recordSync';
import { tombstonesWritten } from './syncStamp';

/**
 * Stands in for the cloud: keeps one record per (table, uid), newest wins — the same rule the
 * Supabase table enforces with its primary key and an updated_at check.
 */
function fakeCloud(initial = []) {
  const records = new Map(initial.map(r => [`${r.table}|${r.uid}`, r]));
  return {
    records,
    all: () => [...records.values()],
    async pushRecords(incoming) {
      for (const record of incoming) {
        const key = `${record.table}|${record.uid}`;
        const existing = records.get(key);
        if (!existing || existing.updatedAt <= record.updatedAt) records.set(key, record);
      }
    },
    async fetchRecords(since) {
      return [...records.values()].filter(r => r.updatedAt > since).sort((a, b) => a.updatedAt - b.updatedAt);
    },
  };
}

/** Runs `fn` as if on another device: its own sync cursors, and its own view of the same cloud. */
async function asOtherDevice(fn) {
  const saved = { pushedAt: await getSyncState('pushedAt', 0), pulledAt: await getSyncState('pulledAt', 0) };
  await resetSyncCursors();
  try {
    return await fn();
  } finally {
    await syncDb.state.put({ key: 'pushedAt', value: saved.pushedAt });
    await syncDb.state.put({ key: 'pulledAt', value: saved.pulledAt });
  }
}

beforeEach(async () => {
  await Promise.all(db.tables.map(t => t.clear()));
  await syncDb.tombstones.clear();
  await syncDb.state.clear();
  await db.exercises.bulkPut([
    { id: 25, name: 'barbell bench press', muscleGroup: 'Chest' },
    { id: 43, name: 'barbell full squat', muscleGroup: 'Legs' },
  ]);
});

describe('stamping', () => {
  it('gives every synced row a uid and updatedAt', async () => {
    const id = await db.workoutPlans.add({ name: 'Push', createdAt: 1 });
    const plan = await db.workoutPlans.get(id);
    expect(plan.uid).toMatch(/\w/);
    expect(plan.updatedAt).toBeGreaterThan(0);
  });

  it('leaves seeded exercises and device settings alone', async () => {
    await db.settings.put({ key: 'exercise_seed_version', value: '1324+24_v6' });
    expect((await db.exercises.get(25)).uid).toBeUndefined();
    expect((await db.settings.get('exercise_seed_version')).uid).toBeUndefined();
  });

  it('records a tombstone when a synced row is deleted', async () => {
    const id = await db.workoutPlans.add({ name: 'Push', createdAt: 1 });
    const { uid } = await db.workoutPlans.get(id);
    await db.workoutPlans.delete(id);
    await tombstonesWritten();
    expect(await syncDb.tombstones.where('uid').equals(uid).count()).toBe(1);
  });
});

describe('collectLocalChanges', () => {
  it('sends rows with references as uids, and leaves seeded exercise ids alone', async () => {
    const planId = await db.workoutPlans.add({ name: 'Push', createdAt: 1 });
    await db.planExercises.add({ planId, exerciseId: 25, order: 0 });
    const custom = await db.exercises.add({ id: 100001, name: 'My Thing', isCustom: true });
    await db.planExercises.add({ planId, exerciseId: custom, order: 1 });

    const changes = await collectLocalChanges(0);
    const plan = changes.find(c => c.table === 'workoutPlans');
    const [seededLink, customLink] = changes.filter(c => c.table === 'planExercises');

    expect(seededLink.data.planId).toBe('uid:' + plan.uid);
    expect(seededLink.data.exerciseId).toBe(25); // built-in: same id on every device
    expect(String(customLink.data.exerciseId)).toMatch(/^uid:/);
    expect(plan.data.id).toBeUndefined(); // local keys never travel
  });

  it('only collects what changed since the cursor', async () => {
    await db.workoutPlans.add({ name: 'Old', createdAt: 1 });
    const cursor = Date.now();
    await new Promise(r => setTimeout(r, 5));
    await db.workoutPlans.add({ name: 'New', createdAt: 2 });

    const changes = await collectLocalChanges(cursor);
    expect(changes.map(c => c.data.name)).toEqual(['New']);
  });
});

describe('two devices', () => {
  it('carries a workout to the other device, keeping its references', async () => {
    const cloud = fakeCloud();
    const planId = await db.workoutPlans.add({ name: 'Push', createdAt: 1 });
    const sessionId = await db.sessions.add({ planId, name: 'Push', startTime: 1000, endTime: 2000 });
    await db.sets.add({ sessionId, exerciseId: 25, setNumber: 1, weight: 80, reps: 5, completed: 1 });
    await syncRecords(cloud);

    // second device: same cloud, empty database
    await Promise.all([db.workoutPlans.clear(), db.sessions.clear(), db.sets.clear()]);
    const result = await asOtherDevice(() => syncRecords(cloud));
    expect(result.added).toBe(3);

    const plan = await db.workoutPlans.toCollection().first();
    const session = await db.sessions.toCollection().first();
    const set = await db.sets.toCollection().first();
    expect(session.planId).toBe(plan.id);   // re-pointed at this device's key
    expect(set.sessionId).toBe(session.id);
    expect(set.exerciseId).toBe(25);
  });

  it('keeps the newer edit when both devices change the same row', async () => {
    const cloud = fakeCloud();
    const id = await db.workoutPlans.add({ name: 'Push', createdAt: 1 });
    const { uid } = await db.workoutPlans.get(id);
    await syncRecords(cloud);

    // the other device renamed it later
    await cloud.pushRecords([{
      table: 'workoutPlans', uid, updatedAt: Date.now() + 5000, deleted: false,
      data: { uid, name: 'Push A', createdAt: 1 },
    }]);
    await syncRecords(cloud);
    expect((await db.workoutPlans.get(id)).name).toBe('Push A');

    // a local edit now is newer, so it survives the next sync
    await db.workoutPlans.update(id, { name: 'Push B', updatedAt: Date.now() + 9000 });
    await syncRecords(cloud);
    expect((await db.workoutPlans.get(id)).name).toBe('Push B');
    expect(cloud.records.get(`workoutPlans|${uid}`).data.name).toBe('Push B');
  });

  it('propagates a deletion instead of resurrecting the row', async () => {
    const cloud = fakeCloud();
    const id = await db.workoutPlans.add({ name: 'Push', createdAt: 1 });
    const { uid } = await db.workoutPlans.get(id);
    await syncRecords(cloud);

    await db.workoutPlans.delete(id);
    await tombstonesWritten();
    await syncRecords(cloud);

    // The other device still holds that row (same uid, last touched before the delete)
    // and should drop it when it pulls.
    await asOtherDevice(async () => {
      await db.workoutPlans.put({ name: 'Push', createdAt: 1, uid, updatedAt: 1 });
      expect(await db.workoutPlans.where('uid').equals(uid).count()).toBe(1);
      await syncRecords(cloud);
    });
    expect(await db.workoutPlans.where('uid').equals(uid).count()).toBe(0);
  });

  it('keeps a row that was edited after the delete elsewhere', async () => {
    const cloud = fakeCloud();
    const id = await db.workoutPlans.add({ name: 'Push', createdAt: 1 });
    const { uid } = await db.workoutPlans.get(id);
    await syncRecords(cloud);
    await db.workoutPlans.delete(id);
    await tombstonesWritten();
    await syncRecords(cloud);

    await asOtherDevice(async () => {
      // edited later than the deletion, so the edit wins
      await db.workoutPlans.put({ name: 'Push renamed', createdAt: 1, uid, updatedAt: Date.now() + 5000 });
      await syncRecords(cloud);
    });
    expect((await db.workoutPlans.where('uid').equals(uid).first())?.name).toBe('Push renamed');
  });

  it('does not send the same change twice', async () => {
    const cloud = fakeCloud();
    await db.workoutPlans.add({ name: 'Push', createdAt: 1 });
    const first = await syncRecords(cloud);
    const second = await syncRecords(cloud);
    expect(first.pushed).toBe(1);
    expect(second.pushed).toBe(0);
  });

  it('applying remote records does not queue them for re-upload', async () => {
    const cloud = fakeCloud();
    await applyRemoteChanges([{
      table: 'workoutPlans', uid: 'remote-1', updatedAt: 1000, deleted: false,
      data: { uid: 'remote-1', name: 'From other device', createdAt: 1 },
    }]);
    const plan = await db.workoutPlans.where('uid').equals('remote-1').first();
    expect(plan).toMatchObject({ name: 'From other device', updatedAt: 1000 });

    const changes = await collectLocalChanges(2000);
    expect(changes).toEqual([]);
    expect(cloud.all()).toEqual([]);
  });

  it('holds back a row whose parent has not arrived, then applies it', async () => {
    const summary = await applyRemoteChanges([
      { table: 'sets', uid: 's1', updatedAt: 10, deleted: false, data: { uid: 's1', sessionId: 'uid:missing', exerciseId: 25, reps: 5, weight: 60, completed: 1 } },
    ]);
    expect(summary.skipped).toBe(1);
    expect(await db.sets.count()).toBe(0);

    const second = await applyRemoteChanges([
      { table: 'sessions', uid: 'missing', updatedAt: 9, deleted: false, data: { uid: 'missing', name: 'Push', startTime: 1 } },
      { table: 'sets', uid: 's1', updatedAt: 10, deleted: false, data: { uid: 's1', sessionId: 'uid:missing', exerciseId: 25, reps: 5, weight: 60, completed: 1 } },
    ]);
    expect(second.added).toBe(2);
    const session = await db.sessions.where('uid').equals('missing').first();
    expect((await db.sets.toCollection().first()).sessionId).toBe(session.id);
  });
});
