"use client";

import { useState, useEffect } from "react";
import type { Job } from "../lib/types";
import MatchBadge from "./MatchBadge";
import { rankSkillsWithAI } from "../lib/skillRanker";

interface SkillRanking {
  skill: string;
  importance: number;
}

export default function JobCard({
  job,
  score,
}: {
  job: Job;
  score: number;
}) {
  const [rankedSkills, setRankedSkills] = useState<SkillRanking[]>([]);
  const [loading, setLoading] = useState(false);

  const skills = job.requirements?.skills ?? [];

  useEffect(() => {
    async function analyzeSkills() {
      if (skills.length === 0) return;

      setLoading(true);
      try {
        const ranked = await rankSkillsWithAI(
          job.title,
          job.description || "",
          skills
        );
        setRankedSkills(ranked);
      } catch (err) {
        console.error("Failed to rank skills:", err);
        // Fallback to default
        setRankedSkills(
          skills.map((skill) => ({
            skill,
            importance: 50,
          }))
        );
      } finally {
        setLoading(false);
      }
    }

    analyzeSkills();
  }, [job.id]);

  // Helper to get percentage for a skill
  const getSkillPercentage = (skillName: string): string => {
    if (loading) return "";
    
    const ranked = rankedSkills.find(
      (r) => r.skill.toLowerCase() === skillName.toLowerCase()
    );
    
    return ranked ? ` (${ranked.importance}%)` : "";
  };

  // Format skills with percentages, sorted by importance
  const formatSkills = () => {
    if (skills.length === 0) return "—";
    
    if (loading) {
      return skills.join(", ") + " (analyzing...)";
    }

    if (rankedSkills.length === 0) {
      return skills.join(", ");
    }

    // Sort by importance (highest first) and add percentages
    return rankedSkills
      .sort((a, b) => b.importance - a.importance)
      .map((r) => `${r.skill} (${r.importance}%)`)
      .join(", ");
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 16, padding: 16 }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <div>
          <h3 style={{ margin: 0 }}>{job.title}</h3>
          <p style={{ margin: "6px 0" }}>
            {job.company} • {job.location}
          </p>
          <p style={{ margin: "6px 0", opacity: 0.8 }}>
            {job.source} • {job.postedRaw ?? "Posted recently"} •{" "}
            {job.jobTypeRaw ?? "—"}
          </p>
        </div>
        <MatchBadge score={score} />
      </div>

      <hr style={{ margin: "12px 0" }} />

      <div style={{ fontSize: 14 }}>
        <b>Transparent requirements</b>
        <div style={{ marginTop: 6 }}>
          <div>
            <b>Skills:</b> {formatSkills()}
          </div>
          <div>
            <b>Qualifications:</b>{" "}
            {(job.requirements?.qualifications ?? []).join(", ") || "—"}
          </div>
          <div>
            <b>Constraints:</b>{" "}
            {(job.requirements?.constraints ?? []).join(", ") || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}