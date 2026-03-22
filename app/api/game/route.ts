import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type GameReq = {
  mode: "mcq" | "case";
  jobTitle: string;
  skills?: string[];
  level?: "easy" | "medium";
};

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const body = (await req.json()) as GameReq;
    const mode = body.mode;
    const jobTitle = body.jobTitle?.trim();
    const skills = body.skills ?? [];
    const level = body.level ?? "easy";

    if (!jobTitle) {
      return NextResponse.json({ error: "Missing jobTitle" }, { status: 400 });
    }

    // We force STRICT JSON output, then parse it.
    const prompt =
      mode === "mcq"
        ? `
Generate a short "confidence verification" MCQ game for a student applying to:
JOB TITLE: "${jobTitle}"
Relevant skills (if any): ${skills.join(", ")}

Difficulty: ${level}

Return STRICT JSON only (no markdown, no extra text) in this exact schema:
{
  "type": "mcq",
  "questions": [
    {
      "question": "string",
      "options": ["A","B","C","D"],
      "answer": 0,
      "explanation": "1 sentence why"
    }
  ]
}

Rules:
- Exactly 5 questions
- Practical and role-relevant (internship level)
- answer must be 0..3
`
        : `
Generate a short case-study game for a student applying to:
JOB TITLE: "${jobTitle}"
Relevant skills (if any): ${skills.join(", ")}

Return STRICT JSON only (no markdown, no extra text) in this exact schema:
{
  "type": "case",
  "scenario": "string (5-8 lines)",
  "question": "string",
  "options": ["A","B","C","D"],
  "answer": 0,
  "explanation": "2-3 sentences why",
  "skillsTested": ["skill1","skill2","skill3"]
}

Rules:
- Internship-realistic scenario in Singapore workplace context
- answer must be 0..3
`;

    const resp = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const raw = (resp.output_text || "").trim();

    // Defensive cleanup for accidental ```json fences
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    let data: any;
    try {
      data = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON", raw: raw.slice(0, 1000) },
        { status: 500 }
      );
    }

    return NextResponse.json({ game: data });
  } catch (err: any) {
    // 429, 401 etc will show here
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: err?.status ?? 500 });
  }
}
