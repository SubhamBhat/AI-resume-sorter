export interface Candidate {
  id: string;
  name: string;
  filename: string;
  score: number;
  matchPercentage: number;
  semanticScore: number;
  skillMatchRatio: number;
  experienceSignal: number;
  summary: string;
  extractedSkills: string[];
  extractedExperience: string[];
  extractedEducation: string[];
  feedback: string;
  evidence: string[];
  improvements: string[];
  jdSkills: string[];
  missingSkills: string[];
  skillEvidence: Record<string, string>;
  rawText: string;
}

export interface SortResponse {
  candidates: Candidate[];
  jobDescription: string;
  analysisTime: number;
}
