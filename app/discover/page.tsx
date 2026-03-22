"use client";

import { useEffect, useMemo, useState } from "react";
import type { Job, Profile } from "../../lib/types";
import { loadProfile } from "../../lib/store";

type McqQ = {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
};

type McqGame = {
  type: "mcq";
  questions: McqQ[];
};

type CaseGame = {
  type: "case";
  scenario: string;
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
  skillsTested?: string[];
};

type AnyGame = McqGame | CaseGame;

type ScoreRow = {
  ts: number;
  jobTitle: string;
  mode: "mcq" | "case";
  score: number;
  total: number;
};

const SCORE_KEY = "career_games_scores_v1";

function saveScore(row: ScoreRow) {
  const existing = JSON.parse(localStorage.getItem(SCORE_KEY) || "[]") as ScoreRow[];
  existing.unshift(row);
  localStorage.setItem(SCORE_KEY, JSON.stringify(existing.slice(0, 30)));
}

function loadScores(): ScoreRow[] {
  try {
    return JSON.parse(localStorage.getItem(SCORE_KEY) || "[]");
  } catch {
    return [];
  }
}

function pct(score: number, total: number) {
  if (!total) return 0;
  return Math.round((score / total) * 100);
}

function ConfidencePill({ percent }: { percent: number }) {
  const tier =
    percent >= 80 ? "High" : percent >= 50 ? "Medium" : "Low";
  const cls =
    percent >= 80
      ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
      : percent >= 50
      ? "bg-amber-100 text-amber-900 ring-amber-200"
      : "bg-rose-100 text-rose-800 ring-rose-200";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cls}`}>
      {tier} Confidence • {percent}%
    </span>
  );
}

export default function DiscoverPage() {
  const profile: Profile | null = useMemo(() => loadProfile(), []);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTitle, setJobTitle] = useState("Software Engineer Intern");
  const [mode, setMode] = useState<"mcq" | "case">("mcq");
  const [level, setLevel] = useState<"easy" | "medium">("easy");

  const [game, setGame] = useState<AnyGame | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // for MCQ progress
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const [history, setHistory] = useState<ScoreRow[]>([]);

  useEffect(() => {
    setHistory(loadScores());
  }, []);

  useEffect(() => {
    // load a few job titles as suggestions
    fetch("/api/jobs?limit=60")
      .then((r) => r.json())
      .then((d) => {
        const js = (d.jobs || []) as Job[];
        setJobs(js);
        if (js[0]?.title) setJobTitle(js[0].title);
      })
      .catch(() => {});
  }, []);

  function resetPlayState() {
    setIdx(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  async function generateGame() {
    setErr(null);
    setLoading(true);
    setGame(null);
    resetPlayState();

    try {
      const skills = profile?.skills ?? [];

      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          jobTitle,
          skills,
          level,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate game");

      setGame(data.game as AnyGame);
    } catch (e: any) {
      setErr(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function finishAndSave(finalScore: number, total: number) {
    setFinished(true);

    saveScore({
      ts: Date.now(),
      jobTitle,
      mode,
      score: finalScore,
      total,
    });

    setHistory(loadScores());
  }

  // --------- UI RENDER ----------
  if (!profile) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="text-slate-600">
          Please go to <b>Profile</b> and save your skills first (for personalized games).
        </p>
      </div>
    );
  }

  const profileSkills = profile.skills?.length ? profile.skills.join(", ") : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="mt-1 text-slate-600">
          🎮 Games (MCQ + Case Study) to verify confidence and make your roadmap feel “earned”.
        </p>
      </div>

      {/* Setup Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">🧩 Game Setup</h2>
            <p className="text-sm text-slate-500">
              Pick mode, difficulty, and a job title. Uses your Profile skills.
            </p>
          </div>

          <button
            onClick={generateGame}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate Game"}
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <div className="text-sm font-semibold text-slate-700">Mode</div>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="mcq">MCQ (5 Qs)</option>
              <option value="case">Case Study (1 scenario)</option>
            </select>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-700">Level</div>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <div className="text-sm font-semibold text-slate-700">Pick a job title</div>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              placeholder="e.g., Data Analyst Intern"
            />

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-medium">Suggestions:</span>
              {jobs.slice(0, 6).map((j) => (
                <button
                  key={j.id}
                  onClick={() => setJobTitle(j.title)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {j.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-600">
          Uses your Profile skills: <span className="font-semibold">{profileSkills}</span>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          <b>Error:</b> {err}
        </div>
      )}

      {/* Empty game */}
      {!game && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-700">
          Click <b>Generate Game</b> to start.
        </div>
      )}

      {/* MCQ Game */}
      {game?.type === "mcq" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">🧠 MCQ Confidence Game</h3>
            <span className="text-sm text-slate-500">
              {finished ? "Finished" : `Q ${idx + 1}/${game.questions.length}`}
            </span>
          </div>

          {finished ? (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-slate-700">
                  Score: <b>{score}</b> / {game.questions.length}
                </div>
                <ConfidencePill percent={pct(score, game.questions.length)} />
              </div>

              <button
                onClick={() => {
                  setGame(null);
                  resetPlayState();
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Play another
              </button>
            </div>
          ) : (
            (() => {
              const q = game.questions[idx];
              const total = game.questions.length;

              function next() {
                if (selected === null) return;
                const isCorrect = selected === q.answer;
                const nextScore = score + (isCorrect ? 1 : 0);

                if (idx + 1 < total) {
                  setScore(nextScore);
                  setIdx(idx + 1);
                  setSelected(null);
                } else {
                  setScore(nextScore);
                  finishAndSave(nextScore, total);
                }
              }

              return (
                <div className="mt-3">
                  <div className="text-base font-semibold">{q.question}</div>

                  <div className="mt-3 grid gap-2">
                    {q.options.map((opt, i) => {
                      const active = selected === i;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelected(i)}
                          className={[
                            "rounded-xl border px-4 py-3 text-left text-sm font-semibold transition",
                            active
                              ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                              : "border-slate-200 bg-white hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={next}
                    disabled={selected === null}
                    className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {idx + 1 === total ? "Finish" : "Next"}
                  </button>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Case Game */}
      {game?.type === "case" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">📌 Case Study Game</h3>
            <span className="text-sm text-slate-500">{finished ? "Finished" : "1 scenario"}</span>
          </div>

          {finished ? (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-slate-700">
                  Result: <b>{score}</b> / 1
                </div>
                <ConfidencePill percent={pct(score, 1)} />
              </div>

              <button
                onClick={() => {
                  setGame(null);
                  resetPlayState();
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Play another
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm whitespace-pre-wrap">
                {game.scenario}
              </div>

              <div className="mt-4 text-base font-semibold">{game.question}</div>

              <div className="mt-3 grid gap-2">
                {game.options.map((opt, i) => {
                  const active = selected === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelected(i)}
                      className={[
                        "rounded-xl border px-4 py-3 text-left text-sm font-semibold transition",
                        active
                          ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                          : "border-slate-200 bg-white hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  if (selected === null) return;
                  const isCorrect = selected === game.answer;
                  const finalScore = isCorrect ? 1 : 0;
                  setScore(finalScore);
                  finishAndSave(finalScore, 1);
                }}
                disabled={selected === null}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      )}

      {/* History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">🏆 Game History (cumulative)</h3>
          <span className="text-sm text-slate-500">Last 30 saved</span>
        </div>

        {history.length === 0 ? (
          <div className="mt-3 text-slate-600">No plays yet.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {history.slice(0, 8).map((h) => {
              const percent = pct(h.score, h.total);
              const icon = h.mode === "mcq" ? "📝" : "📚";
              return (
                <div key={h.ts} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icon}</span>
                      <div className="font-semibold">
                        {h.mode.toUpperCase()} • {h.jobTitle}
                      </div>
                    </div>
                    <ConfidencePill percent={percent} />
                  </div>

                  <div className="mt-2 text-sm text-slate-600">
                    Score <b>{h.score}</b>/{h.total} • {new Date(h.ts).toLocaleString()}
                  </div>

                  <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-slate-900"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
