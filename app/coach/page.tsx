"use client";

import { useEffect, useMemo, useState } from "react";
import { loadProfile } from "../../lib/store";
import type { Job, Profile } from "../../lib/types";

type Msg = { role: "user" | "assistant"; text: string; ts: number };

export default function CoachPage() {
  const profile: Profile | null = useMemo(() => loadProfile(), []);
  const [cvText, setCvText] = useState("");
  const [jobsSample, setJobsSample] = useState<Job[]>([]);
  const [msg, setMsg] = useState("Suggest a specialization and 5 internships that fit me.");
  const [chat, setChat] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  const JOBS_LIMIT_FETCH = 80; // shown in UI
  const JOBS_LIMIT_TO_COACH = 50; // sent to AI (this is your “50”)

  useEffect(() => {
    async function loadJobs() {
      const res = await fetch(`/api/jobs?limit=${JOBS_LIMIT_FETCH}`);
      const data = await res.json();
      setJobsSample(data.jobs || []);
    }
    loadJobs();
  }, []);

  if (!profile) {
    return (
      <div style={{ maxWidth: 900, padding: 16 }}>
        <h2 style={{ margin: 0 }}>Coach</h2>
        <p style={{ opacity: 0.8 }}>
          Go to <b>Profile</b> first and save your skills/roles.
        </p>
      </div>
    );
  }

  function now() {
    return Date.now();
  }

  async function callCoach(userMessage: string) {
    // optimistic UI
    setChat((c) => [...c, { role: "user", text: userMessage, ts: now() }]);
    setLoading(true);

    try {
      // Keep payload small
      const slimJobs = jobsSample.slice(0, JOBS_LIMIT_TO_COACH).map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        url: j.url,
        requirements: { skills: j.requirements?.skills ?? [] },
        description: (j.description ?? "").slice(0, 500),
      }));

      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          cvText, // <-- includes whatever is in the CV box
          jobs: slimJobs,
          userMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Coach API failed");

      setChat((c) => [...c, { role: "assistant", text: data.text, ts: now() }]);
    } catch (e: any) {
      setChat((c) => [
        ...c,
        { role: "assistant", text: `Error: ${e.message}`, ts: now() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    const userText = msg.trim();
    if (!userText) return;
    setMsg("");
    await callCoach(userText);
  }

  async function analyzeCV() {
    if (!cvText.trim()) {
      alert("Paste your CV text first.");
      return;
    }

    await callCoach(
      [
        "Analyze my CV text.",
        "1) Extract my strongest skills/tools + evidence from my CV.",
        "2) Suggest 1-2 specialization tracks that fit me.",
        "3) Recommend 5 internships from the provided jobs that match me best (title, company, why, link if available).",
        "4) Tell me top gaps + a 2-week upskilling plan.",
      ].join("\n")
    );
  }

  const quickPrompts = [
    "Suggest a specialization and 5 internships that fit me.",
    "Based on my skills, what track should I focus on (AI / Data / SWE / Product) and why?",
    "Pick 3 best roles from these jobs and explain the match + gaps.",
    "Give me a 2-week upskilling plan to increase my match for my target roles.",
    "Bridge me: I like SWE but want more data — what roles + internship titles should I target?",
  ];

  // --- UI styles (inline, no libs) ---
  const page = {
    maxWidth: 1200,
    margin: "0 auto",
    padding: 16,
  } as const;

  const grid = {
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: 14,
    alignItems: "start",
  } as const;

  const card = {
    border: "1px solid #e8eef7",
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 1px 10px rgba(10, 20, 60, 0.04)",
  } as const;

  const cardPad = { padding: 14 } as const;

  const pill = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    fontSize: 12,
    marginRight: 6,
    marginBottom: 6,
  } as const;

  const btn = (variant: "primary" | "ghost" | "soft" = "soft") =>
    ({
      padding: "10px 12px",
      borderRadius: 12,
      border:
        variant === "primary"
          ? "1px solid #0f172a"
          : variant === "ghost"
          ? "1px solid #e5e7eb"
          : "1px solid #dbeafe",
      background:
        variant === "primary"
          ? "#0f172a"
          : variant === "ghost"
          ? "#fff"
          : "#eff6ff",
      color: variant === "primary" ? "#fff" : "#0f172a",
      cursor: "pointer",
      fontWeight: 700,
      whiteSpace: "nowrap",
    }) as const;

  const bubble = (role: "user" | "assistant") =>
    ({
      maxWidth: "80%",
      padding: "10px 12px",
      borderRadius: 14,
      border: "1px solid #e5e7eb",
      background: role === "assistant" ? "#f8fafc" : "#0f172a",
      color: role === "assistant" ? "#0f172a" : "#fff",
      whiteSpace: "pre-wrap",
      lineHeight: 1.35,
    }) as const;

  return (
    <div style={page}>
      <div style={grid}>
        {/* LEFT SIDEBAR */}
        <div>
          <div style={{ ...card, ...cardPad }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "#0f172a",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                }}
              >
                {String(profile?.name || "You").trim().slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>Coach</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  Personalized guidance based on Profile + CV + sample jobs.
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
                YOUR SAVED SKILLS
              </div>
              <div>
                {(profile.skills || []).length === 0 ? (
                  <div style={{ opacity: 0.7, fontSize: 13 }}>No skills saved.</div>
                ) : (
                  profile.skills.map((s) => (
                    <span key={s} style={pill}>
                      {s}
                    </span>
                  ))
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 10,
                    background: "#ffffff",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Jobs loaded</div>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>{jobsSample.length}</div>
                </div>

                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 10,
                    background: "#ffffff",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Jobs analyzed by AI</div>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>{Math.min(jobsSample.length, JOBS_LIMIT_TO_COACH)}</div>
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
                    (we send first {JOBS_LIMIT_TO_COACH} to keep it fast)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CV BOX */}
          <div style={{ ...card, ...cardPad, marginTop: 12 }}>
            <div style={{ fontWeight: 900 }}>Paste CV text (optional)</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              Coach uses this to anchor recommendations to your projects + experience.
            </div>

            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste resume text or key projects here… (e.g., projects, internships, skills, awards)"
              style={{
                width: "100%",
                height: 160,
                marginTop: 10,
                padding: 10,
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                outline: "none",
                fontSize: 13,
                lineHeight: 1.35,
              }}
            />

            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <button onClick={analyzeCV} disabled={loading} style={btn("primary")}>
                {loading ? "Analyzing..." : "Analyze CV"}
              </button>
              <button
                onClick={() => {
                  setCvText("");
                }}
                disabled={loading}
                style={btn("ghost")}
              >
                Clear CV
              </button>
            </div>
          </div>

          {/* QUICK PROMPTS */}
          <div style={{ ...card, ...cardPad, marginTop: 12 }}>
            <div style={{ fontWeight: 900 }}>Quick prompts</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              Click to autofill + send.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  style={{
                    ...btn("soft"),
                    textAlign: "left",
                    fontWeight: 800,
                  }}
                  disabled={loading}
                  onClick={async () => {
                    setMsg("");
                    await callCoach(p);
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT CHAT */}
        <div style={card}>
          <div
            style={{
              padding: 14,
              borderBottom: "1px solid #e8eef7",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Chat</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Tip: Ask <b>“what’s my best specialization + why”</b> for the cleanest answer.
              </div>
            </div>

            <button
              style={btn("ghost")}
              onClick={() => {
                setChat([]);
              }}
              disabled={loading}
            >
              Clear
            </button>
          </div>

          <div style={{ padding: 14, minHeight: 420 }}>
            {chat.length === 0 ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  border: "1px dashed #cbd5e1",
                  background: "#f8fafc",
                  color: "#0f172a",
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: 4 }}>No messages yet.</div>
                <div style={{ opacity: 0.8, fontSize: 13 }}>
                  Try: <b>Suggest a specialization and 5 internships that fit me.</b>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {chat.map((m, i) => (
                  <div
                    key={`${m.ts}-${i}`}
                    style={{
                      display: "flex",
                      justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={bubble(m.role)}>{m.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INPUT BAR */}
          <div
            style={{
              padding: 14,
              borderTop: "1px solid #e8eef7",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Ask: Which specialization fits me? What internships should I apply?"
              style={{
                flex: 1,
                padding: "12px 12px",
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                outline: "none",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={loading}
            />

            <button onClick={send} disabled={loading || !msg.trim()} style={btn("primary")}>
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>

          <div style={{ padding: "0 14px 14px", fontSize: 12, opacity: 0.6 }}>
            Coach uses your <b>Profile</b> + (optional) <b>CV</b> automatically. Press Enter to send.
          </div>
        </div>
      </div>
    </div>
  );
}
