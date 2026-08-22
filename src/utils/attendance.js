/**
 * Attendance Calculation Engine
 * Mathematically correct formulas per specification.
 */

/** Current attendance percentage */
export function getAttendancePct(attended, held) {
  if (held === 0) return 100;
  return (attended / held) * 100;
}

/**
 * Safe classes to miss: max x such that attended / (held + x) >= target
 * Solving: x <= attended/target - held
 * s = floor(attended / (target/100) - held), clamped >= 0
 */
export function safeBunks(attended, held, targetPct = 75) {
  if (held === 0) return 0;
  const t = targetPct / 100;
  return Math.max(0, Math.floor(attended / t - held));
}

/**
 * Classes needed to recover: if below target, min x such that (attended+x)/(held+x) >= target
 * Solving: attended + x >= t*(held + x) => x(1-t) >= t*held - attended => x >= (t*held - attended)/(1-t)
 */
export function classesToRecover(attended, held, targetPct = 75) {
  if (held === 0) return 0;
  const current = getAttendancePct(attended, held);
  if (current >= targetPct) return 0;
  const t = targetPct / 100;
  return Math.max(0, Math.ceil((t * held - attended) / (1 - t)));
}

/** Overall semester attendance from all subjects (weighted by classes held, NOT averaged) */
export function overallAttendance(subjects) {
  let totalAttended = 0, totalHeld = 0;
  subjects.forEach(s => { totalAttended += s.attended; totalHeld += s.held; });
  if (totalHeld === 0) return 100;
  return (totalAttended / totalHeld) * 100;
}

/** Attendance status: 'safe' | 'near' | 'at-risk' */
export function attendanceStatus(attended, held, targetPct = 75) {
  const pct = getAttendancePct(attended, held);
  if (pct < targetPct) return 'at-risk';
  const bunks = safeBunks(attended, held, targetPct);
  if (bunks <= 2) return 'near';
  return 'safe';
}

/** Simulate skipping N upcoming classes */
export function simulateSkip(attended, held, skips, targetPct = 75) {
  const newHeld = held + skips;
  const newPct = getAttendancePct(attended, newHeld);
  return {
    pct: newPct,
    belowTarget: newPct < targetPct,
    safeBunksRemaining: safeBunks(attended, newHeld, targetPct)
  };
}
