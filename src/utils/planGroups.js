// Plan exercises can be linked into supersets. Linked entries share a `groupId` and must stay
// next to each other in the plan's order; the workout then starts them as one block.

/** Consecutive entries sharing a groupId become one block; everything else is its own block. */
export function groupIntoBlocks(entries) {
  const blocks = [];
  for (const entry of entries) {
    const previous = blocks.at(-1);
    if (entry.groupId && previous?.[0].groupId === entry.groupId) previous.push(entry);
    else blocks.push([entry]);
  }
  return blocks;
}

/** True when this entry is in a superset with the one before it. */
export function isLinkedToPrevious(entries, index) {
  const entry = entries[index];
  const previous = entries[index - 1];
  return !!(entry?.groupId && previous && previous.groupId === entry.groupId);
}

function nextGroupId(entries) {
  const used = entries.map(e => Number(e.groupId)).filter(Number.isFinite);
  return (used.length ? Math.max(...used) : 0) + 1;
}

/**
 * Links entry `index` with the one before it, or unlinks it if already linked.
 * Returns the changes to save as [{ id, groupId }] (groupId null clears it).
 */
export function toggleSupersetWithPrevious(entries, index) {
  const entry = entries[index];
  const previous = entries[index - 1];
  if (!entry || !previous) return [];

  if (isLinkedToPrevious(entries, index)) {
    const changes = [{ id: entry.id, groupId: null }];
    // A group of one is not a superset: clear the other member too.
    const remaining = entries.filter((e, i) => i !== index && e.groupId === entry.groupId);
    if (remaining.length === 1) changes.push({ id: remaining[0].id, groupId: null });
    return changes;
  }

  if (previous.groupId) return [{ id: entry.id, groupId: previous.groupId }];
  const groupId = nextGroupId(entries);
  return [{ id: previous.id, groupId }, { id: entry.id, groupId }];
}

/** After a reorder, drop groupIds that no longer sit next to their group. */
export function normalizeGroups(entries) {
  const changes = [];
  for (const block of groupIntoBlocks(entries)) {
    if (block.length === 1 && block[0].groupId) changes.push({ id: block[0].id, groupId: null });
  }
  return changes;
}
