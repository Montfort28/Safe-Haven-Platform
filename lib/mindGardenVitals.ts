const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getGardenVitality(lastNurtured: Date | string, now = new Date()): number {
  const lastNurturedAt = new Date(lastNurtured).getTime();
  const daysSinceNurtured = Math.max(0, (now.getTime() - lastNurturedAt) / DAY_IN_MS);
  const daysOfWithering = Math.max(0, daysSinceNurtured - 1);

  return Math.max(0, Math.min(100, Math.round(100 - daysOfWithering * 12)));
}

export function getGardenSoilMoisture(lastNurtured: Date | string, now = new Date()): number {
  const lastNurturedAt = new Date(lastNurtured).getTime();
  const daysSinceNurtured = Math.max(0, (now.getTime() - lastNurturedAt) / DAY_IN_MS);
  const dryDays = Math.max(0, daysSinceNurtured - 0.5);

  return Math.max(0, Math.min(100, Math.round(100 - dryDays * 16)));
}
