"use client";

import { useEffect, useMemo, useState } from "react";
import { saveProfile, loadProfile } from "../../lib/store";

function splitCSV(raw: string) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function Chip({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.55)",
        background: "rgba(255,255,255,0.45)",
        fontSize: 13,
        fontWeight: 800,
        color: "#0f172a",
        backdropFilter: "blur(6px)",
      }}
    >
      {text}
    </span>
  );
}

function Section({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 16,
        border: "1px solid rgba(15,23,42,0.08)",
        background: "rgba(255,255,255,0.7)",
        boxShadow: "0 12px 30px rgba(2,6,23,0.06)",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>
          {icon ? `${icon} ` : ""}{title}
        </div>
        {subtitle ? (
          <div style={{ fontSize: 13, color: "#475569" }}>{subtitle}</div>
        ) : null}
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "12px 12px",
        borderRadius: 14,
        border: "1px solid rgba(15,23,42,0.12)",
        background: "white",
        outline: "none",
        boxShadow: "0 8px 18px rgba(2,6,23,0.04)",
      }}
    />
  );
}

export default function ProfilePage() {
  const [year, setYear] = useState<"Y1" | "Y2">("Y1");
  const [skillsRaw, setSkillsRaw] = useState("");
  const [rolesRaw, setRolesRaw] = useState("");
  const [certsRaw, setCertsRaw] = useState("");

  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (p) {
      setYear(p.year);
      setSkillsRaw((p.skills || []).join(", "));
      setRolesRaw((p.roles || []).join(", "));
      setCertsRaw((p.certifications || []).join(", "));
    }
  }, []);

  const skills = useMemo(() => splitCSV(skillsRaw), [skillsRaw]);
  const roles = useMemo(() => splitCSV(rolesRaw), [rolesRaw]);
  const certs = useMemo(() => splitCSV(certsRaw), [certsRaw]);

  function onSave() {
    saveProfile({
      year,
      skills,
      roles,
      certifications: certs,
    });

    setSavedBanner(true);
    window.setTimeout(() => setSavedBanner(false), 1800);
  }

  return (
    <div
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "24px 16px 40px",
      }}
    >
      {/* Colorful header */}
      <div
        style={{
          borderRadius: 22,
          padding: 18,
          border: "1px solid rgba(255,255,255,0.55)",
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(34,197,94,0.18), rgba(236,72,153,0.18))",
          boxShadow: "0 18px 45px rgba(2,6,23,0.10)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 30, fontWeight: 1000, color: "#0f172a", letterSpacing: -0.4 }}>
              ✨ Profile Setup
            </div>
            <div style={{ marginTop: 6, color: "#0f172a", opacity: 0.75, maxWidth: 720 }}>
              Fill this once. We’ll use it for matching (Swipe), confidence games (Discover), and recommendations (Coach).
            </div>

            {/* Quick chips */}
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Chip text={`Year: ${year}`} />
              <Chip text={`Skills: ${skills.length}`} />
              <Chip text={`Roles: ${roles.length}`} />
              <Chip text={`Certs: ${certs.length}`} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => {
                setSkillsRaw("");
                setRolesRaw("");
                setCertsRaw("");
              }}
              style={{
                height: 44,
                padding: "0 14px",
                borderRadius: 14,
                border: "1px solid rgba(15,23,42,0.18)",
                background: "rgba(255,255,255,0.65)",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Clear
            </button>

            <button
              onClick={onSave}
              style={{
                height: 44,
                padding: "0 16px",
                borderRadius: 14,
                border: "1px solid rgba(15,23,42,0.25)",
                background: "linear-gradient(135deg, #111827, #4f46e5)",
                color: "white",
                fontWeight: 950,
                cursor: "pointer",
                boxShadow: "0 12px 26px rgba(79,70,229,0.25)",
              }}
            >
              Save Profile
            </button>
          </div>
        </div>

        {savedBanner && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(34,197,94,0.35)",
              background: "rgba(34,197,94,0.10)",
              color: "#065f46",
              fontWeight: 900,
            }}
          >
            ✅ Saved! You can go to Swipe / Discover / Coach now.
          </div>
        )}
      </div>

      {/* Main sections */}
      <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
        <Section title="Year" subtitle="Used to calibrate expectations + roadmaps" icon="🎓">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value as "Y1" | "Y2")}
            style={{
              width: 220,
              padding: "12px 12px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "white",
              fontWeight: 900,
              outline: "none",
            }}
          >
            <option value="Y1">Year 1 (Y1)</option>
            <option value="Y2">Year 2 (Y2)</option>
          </select>
        </Section>

        <Section title="Skills" subtitle="Comma-separated. Example: python, sql, react" icon="🧩">
          <Input
            value={skillsRaw}
            onChange={setSkillsRaw}
            placeholder="Python, SQL, React, Excel"
          />
          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {skills.length ? skills.slice(0, 18).map((s) => <Chip key={s} text={s} />) : (
              <span style={{ color: "#64748b" }}>Tip: add 5–10 skills for better matching.</span>
            )}
          </div>
        </Section>

        <Section title="Target roles" subtitle="Used for filtering + match scoring" icon="🎯">
          <Input
            value={rolesRaw}
            onChange={setRolesRaw}
            placeholder="Data Analyst Intern, Software Engineer Intern"
          />
          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {roles.length ? roles.slice(0, 12).map((r) => <Chip key={r} text={r} />) : (
              <span style={{ color: "#64748b" }}>Tip: 2–4 roles is perfect.</span>
            )}
          </div>
        </Section>

        <Section title="Certifications" subtitle="Optional. Helps Coach recommend next steps" icon="🏅">
          <Input
            value={certsRaw}
            onChange={setCertsRaw}
            placeholder="AWS CCP, Google Data Analytics"
          />
          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {certs.length ? certs.slice(0, 12).map((c) => <Chip key={c} text={c} />) : (
              <span style={{ color: "#64748b" }}>Optional — leave blank if none.</span>
            )}
          </div>
        </Section>

        {/* Bottom action bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 2,
          }}
        >
          <div style={{ color: "#64748b", fontSize: 13 }}>
            Next: go to <b>Swipe</b> to match jobs → <b>Discover</b> to play MCQ/Case games → <b>Coach</b> for AI advice.
          </div>

          <button
            onClick={onSave}
            style={{
              height: 44,
              padding: "0 16px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.25)",
              background: "linear-gradient(135deg, #ec4899, #6366f1)",
              color: "white",
              fontWeight: 950,
              cursor: "pointer",
              boxShadow: "0 12px 26px rgba(99,102,241,0.22)",
            }}
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
