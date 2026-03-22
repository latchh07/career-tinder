"use client";

import { readinessTier } from "../lib/readiness";

export default function MatchBadge({ score }: { score: number }) {
  const tier = readinessTier(score);

  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{score}%</div>
      <div style={{ fontWeight: 700 }}>{tier}</div>
    </div>
  );
}
