import type { Job, Profile } from "./types";

function norm(s: string) {
  return s.toLowerCase().trim();
}

/**
 * Match score = % of job required skills that the user has.
 * If no extracted skills, fallback 60 (so UI still works).
 */
export function matchScore(job: Job, profile: Profile): number {
  const userSkills = new Set(profile.skills.map(norm));
  const reqSkills = (job.requirements?.skills ?? []).map(norm);

  if (reqSkills.length === 0) return 60;

  const hit = reqSkills.filter((s) => userSkills.has(s)).length;
  return Math.max(0, Math.min(100, Math.round((hit / reqSkills.length) * 100)));
}

export function missingSkills(job: Job, profile: Profile): string[] {
  const userSkills = new Set(profile.skills.map(norm));
  return (job.requirements?.skills ?? []).filter((s) => !userSkills.has(norm(s)));
}
