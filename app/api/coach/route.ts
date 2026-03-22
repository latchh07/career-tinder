import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type CoachReq = {
  profile: { year: string; skills: string[]; roles: string[] };
  cvText?: string;
  // send a small sample of jobs so model can recommend actual postings
  jobs?: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    url?: string;
    requirements?: { skills?: string[] };
    description?: string;
  }>;
  userMessage: string;
};

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const body = (await req.json()) as CoachReq;

    const system = `
You are "Career Coach SG" for Singapore internships/jobs.
Goal: Suggest a clear specialization direction + internships + bridging steps.
Rules:
- Use ONLY the provided profile, CV text, and job list.
- Output in this structure:

1) Suggested specialization (1 primary + 1 backup)
2) Why (based on profile/CV)
3) Top 5 matching internships/jobs (use title+company+location; include url if present)
4) Skill gaps (max 6)
5) 2-week action plan (very concrete tasks)
6) Optional: 3 similar roles to explore (bridge roles)

Be realistic for a Y1/Y2 student.
`;

    const user = `
PROFILE:
Year: ${body.profile?.year}
Skills: ${(body.profile?.skills ?? []).join(", ")}
Target roles: ${(body.profile?.roles ?? []).join(", ")}

CV TEXT (may be empty):
${body.cvText ?? ""}

JOB OPTIONS (sample):
${JSON.stringify(body.jobs ?? [], null, 2)}

USER QUESTION:
${body.userMessage}
`;

    const resp = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    // Extract text output safely
    const text =
      resp.output_text ??
      (resp.output?.map((o: any) => o?.content?.map((c: any) => c?.text).join("")).join("\n") ?? "");

    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
