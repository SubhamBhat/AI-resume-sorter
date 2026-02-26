"""
TalentAI Backend - FastAPI Resume Screening Service
Uses semantic matching (sentence-transformers) and NER (spacy) for intelligent resume ranking
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import uuid
import time
import os

# Import resume processing and scoring modules
from processors.resume_processor import ResumeProcessor
from processors.scorer import ResumeScorer
from config import settings
from typing import Optional

# Initialize FastAPI app
app = FastAPI(
    title="TalentAI Resume Screening API",
    description="AI-powered resume screening and ranking service",
    version="1.0.0"
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
resume_processor = ResumeProcessor(ner_mode=settings.NER_MODE)
resume_scorer = ResumeScorer()

class ChatStore:
    def __init__(self, ttl_sec: int = 86400, max_messages: int = 60):
        self.ttl = ttl_sec
        self.max_messages = max_messages
        self.data: Dict[str, Dict[str, any]] = {}
    def add(self, cid: str, role: str, text: str):
        now = time.time()
        entry = self.data.get(cid) or {"messages": [], "updated": 0.0}
        entry["messages"].append({"role": role, "text": text, "ts": now})
        if len(entry["messages"]) > self.max_messages:
            entry["messages"] = entry["messages"][-self.max_messages:]
        entry["updated"] = now
        self.data[cid] = entry
    def get(self, cid: str) -> List[Dict[str, str]]:
        entry = self.data.get(cid)
        if not entry:
            return []
        if time.time() - float(entry.get("updated", 0.0)) > self.ttl:
            self.data.pop(cid, None)
            return []
        return [{"role": m.get("role", ""), "text": m.get("text", "")} for m in entry.get("messages", [])]

chat_store = ChatStore()

# Response models
class Candidate(BaseModel):
    id: str
    name: str
    filename: str
    score: float
    matchPercentage: int
    semanticScore: float
    skillMatchRatio: float
    experienceSignal: float
    summary: str
    extractedSkills: List[str]
    extractedExperience: List[str]
    extractedEducation: List[str]
    feedback: str
    evidence: List[str]
    improvements: List[str]
    jdSkills: List[str]
    missingSkills: List[str]
    skillEvidence: dict
    rawText: str

class SortResponse(BaseModel):
    candidates: List[Candidate]
    jobDescription: str
    analysisTime: float

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "TalentAI Resume Screening API"}

@app.post("/api/sort-resumes", response_model=SortResponse)
async def sort_resumes(
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...),
):
    """
    Sort resumes based on job description match.
    
    Args:
        job_description: Job description text
        resumes: List of PDF files to process
        
    Returns:
        Sorted list of candidates with scores and extracted information
    """
    start_time = time.time()
    
    try:
        # Validate inputs
        if not job_description or not job_description.strip():
            raise HTTPException(status_code=400, detail="Job description cannot be empty")
        
        if not resumes or len(resumes) == 0:
            raise HTTPException(status_code=400, detail="At least one resume must be provided")
        
        # Helper: infer candidate display name
        def _infer_name(entities: Dict[str, List[str]], text: str, filename: str) -> str:
            # Prefer PERSON entities (join first two tokens if needed)
            persons = entities.get("PERSON") or []
            if persons:
                # Choose the longest token (likely full name)
                candidate_name = max(persons, key=len)
                if 2 <= len(candidate_name.split()) <= 5:
                    return candidate_name.strip()
            # Fallback: first non-empty line that looks like a name
            for line in text.splitlines()[:8]:
                clean = line.strip()
                if not clean:
                    continue
                low = clean.lower()
                if any(x in low for x in ["resume", "curriculum", "profile", "summary"]):
                    continue
                # Heuristic: 2–5 words, mostly letters, starts with capital
                parts = clean.split()
                if 2 <= len(parts) <= 5 and parts[0][0].isalpha() and parts[0][0].isupper():
                    return clean
            # Final fallback: filename without extension
            base = os.path.splitext(os.path.basename(filename))[0]
            return base.replace("_", " ").replace("-", " ").strip()

        # Process all resumes
        processed_resumes = []
        
        for resume_file in resumes:
            if not resume_file.filename:
                continue
                
            # Read file content
            content = await resume_file.read()
            
            if not content:
                continue
            
            # Extract text from PDF
            try:
                resume_text = resume_processor.extract_text(content, resume_file.filename)
                if not resume_text:
                    continue
                
                # Extract entities and information
                entities = resume_processor.extract_entities(resume_text)
                summary = resume_processor.generate_summary(resume_text)
                skills = resume_processor.extract_skills(resume_text)
                education = resume_processor.extract_education(resume_text)
                name = _infer_name(entities, resume_text, resume_file.filename)
                
                processed_resumes.append({
                    "name": name,
                    "filename": resume_file.filename,
                    "raw_text": resume_text,
                    "entities": entities,
                    "summary": summary,
                    "skills": skills,
                    "education": education,
                })
            except Exception as e:
                print(f"Error processing {resume_file.filename}: {str(e)}")
                continue
        
        if not processed_resumes:
            raise HTTPException(status_code=400, detail="No valid resumes could be processed")
        
        # Score and rank resumes
        candidates = []
        scores_data = resume_scorer.score_resumes(
            job_description, 
            processed_resumes
        )
        
        for idx, score_data in enumerate(scores_data):
            candidate = Candidate(
                id=str(uuid.uuid4()),
                name=score_data.get("name", ""),
                filename=score_data["filename"],
                score=score_data["score"],
                matchPercentage=score_data["match_percentage"],
                semanticScore=score_data["semantic_score"],
                skillMatchRatio=score_data["skill_match_ratio"],
                experienceSignal=score_data["experience_signal"],
                summary=score_data["summary"],
                extractedSkills=score_data["skills"],
                extractedExperience=score_data["experience"],
                extractedEducation=score_data["education"],
                feedback=score_data["feedback"],
                evidence=score_data["evidence"],
                improvements=score_data["improvements"],
                jdSkills=score_data["jd_skills"],
                missingSkills=score_data["missing_skills"],
                skillEvidence=score_data["skill_evidence"],
                rawText=score_data["raw_text"],
            )
            candidates.append(candidate)
        
        # Sort by match percentage (descending)
        candidates.sort(key=lambda x: x.matchPercentage, reverse=True)
        
        analysis_time = time.time() - start_time
        
        return SortResponse(
            candidates=candidates,
            jobDescription=job_description,
            analysisTime=analysis_time,
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error in sort_resumes: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/api/semantic-search", response_model=SortResponse)
async def semantic_search(
    query: str = Form(...),
    resumes: List[UploadFile] = File(...),
):
    """Semantic search over resumes using a natural language query."""
    return await sort_resumes(job_description=query, resumes=resumes)

@app.post("/api/candidate-ask")
async def candidate_ask(
    question: str = Form(...),
    resume_text: str = Form(...),
    candidate_id: Optional[str] = Form(None),
    history: str | None = Form(None),
):
    from sentence_transformers import util as st_util
    import re, json
    q = question.strip()
    # Basic cleanup to remove artifacts like (cid:###)
    txt = re.sub(r"\(cid:\d+\)", "", resume_text, flags=re.IGNORECASE)
    txt = re.sub(r"\bcid:\d+\b", "", txt, flags=re.IGNORECASE)
    # Remove URLs, emails, and phone numbers to reduce noise
    txt = re.sub(r"https?://\S+|www\.\S+", "", txt, flags=re.IGNORECASE)
    txt = re.sub(r"\b[\w\.-]+@[\w\.-]+\.\w+\b", "", txt)
    txt = re.sub(r"\+?\d[\d\-\s]{7,}\d", "", txt)
    txt = re.sub(r"\s{2,}", " ", txt)
    # Helper: filter out contact/header noise
    def is_noise(s: str) -> bool:
        l = s.lower()
        # Contact or links or mostly punctuation
        if any(t in l for t in ["email", "phone", "linkedin", "github", "http", "https", "@", "+91", "+1 ", "www."]):
            return True
        if any(t in l for t in [".com", ".net", ".org", ".in/", ".io"]):
            return True
        # Too short or mostly delimiters
        if len(s) < 25:
            return True
        # Lots of separators
        if sum(1 for ch in s if ch in "|:/@") >= 3:
            return True
        # Too many digits vs letters
        letters = sum(1 for ch in s if ch.isalpha())
        digits = sum(1 for ch in s if ch.isdigit())
        if letters and digits / max(1, letters) > 0.7:
            return True
        return False
    # Build lines and sections for downstream rules
    raw_lines = [ln.strip() for ln in re.split(r"[\n\r]+", txt) if ln.strip()]
    # Remove leading numbering/bullets in lines
    lines = []
    for ln in raw_lines:
        l = re.sub(r"^\s*[-*\d]+[.)]?\s*", "", ln).strip()
        if not l:
            continue
        if is_noise(l):
            continue
        lines.append(l)
    # Index section headings
    headings = []
    for idx, line in enumerate(lines):
        if re.fullmatch(r"(?i)(projects?|experience|work experience|education|skills|achievements|certifications)\b[:\-]?", line):
            headings.append((idx, line.lower()))
    def section_slice(name: str, max_len: int = 15) -> list[str]:
        targets = [i for i, h in headings if name in h]
        if not targets:
            return []
        start = targets[0] + 1
        # End at next heading or cap
        end = None
        for i, _ in headings:
            if i > start:
                end = i
                break
        seg = lines[start:end] if end else lines[start:start + max_len]
        # Filter noise again lightly
        cleaned = []
        for s in seg:
            s2 = re.sub(r"https?://\S+|www\.\S+", "", s)
            s2 = re.sub(r"\b[\w\.-]+@[\w\.-]+\.\w+\b", "", s2)
            s2 = s2.strip()
            if s2 and not is_noise(s2):
                cleaned.append(s2)
        return cleaned[:max_len]
    # Chunk and score
    chunks = resume_scorer._create_chunks(txt, chunk_size=400)
    ctx = ""
    recent_user_texts = []
    server_hist = []
    if candidate_id:
        try:
            server_hist = chat_store.get(candidate_id)
        except Exception:
            server_hist = []
    if history:
        try:
            items = json.loads(history)
            pairs = []
            merged = (server_hist[-10:] if server_hist else []) + items[-10:]
            for it in merged[-10:]:
                r = str(it.get("role", ""))
                t = str(it.get("text", "")).strip()
                if not t:
                    continue
                if is_noise(t):
                    continue
                prefix = "User:" if r == "user" else "Assistant:"
                pairs.append(f"{prefix} {t}")
                if r == "user":
                    recent_user_texts.append(t)
            ctx = " | ".join(pairs)
        except Exception:
            ctx = ""
    q_query = (ctx + " | " if ctx else "") + q
    q_emb = resume_scorer.model.encode(q_query, convert_to_tensor=True)
    # Build keyword set from current and recent user turns for light biasing
    kw = set([w.lower() for w in re.findall(r"[A-Za-z]{4,}", q_query)])
    scored = []
    for ch in chunks:
        ch_emb = resume_scorer.model.encode(ch, convert_to_tensor=True)
        sim = st_util.pytorch_cos_sim(q_emb, ch_emb)[0][0].item()
        # Split chunk to sentences to make answers more precise
        for sent in [s.strip() for s in re.split(r"[\.!\?]\s+", ch) if s.strip()]:
            if not is_noise(sent):
                sl = sent.lower()
                # Light boost for sentences containing query/history keywords
                hits = sum(1 for t in kw if t in sl)
                boost = min(0.1, 0.02 * hits) if hits else 0.0
                scored.append((sim + boost, sent))
    # Rank by similarity (chunk-level) and keep top unique sentences
    scored.sort(key=lambda x: x[0], reverse=True)
    top_sents = []
    seen = set()
    for sim, sent in scored:
        s = sent[:250]
        if s.lower() in seen:
            continue
        seen.add(s.lower())
        top_sents.append((sim, s))
        if len(top_sents) >= 3:
            break
    # Build an interactive-style concise answer with heuristics
    ql = q.lower()
    def contains_any(text, words):
        tl = text.lower()
        return any(w in tl for w in words)
    answer = ""
    if contains_any(ql, ["lead", "leader", "managed", "manage", "team lead", "leadership", "supervis", "responsib", "owned", "ownership", "accountable", "coordinated", "organized"]):
        # Look for leadership evidence
        evidence = [s for _, s in top_sents if contains_any(s, ["led", "managed", "team lead", "leadership", "supervised", "mentored", "responsible for", "owned", "coordinated", "organized"])]
        if not evidence:
            # broader search
            for _, s in scored[:50]:
                if contains_any(s, ["led", "managed", "team lead", "leadership", "supervised", "mentored", "responsible for", "owned", "coordinated", "organized"]):
                    evidence.append(s[:250])
                    if len(evidence) >= 2:
                        break
        if evidence:
            answer = "Yes — shows leadership experience."
        else:
            answer = "Not explicitly mentioned — no clear leadership evidence found."
        top_sents = [(1.0, e) for e in evidence[:3]]
    elif contains_any(ql, ["year", "experience", "exp"]):
        # Try to extract years of experience
        years = re.findall(r"\b(\d{1,2})\s*\+?\s*years?\b", txt, flags=re.IGNORECASE)
        if years:
            max_years = max(int(y) for y in years)
            answer = f"Approximately {max_years} years of experience mentioned."
        else:
            answer = "Years of experience are not clearly quantified."
        # Keep top_sents limited to experience-like sentences
        exp_sents = []
        for _, s in scored:
            if re.search(r"\b\d{1,2}\s*\+?\s*years?\b", s, flags=re.IGNORECASE):
                exp_sents.append(s[:250])
                if len(exp_sents) >= 3:
                    break
        if exp_sents:
            top_sents = [(1.0, s) for s in exp_sents]
    elif contains_any(ql, ["cgpa", "gpa"]):
        # Extract CGPA/GPA values robustly
        cg = re.findall(r"\b(CGPA|GPA)\s*[:\-]?\s*(\d+(?:\.\d+)?)", txt, flags=re.IGNORECASE)
        if cg:
            val = cg[0][1]
            answer = f"CGPA/GPA: {val}"
            # Try to surface the line that contains it
            src = next((l for l in lines if re.search(r"\b(CGPA|GPA)\b", l, flags=re.IGNORECASE)), None)
            top_sents = [(1.0, src[:200])] if src else []
        else:
            answer = "CGPA/GPA not explicitly mentioned."
            top_sents = []
    elif contains_any(ql, ["education", "college", "university", "degree", "btech", "b.tech", "b sc", "bsc", "mtech", "m.tech", "msc", "b.e", "be"]):
        # Extract education lines
        edu_lines = section_slice("education", max_len=12)
        if not edu_lines:
            # fallback scan
            for line in lines:
                ll = line.lower()
                if any(k in ll for k in ["university", "college", "institute", "school", "b.tech", "btech", "b.e", "be", "m.tech", "mtech", "m.sc", "msc", "b.sc", "bsc", "cgpa", "gpa"]):
                    edu_lines.append(line[:200])
                    if len(edu_lines) >= 3:
                        break
        if edu_lines:
            # Prefer the institution names for the answer
            inst = [e for e in edu_lines if any(x in e.lower() for x in ["university", "college", "institute", "school"])]
            if inst:
                answer = f"Education: {inst[0]}"
            else:
                answer = f"Education: {edu_lines[0]}"
            top_sents = [(1.0, e) for e in edu_lines[:3]]
        else:
            answer = "Education details not clearly found."
    elif contains_any(ql, ["project", "projects", "web", "website", "frontend", "backend", "full stack", "fullstack", "react", "node", "django", "flask", "html", "css", "javascript", "typescript", "api", "machine learning", "ml", "deep learning", "cnn", "lstm", "pytorch", "tensorflow"]):
        # Extract project lines with optional domain filters
        web_kw = ["web", "website", "frontend", "backend", "full stack", "fullstack", "react", "next", "node", "express", "django", "flask", "html", "css", "javascript", "typescript", "api"]
        ml_kw = ["machine learning", "ml", "deep learning", "cnn", "lstm", "pytorch", "tensorflow", "model", "classification", "prediction"]
        want_web = contains_any(ql, web_kw)
        want_ml = contains_any(ql, ml_kw)
        proj_lines = section_slice("project", max_len=18)
        # Fallback: scan all lines if section not found
        if not proj_lines:
            for line in lines:
                ll = line.lower()
                if ("project" in ll) or any(k in ll for k in web_kw + ml_kw):
                    proj_lines.append(line[:200])
                    if len(proj_lines) >= 8:
                        break
        # Apply domain filters
        filtered = []
        for pl in proj_lines:
            pll = pl.lower()
            if want_web and not any(k in pll for k in web_kw):
                continue
            if want_ml and not any(k in pll for k in ml_kw):
                continue
            # must contain either 'project' or a clear action/tech keyword to avoid skill dump lines
            if ("project" not in pll) and not any(k in pll for k in ["built", "developed", "implemented", "designed", "created", "classification", "prediction", "api", "app", "web", "model"]):
                continue
            filtered.append(pl)
            if len(filtered) >= 3:
                break
        if proj_lines:
            use = filtered if filtered else proj_lines[:3]
            if want_web:
                answer = f"Web projects: {use[0]}"
            elif want_ml:
                answer = f"ML projects: {use[0]}"
            else:
                answer = f"Projects: {use[0]}"
            top_sents = [(1.0, p) for p in use]
        else:
            answer = "No explicit projects matching that topic were found."
    else:
        # General: provide a brief, natural reply using sentences that contain query keywords
        filtered = [(sc, s) for sc, s in top_sents if any(k in s.lower() for k in kw)]
        if filtered:
            joined = "; ".join([s for _, s in filtered[:2]])
            answer = f"From the resume: {joined}"
        else:
            answer = "I couldn't find specific information related to your question."
            top_sents = []
    result = {
        "answer": answer.strip(),
        "snippets": [s.strip() for _, s in top_sents],
        "scores": [float(sim) for sim, _ in top_sents],
    }
    if candidate_id:
        try:
            chat_store.add(candidate_id, "user", q)
            chat_store.add(candidate_id, "assistant", answer.strip())
        except Exception:
            pass
    return result

if __name__ == "__main__":
    import uvicorn
    # Run with: uvicorn main:app --reload
    uvicorn.run(app, host="0.0.0.0", port=8000)
