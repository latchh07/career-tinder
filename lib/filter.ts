import type { Job, Profile } from "./types";
import { matchScore } from "./match";

function norm(s: string) {
  return (s ?? "").toLowerCase().trim();
}

function containsAny(text: string, keywords: string[]) {
  const t = norm(text);
  return keywords.some((k) => k && t.includes(norm(k)));
}

/**
 * Returns a filtered + ranked list for Swipe:
 * - Filter by target roles (title/desc contains role keyword)
 * - Filter by minimum match%
 * - Sort by highest match% first
 */
export function filterAndRankJobs(
  jobs: Job[],
  profile: Profile,
  minMatch: number
): Job[] {
  const roles = (profile.roles ?? []).map(norm).filter(Boolean);
  const skills = (profile.skills ?? []).map(norm).filter(Boolean);

  // Safety: if user didn't enter roles, don't hard-filter by roles.
  const roleFiltered = roles.length === 0
    ? jobs
    : jobs.filter((j) =>
        containsAny(j.title ?? "", roles) || containsAny(j.description ?? "", roles)
      );

  // Compute match score once
  const scored = roleFiltered.map((j) => ({
    job: j,
    score: matchScore(j, { ...profile, skills }),
  }));

  // Filter by minMatch (default 30–40)
  const matchFiltered = scored.filter((x) => x.score >= minMatch);

  // Sort best matches first
  matchFiltered.sort((a, b) => b.score - a.score);

  return matchFiltered.map((x) => x.job);
}
