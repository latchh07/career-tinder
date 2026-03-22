"use client";

export default function RoadmapFlash({
  missing,
}: {
  missing: string[];
}) {
  if (!missing || missing.length === 0) {
    return (
      <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
        ✅ You meet all extracted skills for this job.
      </div>
    );
  }

  return (
    <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
      <b>Roadmap Flash</b>
      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 14, opacity: 0.8 }}>Top missing skills:</div>
        <div style={{ marginTop: 6 }}>
          {missing.slice(0, 8).map((s) => (
            <span
              key={s}
              style={{
                display: "inline-block",
                padding: "4px 8px",
                border: "1px solid #ddd",
                borderRadius: 999,
                marginRight: 6,
                marginBottom: 6,
                fontSize: 13,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
        Suggestion: take 1 mini-course or do 1 quiz per missing skill → re-check confidence.
      </div>
    </div>
  );
}
