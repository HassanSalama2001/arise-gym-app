import { describe, it, expect } from 'vitest';
import { groupIntoBlocks, isLinkedToPrevious, toggleSupersetWithPrevious, normalizeGroups } from './planGroups';

const entries = (...groupIds) => groupIds.map((groupId, i) => ({ id: i + 1, order: i, groupId }));

describe('groupIntoBlocks', () => {
  it('joins consecutive entries sharing a group', () => {
    const list = entries(null, 1, 1, null, 2, 2, 2);
    expect(groupIntoBlocks(list).map(b => b.map(e => e.id))).toEqual([[1], [2, 3], [4], [5, 6, 7]]);
  });

  it('does not join entries of the same group that drifted apart', () => {
    expect(groupIntoBlocks(entries(1, null, 1)).map(b => b.length)).toEqual([1, 1, 1]);
  });
});

describe('toggleSupersetWithPrevious', () => {
  it('links two standalone exercises into a new group', () => {
    expect(toggleSupersetWithPrevious(entries(null, null), 1)).toEqual([{ id: 1, groupId: 1 }, { id: 2, groupId: 1 }]);
  });

  it('joins an existing group', () => {
    expect(toggleSupersetWithPrevious(entries(1, 1, null), 2)).toEqual([{ id: 3, groupId: 1 }]);
  });

  it('picks an unused group id', () => {
    expect(toggleSupersetWithPrevious(entries(3, 3, null, null), 3)).toEqual([{ id: 3, groupId: 4 }, { id: 4, groupId: 4 }]);
  });

  it('unlinks, clearing the group when one member would be left', () => {
    expect(toggleSupersetWithPrevious(entries(1, 1), 1)).toEqual([{ id: 2, groupId: null }, { id: 1, groupId: null }]);
  });

  it('unlinks from a group of three, leaving the pair intact', () => {
    expect(toggleSupersetWithPrevious(entries(1, 1, 1), 2)).toEqual([{ id: 3, groupId: null }]);
  });

  it('does nothing for the first exercise', () => {
    expect(toggleSupersetWithPrevious(entries(null, null), 0)).toEqual([]);
  });
});

describe('isLinkedToPrevious / normalizeGroups', () => {
  it('reports links only against the entry above', () => {
    const list = entries(1, 1, null);
    expect([0, 1, 2].map(i => isLinkedToPrevious(list, i))).toEqual([false, true, false]);
  });

  it('clears groups left with a single member after reordering', () => {
    expect(normalizeGroups(entries(1, null, 1))).toEqual([{ id: 1, groupId: null }, { id: 3, groupId: null }]);
    expect(normalizeGroups(entries(1, 1, null))).toEqual([]);
  });
});
