"use client";

import { useEffect, useMemo, useState } from "react";
import type { Job, Profile } from "../../lib/types";
import { loadProfile } from "../../lib/store";
import { matchScore, missingSkills } from "../../lib/match";
import JobCard from "../../components/JobCard";
import RoadmapFlash from "../../components/RoadmapFlash";
import { filterAndRankJobs } from "../../lib/filter";
import CareerPredictionModal from "../../components/CareerPredictionModal";

interface TrackedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  status: "upskilling" | "inProgress" | "accepted" | "rejected";
  matchPercentage: number;
  missingSkills: string[];
  dateAdded: string;
  url: string;
  notes: string;
}

function Pill({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.55)",
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(6px)",
        fontSize: 12,
        fontWeight: 900,
        color: "#0f172a",
      }}
    >
      {text}
    </span>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 14,
        border: "1px solid rgba(15,23,42,0.08)",
        background: "rgba(255,255,255,0.75)",
        boxShadow: "0 14px 34px rgba(2,6,23,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function ScoreChip({ score }: { score: number }) {
  // score is 0..100
  const bg =
    score >= 75
      ? "rgba(34,197,94,0.14)"
      : score >= 55
      ? "rgba(234,179,8,0.16)"
      : "rgba(239,68,68,0.14)";

  const border =
    score >= 75
      ? "rgba(34,197,94,0.35)"
      : score >= 55
      ? "rgba(234,179,8,0.38)"
      : "rgba(239,68,68,0.35)";

  const text =
    score >= 75 ? "#065f46" : score >= 55 ? "#92400e" : "#7f1d1d";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: bg,
        fontWeight: 950,
        color: text,
        whiteSpace: "nowrap",
      }}
    >
      ✅ Match {Math.round(score)}%
    </span>
  );
}

export default function SwipePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const [minMatch, setMinMatch] = useState(35);
  const [filtered, setFiltered] = useState<Job[]>([]);

  // Prediction modal state
  const [showPrediction, setShowPrediction] = useState(false);
  const [pendingAction, setPendingAction] = useState<"save" | "apply" | null>(
    null
  );

  const profile: Profile | null = useMemo(() => loadProfile(), []);

  useEffect(() => {
    if (!profile) return;
    const deck = filterAndRankJobs(jobs, profile, minMatch);
    setFiltered(deck);
    setIdx(0);
  }, [jobs, profile, minMatch]);

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        const res = await fetch("/api/jobs?limit=300");
        const data = await res.json();
        setJobs(data.jobs || []);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  // Function to add job to tracker
  const addToTracker = (
    job: Job,
    score: number,
    missing: string[],
    status: "upskilling" | "inProgress"
  ) => {
    const trackedJob: TrackedJob = {
      id: Date.now(),
      title: job.title,
      company: job.company || "Unknown Company",
      location: job.location || "Unknown Location",
      status,
      matchPercentage: Math.round(score),
      missingSkills: missing,
      dateAdded: new Date().toISOString().split("T")[0],
      url: job.url || "",
      notes:
        status === "upskilling"
          ? "Saved for upskilling"
          : "Applied from Swipe tab",
    };

    const existingJobs = JSON.parse(
      localStorage.getItem("trackedJobs") || "[]"
    );

    const jobExists = existingJobs.some(
      (j: TrackedJob) => j.title === trackedJob.title && j.company === trackedJob.company
    );

    if (!jobExists) {
      const updatedJobs = [...existingJobs, trackedJob];
      localStorage.setItem("trackedJobs", JSON.stringify(updatedJobs));
      return true;
    }
    return false;
  };

  if (!profile) {
    return (
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
        <GlassCard>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 1000 }}>Swipe</h2>
          <p style={{ marginTop: 8, color: "#475569" }}>
            Go to <b>Profile</b> first and save your skills + roles.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
        <GlassCard>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 1000 }}>Swipe</h2>
          <p style={{ marginTop: 8, color: "#475569" }}>Loading jobs…</p>
        </GlassCard>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
        <GlassCard>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 1000 }}>Swipe</h2>
          <p style={{ marginTop: 8, color: "#475569" }}>
            No jobs loaded. Check that <code>/api/jobs</code> returns jobs.
          </p>
        </GlassCard>
      </div>
    );
  }

  const job = filtered[idx];
  const score = matchScore(job, profile);
  const missing = missingSkills(job, profile);

  function next() {
    setIdx((i) => Math.min(i + 1, filtered.length - 1));
  }

  function prev() {
    setIdx((i) => Math.max(i - 1, 0));
  }

  function handleSave() {
    setPendingAction("save");
    setShowPrediction(true);
  }

  function handleApply() {
    setPendingAction("apply");
    setShowPrediction(true);
  }

  function handlePredictionClose() {
    setShowPrediction(false);

    if (pendingAction === "save") {
      const added = addToTracker(job, score, missing, "upskilling");
      alert(added ? "Saved to Tracker under 'Upskilling'" : "This job is already in your Tracker");
    } else if (pendingAction === "apply") {
      const added = addToTracker(job, score, missing, "inProgress");
      alert(added ? "Added to Tracker under 'In Progress'" : "This job is already in your Tracker");

      if (job.url) window.open(job.url, "_blank");
      else alert("No apply link available for this job.");

      next();
    }

    setPendingAction(null);
  }

  const progressPct =
    filtered.length <= 1 ? 100 : Math.round(((idx + 1) / filtered.length) * 100);

  return (
    <div
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "18px 16px 28px",
      }}
    >
      {/* Gradient header */}
      <div
        style={{
          borderRadius: 22,
          padding: 16,
          border: "1px solid rgba(255,255,255,0.6)",
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.20), rgba(34,197,94,0.16), rgba(236,72,153,0.16))",
          boxShadow: "0 18px 45px rgba(2,6,23,0.10)",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 28, fontWeight: 1000, color: "#0f172a" }}>
              🔥 Swipe Jobs
            </div>
            <div style={{ marginTop: 6, color: "#0f172a", opacity: 0.75 }}>
              Filter by target roles + skills, then Save/Apply into Tracker.
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Pill text={`Deck: ${filtered.length} jobs`} />
              <Pill text={`Progress: ${idx + 1}/${filtered.length}`} />
              <Pill text={`Min match: ${minMatch}%`} />
              <Pill text={`Roles: ${profile.roles.length || 0}`} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ScoreChip score={score} />
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              height: 10,
              borderRadius: 999,
              background: "rgba(255,255,255,0.65)",
              border: "1px solid rgba(15,23,42,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #4f46e5, #22c55e, #ec4899)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Filtering card */}
      <GlassCard>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 1000, color: "#0f172a" }}>🎛️ Filtering</div>
            <div style={{ marginTop: 6, fontSize: 13, color: "#475569" }}>
              Target roles: <b>{profile.roles.join(", ") || "—"}</b>
            </div>
          </div>

          <div style={{ minWidth: 260, flex: 1, maxWidth: 520 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a" }}>
                Minimum match: {minMatch}%
              </div>
              <div style={{ fontSize: 13, color: "#475569" }}>
                Deck size: <b>{filtered.length}</b>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={90}
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              style={{ width: "100%", marginTop: 6 }}
            />

            <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
              Higher = fewer but stronger matches. Lower = more exploration.
            </div>
          </div>
        </div>
      </GlassCard>

      <div style={{ height: 12 }} />

      {/* Job + Roadmap */}
      <div style={{ display: "grid", gap: 12 }}>
        <GlassCard>
          <JobCard job={job} score={score} />
        </GlassCard>

        <GlassCard>
          <div style={{ fontWeight: 1000, color: "#0f172a", marginBottom: 10 }}>
            🧭 Roadmap (skills to close the gap)
          </div>
          <RoadmapFlash missing={missing} />
        </GlassCard>
      </div>

      {/* Button bar (keep all buttons) */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={prev}
            disabled={idx === 0}
            style={{
              padding: "10px 14px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.18)",
              background: "white",
              fontWeight: 950,
              cursor: idx === 0 ? "not-allowed" : "pointer",
              opacity: idx === 0 ? 0.5 : 1,
            }}
          >
            ◀ Back
          </button>

          <button
            onClick={handleSave}
            style={{
              padding: "10px 14px",
              borderRadius: 14,
              border: "1px solid rgba(34,197,94,0.30)",
              background: "rgba(34,197,94,0.10)",
              fontWeight: 950,
              cursor: "pointer",
            }}
          >
            Save
          </button>

          <button
            onClick={next}
            disabled={idx === filtered.length - 1}
            style={{
              padding: "10px 14px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.18)",
              background: "white",
              fontWeight: 950,
              cursor: idx === filtered.length - 1 ? "not-allowed" : "pointer",
              opacity: idx === filtered.length - 1 ? 0.5 : 1,
            }}
          >
            Skip ▶
          </button>

          <button
            onClick={handleApply}
            style={{
              padding: "10px 14px",
              borderRadius: 14,
              border: "1px solid rgba(99,102,241,0.30)",
              background: "linear-gradient(135deg, #111827, #4f46e5)",
              color: "white",
              fontWeight: 980,
              cursor: "pointer",
              boxShadow: "0 12px 26px rgba(79,70,229,0.22)",
            }}
          >
            Apply
          </button>
        </div>

        <div style={{ fontSize: 12, color: "#64748b" }}>
          Tip: Save = “Upskilling”, Apply = “In Progress” in Tracker.
        </div>
      </div>

      {/* Career Prediction Modal */}
      <CareerPredictionModal
        isOpen={showPrediction}
        onClose={handlePredictionClose}
        jobTitle={job.title}
        jobRequirements={job.requirements}
        userProfile={{
          ...profile,
          currentMatchScore: Math.round(score),
        }}
      />
    </div>
  );
}
