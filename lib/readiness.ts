
export type ReadinessTier = "Apply Now" | "Apply + Prep" | "Upskill First";

export function readinessTier(score: number): ReadinessTier {
  if (score >= 70) return "Apply Now";
  if (score >= 45) return "Apply + Prep";
  return "Upskill First";
}
