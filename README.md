# AI Resume Sorter

AI-powered resume screening that analyzes PDF resumes against a job description using semantic similarity and NLP. It ranks candidates, visualizes insights, and provides explainable evidence, improvement suggestions, and an interactive “Chat with Resume”.

## Overview
- Frontend: Next.js + React with a clean UI for uploads, results, analytics, and a drawer for candidate details.
- Backend: FastAPI with pdfplumber for PDF text extraction, sentence-transformers for semantic scoring, and high-fidelity NER via Hugging Face (with spaCy/regex fallbacks).
- Real analytics: Score distribution, experience buckets, top skills, and JD skill overlap.
- Explainability: Evidence snippets for why a candidate ranks well plus targeted improvement tips.
- Chat with Resume: Multi-turn, section-aware Q&A grounded in resume content with server-side memory (TTL).
- Extras: Semantic Search, Skill Gap checklist, weighting sliders for “what-if” reranking, shortlist and side-by-side compare.

## Key Features
- PDF parsing and robust cleanup of artifacts (e.g., cid:###, links, numbering).
- Semantic scoring using all-MiniLM-L6-v2 + alias-aware keyword matching.
- NER and skill extraction with HF pipeline (dslim/bert-base-NER) and spaCy/regex fallbacks.
- Charts with live data (Recharts): score distribution, experience, skills, JD overlap.
- Chat Q&A endpoints with leadership/education/experience/project heuristics to reduce hallucinations.

## Run Locally
1) Backend (FastAPI)
- cd backend
- python -m venv venv && venv\\Scripts\\activate (Windows)
- pip install -r requirements.txt
- uvicorn main:app --reload (http://localhost:8000)

2) Frontend (Next.js)
- npm install
- npm run dev (http://localhost:3000)

The frontend proxies to the backend on http://localhost:8000. You can adjust BACKEND_URL via environment variables if needed.

## API (Backend)
- POST /api/sort-resumes
  - FormData: job_description (string), resumes (PDF files[])
  - Returns candidates[], jobDescription, analysisTime
- POST /api/semantic-search
  - FormData: query (string), resumes (PDF files[])
  - Ranks by natural-language query
- POST /api/candidate-ask
  - FormData: question, resume_text, candidate_id?, history?
  - Returns concise answer + clean evidence lines

## License
MIT (or your preferred license)
