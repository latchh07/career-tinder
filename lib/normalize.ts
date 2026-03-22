import type { Job } from "./types";

function clean(v: any): string {
  return (v ?? "").toString().trim();
}

function normalizeKeys(row: any): any {
  const out: any = {};
  for (const [k, v] of Object.entries(row || {})) {
    const nk = k
      .toString()
      .trim()
      .toLowerCase()
      .replace(/^\uFEFF/, "")
      .replace(/\s+/g, "_")
      .replace(/[^\w]/g, ""); // remove weird punctuation
    out[nk] = v;
  }
  return out;
}

function pick(row: any, keys: string[]): string {
  for (const k of keys) {
    const val = row?.[k];
    if (val !== undefined && val !== null && clean(val) !== "") return clean(val);
  }
  return "";
}

const SKILL_KEYWORDS: Record<string, string[]> = {
  Python: ["python"],
  Java: ["java"],
  JavaScript: ["javascript", "js", "node", "node.js"],
  React: ["react", "next.js", "nextjs"],
  SQL: ["sql", "postgres", "mysql", "sqlite"],
  AWS: ["aws", "amazon web services"],
  Docker: ["docker", "container"],
  Git: ["git", "github"],
  Tableau: ["tableau"],
  "Power BI": ["power bi", "powerbi"],
  ML: ["machine learning", "ml"],
  NLP: ["nlp", "natural language processing"],
};

function extractSkills(text: string): string[] {
  const t = (text || "").toLowerCase();
  const found: string[] = [];
  for (const [skill, keys] of Object.entries(SKILL_KEYWORDS)) {
    if (keys.some((k) => t.includes(k))) found.push(skill);
  }
  return [...new Set(found)];
}

function extractQualifications(text: string): string[] {
  const t = (text || "").toLowerCase();
  const out: string[] = [];
  if (t.includes("degree")) out.push("Degree mentioned");
  if (t.includes("diploma")) out.push("Diploma mentioned");
  if (t.includes("intern")) out.push("Internship-friendly");
  if (t.includes("fresh graduate")) out.push("Fresh graduate friendly");
  return [...new Set(out)];
}

function extractConstraints(text: string): string[] {
  const t = (text || "").toLowerCase();
  const out: string[] = [];
  if (t.includes("singaporean") || t.includes("citizen") || t.includes("pr"))
    out.push("Citizenship/PR may be required");
  if (t.includes("security clearance")) out.push("Security clearance");
  if (t.includes("shift")) out.push("Shift work possible");
  if (/\b\d+\+?\s*(years|yrs)\b/.test(t)) out.push("Years of experience mentioned");
  return [...new Set(out)];
}

export function normalizeRow(source: string, row: any, idx: number): Job {
  const r = normalizeKeys(row); // ✅ normalize headers

  const title = pick(r, ["title", "job_title", "position", "role", "jobtitle"]);
  const company = pick(r, ["company", "company_name", "employer", "companyname"]);
  const location = pick(r, ["location", "job_location", "city", "work_location"]);
  const jobTypeRaw = pick(r, ["job_type", "employment_type", "type", "workplace_model"]);
  const postedRaw = pick(r, ["posted", "posted_date", "date_posted", "date"]);
  const description = pick(r, ["description", "job_description", "jobdescription", "summary"]);
  const benefits = pick(r, ["benefits", "perks"]);
  const url = pick(r, ["url", "apply_url", "link"]);
  

  const text = `${title}\n${description}\n${benefits}`;

  return {
    id: `${source}-${idx}-${title.slice(0, 24).replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}`
  .toLowerCase(),

    source,
    title,
    company,
    location,
    jobTypeRaw: jobTypeRaw || undefined,
    postedRaw: postedRaw || undefined,
    description,
    benefits: benefits || undefined,
    url: url || undefined,
    requirements: {
      skills: extractSkills(text),
      qualifications: extractQualifications(text),
      constraints: extractConstraints(text),
    },
  };
}
