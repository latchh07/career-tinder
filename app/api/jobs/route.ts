import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { normalizeRow } from "../../../lib/normalize";

const DATA_DIR = path.join(process.cwd(), "data");

// ✅ Only these CSVs are used (edit as needed)
const ENABLED_SOURCES = new Set([
  "efinancialcareers.csv",
  "jobstreet.csv",
]);

function detectDelimiter(firstLine: string): string {
  const line = firstLine || "";
  // if there are semicolons but no commas, likely semicolon-separated
  if (line.includes(";") && !line.includes(",")) return ";";
  if (line.includes("\t")) return "\t";
  return ",";
}

function readCsv(fileName: string): any[] {
  const fullPath = path.join(DATA_DIR, fileName);

  // Read as buffer then to utf8 string (safer for encoding quirks)
  let csv = fs.readFileSync(fullPath).toString("utf8");

  // Remove BOM if present
  csv = csv.replace(/^\uFEFF/, "");

  const firstLine = csv.split(/\r?\n/)[0] || "";
  const delimiter = detectDelimiter(firstLine);

  const parsed = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    delimiter,
    quoteChar: '"',
    escapeChar: '"',
    transformHeader: (h) => h.replace(/^\uFEFF/, "").trim(),
  });

  // Helpful logs if something goes wrong
  if ((parsed.data as any[]).length === 0 && parsed.errors?.length) {
    console.log("PAPAPARSE ERRORS for", fileName, parsed.errors.slice(0, 5));
  }

  return (parsed.data as any[]) || [];
}

export async function GET(req: Request) {
  if (!fs.existsSync(DATA_DIR)) {
    return NextResponse.json(
      { error: "data/ folder not found. Create /data and place CSV files inside." },
      { status: 500 }
    );
  }

  // Optional paging to keep UI fast
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 500), 2000);
  const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);

  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.toLowerCase().endsWith(".csv"))
    .filter((f) => ENABLED_SOURCES.has(f));

  if (files.length === 0) {
    return NextResponse.json({
      sources: [],
      count: 0,
      jobs: [],
      warning: "No enabled CSV sources found in /data. Check ENABLED_SOURCES filenames.",
    });
  }

  const allJobs = files.flatMap((file) => {
    const source = file.replace(".csv", "").toLowerCase();
    const rows = readCsv(file);

    return rows
      .map((row, idx) => normalizeRow(source, row, idx))
      // Don’t over-filter; only require title to be non-empty
      .filter((j) => (j.title ?? "").trim().length > 0);
  });

  const jobs = allJobs.slice(offset, offset + limit);

  return NextResponse.json({
    sources: files,
    count: allJobs.length,
    limit,
    offset,
    jobs,
  });
}
