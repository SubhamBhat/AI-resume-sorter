"""
Resume scoring and semantic matching module
Uses sentence-transformers for semantic similarity matching
"""

from sentence_transformers import SentenceTransformer, util
from typing import List, Dict, Any
import numpy as np
from functools import lru_cache

class ResumeScorer:
    """Score and rank resumes based on job description match"""
    
    def __init__(self):
        """Initialize the semantic similarity model"""
        # Use a lightweight model for better performance
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.job_description_embedding = None
        self.current_job_description = None
    
    @lru_cache(maxsize=128)
    def _get_cached_embedding(self, text: str):
        """Cache embeddings to avoid recomputation"""
        # Convert to tuple since lru_cache requires hashable types
        return self.model.encode(text, convert_to_tensor=False)
    
    def score_resumes(
        self, 
        job_description: str, 
        processed_resumes: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Score and rank resumes based on job description match
        
        Args:
            job_description: Job description text
            processed_resumes: List of processed resume data
            
        Returns:
            Ranked list of resume data with scores
        """
        # Get job description embedding
        job_embedding = self.model.encode(job_description, convert_to_tensor=True)
        
        scored_resumes = []
        
        for resume_data in processed_resumes:
            raw_text = resume_data["raw_text"]
            
            # Get resume text chunks for better matching
            chunks = self._create_chunks(raw_text, chunk_size=500)
            
            # Calculate semantic similarity scores
            chunk_scores = []
            for chunk in chunks:
                chunk_embedding = self.model.encode(chunk, convert_to_tensor=True)
                similarity = util.pytorch_cos_sim(job_embedding, chunk_embedding)[0][0].item()
                chunk_scores.append(similarity)
            
            # Calculate average score (primary metric)
            if chunk_scores:
                semantic_score = float(np.mean(chunk_scores))
                max_similarity = float(np.max(chunk_scores))
            else:
                semantic_score = 0.0
                max_similarity = 0.0
            
            # Evidence selection: top 3 chunks with highest similarity
            evidence = []
            if chunk_scores:
                top_idx = np.argsort(chunk_scores)[-5:][::-1]
                job_keywords = self._extract_keywords(job_description)
                for idx in top_idx:
                    raw_snippet = chunks[int(idx)][:240].strip()
                    # Filter out contact/header noise (emails/phones/links)
                    low = raw_snippet.lower()
                    if any(tok in low for tok in ["email", "phone", "linkedin", "github", "http", "@"]):
                        continue
                    # Compose concise evidence without similarity numbers
                    matched = [k for k in self._extract_keywords(raw_snippet) if k in job_keywords]
                    snippet = raw_snippet
                    if matched:
                        snippet = f"{raw_snippet}  | matched: {', '.join(matched)}"
                    evidence.append(snippet)
                    if len(evidence) >= 3:
                        break
            
            # Extract matching skills (secondary metric)
            # Prefer skills extracted by processor if present, else derive from text
            skills = resume_data.get("skills") or self._extract_matching_skills(raw_text, job_description)
            
            # Calculate skill match ratio
            job_keywords = self._extract_keywords(job_description)
            resume_keywords = self._extract_keywords(raw_text)
            skill_match_count = len(set(job_keywords) & set(resume_keywords))
            skill_match_ratio = skill_match_count / len(job_keywords) if job_keywords else 0.0
            jd_skills = job_keywords
            missing_skills = [k for k in jd_skills if k not in resume_keywords]
            skill_evidence = {}
            for k in set(jd_skills) & set(resume_keywords):
                snippet = ""
                for line in raw_text.splitlines():
                    if k in line.lower():
                        snippet = line.strip()[:200]
                        break
                if not snippet and chunks:
                    for ch in chunks:
                        if k in ch.lower():
                            snippet = ch.strip()[:200]
                            break
                skill_evidence[k] = snippet or "found"
            
            # Combined score with higher emphasis on semantic similarity
            combined_score = (0.85 * semantic_score) + (0.15 * skill_match_ratio)
            match_percentage = int(min(100, max(0, combined_score * 100)))
            
            # Generate feedback
            feedback = self._generate_feedback(
                semantic_score,
                skill_match_ratio,
                skills,
                resume_data["entities"]
            )
            improvements = self._generate_improvements(job_keywords, resume_keywords, skills)
            
            experience_signal = min(1.0, len(resume_data["entities"].get("ORG", [])) / 8.0)
            scored_resumes.append({
                "name": resume_data.get("name") or "",
                "filename": resume_data["filename"],
                "score": combined_score,
                "semantic_score": semantic_score,
                "skill_match_ratio": skill_match_ratio,
                "match_percentage": match_percentage,
                "summary": resume_data["summary"],
                "skills": skills,
                "experience": resume_data["entities"].get("ORG", [])[:5],
                "education": (resume_data.get("education") or resume_data["entities"].get("EDUCATION", []))[:3],
                "feedback": feedback,
                "evidence": evidence,
                "improvements": improvements,
                "jd_skills": jd_skills,
                "missing_skills": missing_skills,
                "skill_evidence": skill_evidence,
                "experience_signal": experience_signal,
                "raw_text": raw_text,
            })
        
        # Sort by match percentage (descending)
        scored_resumes.sort(key=lambda x: x["match_percentage"], reverse=True)
        
        return scored_resumes
    
    def _create_chunks(self, text: str, chunk_size: int = 500) -> List[str]:
        """
        Split text into overlapping chunks for better matching
        
        Args:
            text: Input text
            chunk_size: Size of each chunk
            
        Returns:
            List of text chunks
        """
        sentences = text.split('.')
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            
            sentence_len = len(sentence)
            
            if current_length + sentence_len > chunk_size and current_chunk:
                chunks.append('. '.join(current_chunk) + '.')
                current_chunk = [sentence]
                current_length = sentence_len
            else:
                current_chunk.append(sentence)
                current_length += sentence_len
        
        if current_chunk:
            chunks.append('. '.join(current_chunk) + '.')
        
        return chunks if chunks else [text]
    
    def _extract_matching_skills(self, resume_text: str, job_description: str) -> List[str]:
        """
        Extract skills from resume that match job description
        
        Args:
            resume_text: Resume text
            job_description: Job description text
            
        Returns:
            List of matching skills
        """
        # Common technical skills
        skills_db = [
            "python", "javascript", "typescript", "java", "c++", "c#", "php", "ruby", "go", "rust",
            "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
            "react", "vue", "angular", "nextjs", "node.js", "express", "django", "flask",
            "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git",
            "rest", "graphql", "api", "microservices",
            "machine learning", "deep learning", "tensorflow", "pytorch",
        ]
        
        resume_lower = resume_text.lower()
        job_lower = job_description.lower()
        
        matching_skills = []
        for skill in skills_db:
            if skill in resume_lower and skill in job_lower:
                matching_skills.append(skill.title())
        
        return matching_skills[:10]
    
    def _extract_keywords(self, text: str) -> List[str]:
        """
        Extract important keywords from text
        
        Args:
            text: Input text
            
        Returns:
            List of keywords
        """
        # Normalize and alias common technical terms for better contextual coverage
        keywords_db = [
            "python", "javascript", "java", "react", "node", "sql", "cloud",
            "api", "database", "frontend", "backend", "fullstack", "mobile",
            "devops", "agile", "testing", "performance", "security", "scalability"
        ]
        aliases = {
            "node": ["node.js", "nodejs", "express"],
            "react": ["react.js", "reactjs", "nextjs", "next.js"],
            "sql": ["postgresql", "mysql", "psql", "mssql", "sqlite"],
            "cloud": ["aws", "amazon web services", "gcp", "google cloud", "azure"],
            "devops": ["ci/cd", "cicd", "pipeline", "docker", "kubernetes"],
            "testing": ["jest", "pytest", "unit testing", "e2e", "cypress"],
            "api": ["rest", "graphql", "restful"],
        }
        text_lower = text.lower()
        found_keywords: List[str] = []
        for keyword in keywords_db:
            if keyword in text_lower:
                found_keywords.append(keyword)
                continue
            # alias matching
            for alt in aliases.get(keyword, []):
                if alt in text_lower:
                    found_keywords.append(keyword)
                    break
        # Unique preserve order
        seen = set()
        unique = []
        for k in found_keywords:
            if k not in seen:
                unique.append(k)
                seen.add(k)
        return unique
    
    def _generate_feedback(
        self, 
        semantic_score: float,
        skill_match_ratio: float,
        skills: List[str],
        entities: Dict[str, List[str]]
    ) -> str:
        """
        Generate AI feedback for the candidate
        
        Args:
            semantic_score: Semantic similarity score
            skill_match_ratio: Ratio of matching skills
            skills: Matched skills
            entities: Extracted entities
            
        Returns:
            Feedback text
        """
        feedback_parts = []
        
        # Semantic score feedback
        if semantic_score > 0.75:
            feedback_parts.append("Strong semantic match with job requirements.")
        elif semantic_score > 0.5:
            feedback_parts.append("Good match with job requirements.")
        elif semantic_score > 0.3:
            feedback_parts.append("Moderate match with job requirements.")
        else:
            feedback_parts.append("Limited semantic match with job requirements.")
        
        # Skill match feedback
        if skill_match_ratio > 0.7:
            feedback_parts.append(f"Excellent skill alignment with {len(skills)} relevant skills identified.")
        elif skill_match_ratio > 0.4:
            feedback_parts.append(f"Good skill overlap with {len(skills)} relevant skills.")
        elif skill_match_ratio > 0.1:
            feedback_parts.append(f"Some skill overlap with {len(skills)} relevant skills.")
        else:
            feedback_parts.append("Limited skill overlap with job requirements.")
        
        # Company experience feedback
        organizations = entities.get("ORG", [])
        if organizations:
            feedback_parts.append(f"Candidate has experience at {len(organizations)} organizations.")
        
        # Education feedback
        education = entities.get("DATE", [])
        if education:
            feedback_parts.append("Strong educational background indicated.")
        
        return " ".join(feedback_parts)

    def _generate_improvements(
        self,
        job_keywords: List[str],
        resume_keywords: List[str],
        matched_skills: List[str],
    ) -> List[str]:
        """Generate targeted improvement suggestions based on gaps."""
        improvements: List[str] = []
        gaps = [kw for kw in job_keywords if kw not in resume_keywords]
        if gaps:
            for g in gaps[:5]:
                improvements.append(f"Strengthen experience with {g}: build a small project or certification.")
        if len(matched_skills) < max(3, len(job_keywords) // 2):
            improvements.append("Highlight concrete achievements using metrics to improve semantic relevance.")
        if not improvements:
            improvements.append("Great alignment. Emphasize recent work matching the job requirements.")
        return improvements
