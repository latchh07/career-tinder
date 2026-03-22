export type Job = {
  id: string;
  source: string;

  title: string;
  company: string;
  location: string;

  jobTypeRaw?: string;
  postedRaw?: string;
  url?: string;
  benefits?: string;

  description: string;

  requirements: {
    skills: string[];
    qualifications: string[];
    constraints: string[];
  };
};

export type Profile = {
  name?: string;
  year: "Y1" | "Y2";
  skills: string[];
  roles: string[];
  certifications?: string[];  // ← ADD THIS LINE
};