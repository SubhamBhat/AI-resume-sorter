"""
Resume text extraction and entity extraction module
Handles PDF parsing and information extraction, with optional spaCy support
"""

import pdfplumber
import re
from typing import Dict, List, Any
from io import BytesIO

# Try to import spaCy, but fall back gracefully if unavailable
try:
    import spacy  # type: ignore
    SPACY_AVAILABLE = True
except Exception:
    spacy = None  # type: ignore
    SPACY_AVAILABLE = False

# Try to import Hugging Face NER pipeline for high-fidelity NER
try:
    from transformers import pipeline  # type: ignore
    HF_AVAILABLE = True
except Exception:
    HF_AVAILABLE = False

class ResumeProcessor:
    """Process and extract information from resume PDFs"""
    
    def __init__(self, ner_mode: str = "auto"):
        self.nlp = None
        self.hf_ner = None
        self.summarizer = None
        mode = (ner_mode or "auto").lower()
        if mode in ("auto", "hf") and HF_AVAILABLE:
            try:
                self.hf_ner = pipeline("token-classification", model="dslim/bert-base-NER", aggregation_strategy="simple")
            except Exception:
                self.hf_ner = None
        if mode in ("auto", "spacy") and SPACY_AVAILABLE:
            try:
                self.nlp = spacy.load("en_core_web_sm")  # type: ignore
            except Exception:
                self.nlp = None
        # Optional summarizer
        if HF_AVAILABLE:
            try:
                self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")  # type: ignore
            except Exception:
                self.summarizer = None
    
    def extract_text(self, pdf_content: bytes, filename: str) -> str:
        """
        Extract text from PDF content
        
        Args:
            pdf_content: PDF file bytes
            filename: Original filename
            
        Returns:
            Extracted text from PDF
        """
        try:
            text_content = []
            with pdfplumber.open(BytesIO(pdf_content)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)
            
            raw = "\n".join(text_content).strip()
            # Cleanup common PDF artifacts like (cid:127) and noisy tokens
            try:
                raw = re.sub(r"\(cid:\d+\)", "", raw, flags=re.IGNORECASE)
                raw = re.sub(r"\bcid:\d+\b", "", raw, flags=re.IGNORECASE)
                # Split by lines to clean per-line artifacts and leading numerals/bullets
                lines = []
                for line in raw.splitlines():
                    l = re.sub(r"\s{2,}", " ", line).strip()
                    # Remove leading page numbers or bullets like "82 ", "12. ", "3) "
                    l = re.sub(r"^\s*\d{1,3}[\.\)]?\s+", "", l)
                    # Skip lines that are only digits or mostly punctuation
                    if re.fullmatch(r"[\d\W_]+", l or ""):
                        continue
                    # Skip pure URLs or link fragments
                    if re.search(r"(https?://|www\.|\.com|\.net|\.org|linkedin\.|github\.|mailto:)", l, flags=re.IGNORECASE):
                        # keep if it also contains meaningful alpha words beyond link
                        words = re.findall(r"[A-Za-z]{4,}", l)
                        if len(words) < 2:
                            continue
                    lines.append(l)
                raw = "\n".join(lines)
                # Normalize common separators while preserving line structure
                raw = re.sub(r"\s*\|\s*", " | ", raw)
                # Reinsert line breaks for sections often smashed into one line
                raw = re.sub(r"\s*(Education|Skills|Projects|Experience|Achievements)\s*", r"\n\1\n", raw, flags=re.IGNORECASE)
            except Exception:
                pass
            return raw
        except Exception as e:
            print(f"Error extracting text from {filename}: {str(e)}")
            return ""
    
    def extract_entities(self, text: str) -> Dict[str, Any]:
        """
        Extract entities from resume NB: Uses spaCy if available, else regex heuristics
        
        Args:
            text: Resume text
            
        Returns:
            Dictionary with extracted entities
        """
        entities: Dict[str, List[str]] = {
            "PERSON": [],
            "ORG": [],
            "GPE": [],
            "DATE": [],
            "PRODUCT": [],
        }

        trimmed = text[:500000]

        # High-fidelity path: Hugging Face NER
        if self.hf_ner:
            try:
                hf_entities = self.hf_ner(trimmed)
                for ent in hf_entities:
                    label = ent.get("entity_group", "")
                    val = ent.get("word", "").strip()
                    if not val:
                        continue
                    if label == "PER" and val not in entities["PERSON"]:
                        entities["PERSON"].append(val)
                    elif label == "ORG" and val not in entities["ORG"]:
                        entities["ORG"].append(val)
                    elif label == "LOC" and val not in entities["GPE"]:
                        entities["GPE"].append(val)
            except Exception:
                pass

        # spaCy path (complements HF or used alone)
        if self.nlp:
            doc = self.nlp(trimmed)  # type: ignore
            for ent in doc.ents:
                if ent.label_ in entities and ent.text not in entities[ent.label_]:
                    entities[ent.label_].append(ent.text)
            # Continue to regex fallback for DATE even if spaCy/HF handled others

        # Regex-based fallback for ORG and DATE when spaCy is unavailable
        org_patterns = [
            r"\b[A-Z][A-Za-z0-9&\-\., ]+(?:Inc|LLC|Ltd|Corporation|Corp|Technologies|Systems|Labs|Solutions)\b",
            r"\b[A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+){0,3}\s(?:Company|Organization|University)\b",
        ]
        date_patterns = [
            r"\b(19|20)\d{2}\b",
            r"\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+(19|20)\d{2}\b",
        ]

        for pat in org_patterns:
            for m in re.finditer(pat, trimmed):
                val = m.group(0).strip()
                if val not in entities["ORG"]:
                    entities["ORG"].append(val)

        for pat in date_patterns:
            for m in re.finditer(pat, trimmed, flags=re.IGNORECASE):
                val = m.group(0).strip()
                if val not in entities["DATE"]:
                    entities["DATE"].append(val)

        return entities
    
    def extract_skills(self, text: str) -> List[str]:
        """
        Extract potential skills from resume text
        Uses pattern matching and common skill keywords
        
        Args:
            text: Resume text
            
        Returns:
            List of extracted skills
        """
        # Common technical skills
        technical_skills = [
            "python", "javascript", "typescript", "java", "c++", "c#", "php", "ruby", "go", "rust",
            "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
            "react", "vue", "angular", "nextjs", "svelte", "node.js", "express", "django", "flask",
            "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git", "gitlab", "github",
            "html", "css", "scss", "tailwind", "bootstrap", "webpack", "vite",
            "rest", "graphql", "api", "microservices", "serverless",
            "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch",
            "agile", "scrum", "jira", "figma", "adobe", "sketch",
            "linux", "windows", "macos", "devops", "ci/cd",
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in technical_skills:
            # Look for the skill with word boundaries
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                if skill not in found_skills:
                    found_skills.append(skill)
        
        return found_skills[:20]  # Return top 20 skills
    
    def extract_experience(self, text: str) -> List[str]:
        """
        Extract experience entries from resume
        Looks for company names and job titles
        
        Args:
            text: Resume text
            
        Returns:
            List of experience entries
        """
        experience: List[str] = []
        lines = text.split('\n')

        # Try extracting organizations with spaCy when available
        if self.nlp:
            try:
                doc = self.nlp(text[:500000])  # type: ignore
                for ent in doc.ents:
                    if ent.label_ == "ORG" and ent.text not in experience:
                        experience.append(ent.text)
            except Exception:
                pass
        
        # Look for common job title patterns
        job_titles = [
            "engineer", "developer", "designer", "manager", "director", "analyst",
            "architect", "consultant", "specialist", "coordinator", "lead", "principal"
        ]
        
        for line in lines:
            line_lower = line.lower()
            for title in job_titles:
                if title in line_lower and len(line.strip()) > 5:
                    if line.strip() not in experience and len(experience) < 10:
                        experience.append(line.strip()[:100])
                    break
        
        return experience[:10]  # Return top 10 entries
    
    def extract_education(self, text: str) -> List[str]:
        """
        Extract education information from resume
        
        Args:
            text: Resume text
            
        Returns:
            List of education entries
        """
        education = []
        lines = text.split('\n')
        
        # Common degree patterns
        degree_patterns = [
            r'bachelor',
            r'master',
            r'phd',
            r'diploma',
            r'certificate',
            r'b\.?s\.?',
            r'm\.?s\.?',
            r'b\.?a\.?',
            r'm\.?a\.?',
        ]
        
        for line in lines:
            line_lower = line.lower().strip()
            if len(line) > 5:  # Ignore very short lines
                for pattern in degree_patterns:
                    if re.search(pattern, line_lower):
                        if line.strip() not in education:
                            education.append(line.strip())
                        break
        
        return education[:5]  # Return top 5 entries
    
    def generate_summary(self, text: str) -> str:
        """
        Generate a brief summary of the resume
        
        Args:
            text: Resume text
            
        Returns:
            Summary text (first meaningful sentence/paragraph)
        """
        # Prefer abstractive summary if summarizer is available
        if self.summarizer:
            try:
                chunk = text.strip()[:1500]
                if len(chunk) > 100:
                    out = self.summarizer(chunk, max_length=110, min_length=40, do_sample=False)
                    if out and isinstance(out, list) and out[0].get("summary_text"):
                        return out[0]["summary_text"].strip()
            except Exception:
                pass
        # Heuristic fallback
        text = text.strip()
        if len(text) > 300:
            period_index = text.find('.')
            if period_index > 50 and period_index < 300:
                return text[:period_index + 1]
            else:
                return text[:300] + "..."
        return text
