// Suggests the next working weight and reps for an exercise from its recent history.
// Schemes are configured per plan exercise; "none" just repeats what you did last time.

export const PROGRESSION_TYPES = {
  none: { label: 'None', description: 'Repeat your last session' },
  linear: { label: 'Linear', description: 'Add weight whenever you hit the target reps' },
  double: { label: 'Double', description: 'Add reps to the top of the range, then weight' },
};

export const DEFAULT_PROGRESSION = {
  type: 'none',
  increment: 2.5,      // kg (or lbs) added on a successful session
  targetReps: 8,       // linear: reps that must be hit on every working set
  minReps: 8,          // double: bottom of the rep range
  maxReps: 12,         // double: top of the rep range
  failuresBeforeDeload: 2,
  deloadPercent: 10,
};

const round = (value, step) => Math.max(step, Math.round(value / step) * step);

/**
 * Condenses one past session of an exercise into its top working set:
 * { weight, reps, sets } where reps is the lowest rep count achieved at that weight.
 */
export function topWorkingSet(sets) {
  const working = (sets || []).filter(s => s.completed && s.type !== 'warmup' && (s.weight || 0) > 0);
  if (!working.length) return null;
  const weight = Math.max(...working.map(s => s.weight));
  const atWeight = working.filter(s => s.weight === weight);
  return {
    weight,
    reps: Math.min(...atWeight.map(s => s.reps || 0)),
    sets: atWeight.length,
  };
}

/**
 * Next target for an exercise.
 * `history` is the exercise's past sessions, most recent first, each an array of set rows.
 * Returns { weight, reps, reason, deload } or null when there's nothing to go on.
 */
export function suggestNextSet(history, progression = DEFAULT_PROGRESSION) {
  const settings = { ...DEFAULT_PROGRESSION, ...progression };
  const sessions = (history || []).map(topWorkingSet).filter(Boolean);
  const last = sessions[0];
  if (!last) return null;

  if (settings.type === 'linear') {
    if (last.reps >= settings.targetReps) {
      return {
        weight: last.weight + settings.increment,
        reps: settings.targetReps,
        reason: `Hit ${settings.targetReps} reps at ${last.weight} — add ${settings.increment}`,
      };
    }
    // Count consecutive recent sessions that missed the target.
    let misses = 0;
    for (const session of sessions) {
      if (session.reps >= settings.targetReps) break;
      misses++;
    }
    if (misses >= settings.failuresBeforeDeload) {
      return {
        weight: round(last.weight * (1 - settings.deloadPercent / 100), settings.increment),
        reps: settings.targetReps,
        deload: true,
        reason: `Missed ${settings.targetReps} reps ${misses} sessions running — deload ${settings.deloadPercent}%`,
      };
    }
    return {
      weight: last.weight,
      reps: settings.targetReps,
      reason: `Repeat ${last.weight} until you hit ${settings.targetReps} reps`,
    };
  }

  if (settings.type === 'double') {
    if (last.reps >= settings.maxReps) {
      return {
        weight: last.weight + settings.increment,
        reps: settings.minReps,
        reason: `Topped ${settings.maxReps} reps — add ${settings.increment} and drop to ${settings.minReps}`,
      };
    }
    const reps = Math.min(Math.max(last.reps + 1, settings.minReps), settings.maxReps);
    return {
      weight: last.weight,
      reps,
      reason: `Aim for ${reps} reps at ${last.weight} (range ${settings.minReps}-${settings.maxReps})`,
    };
  }

  return { weight: last.weight, reps: last.reps, reason: `Last time: ${last.weight} x ${last.reps}` };
}
