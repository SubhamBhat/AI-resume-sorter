# TalentAI - Demo Setup Guide

This guide helps you quickly set up and demonstrate TalentAI to stakeholders or for testing purposes.

## Quick Demo (10 minutes)

### Prerequisites
- Both frontend and backend servers running (see QUICKSTART.md)
- Sample resumes and job description ready

### Sample Job Description

Copy this into the job description field:

```
Senior Full-Stack Software Engineer

We are seeking a talented Senior Full-Stack Software Engineer to join our growing team. 

Requirements:
- 5+ years of experience with modern web technologies
- Strong proficiency in JavaScript/TypeScript and React
- Backend experience with Node.js, Python, or Java
- SQL database design and optimization experience
- Cloud platform experience (AWS, GCP, or Azure)
- RESTful API design and implementation
- Microservices architecture understanding
- Docker and containerization experience
- Git and CI/CD pipeline experience

Responsibilities:
- Design and develop scalable web applications
- Architect and maintain backend services
- Collaborate with product and design teams
- Conduct code reviews and mentor junior developers
- Optimize application performance
- Ensure code quality and test coverage

Nice to have:
- Machine learning experience
- DevOps knowledge
- Kubernetes experience
- GraphQL experience
- Agile/Scrum experience
```

### Sample Resumes

Create sample resumes (or use existing ones) with these characteristics:

**High-Scoring Candidate (95%+)**
- Multiple years (5-10) of full-stack experience
- Mentions React, TypeScript, Node.js
- AWS/Cloud experience
- Docker and microservices
- Strong education background
- Recent experience

**Mid-Scoring Candidate (70-85%)**
- 3-4 years experience
- JavaScript/React knowledge
- Some backend experience
- Missing cloud platform experience
- Limited architecture experience

**Low-Scoring Candidate (40-60%)**
- Junior developer (1-2 years)
- Frontend-focused (no backend)
- Limited technologies match
- No cloud experience
- Different technology stack

## Features to Demonstrate

### 1. Upload Interface
- Drag and drop functionality
- Multiple file selection
- File list display
- Form validation

### 2. Processing
- Show loading state
- Explain the analysis process
- Highlight response time
- Note that first run may be slower (model loading)

### 3. Results Display
- Ranking by match percentage
- Color-coded scores
- Extracted skills/experience
- Summary text

### 4. Candidate Details
- Click to open drawer
- Show detailed breakdown
- Highlight matching skills
- Explain AI feedback

## Demo Script

### Introduction (1 minute)
"TalentAI is an AI-powered resume screening platform that intelligently ranks candidates against job descriptions using semantic matching and natural language processing. It combines transformer-based models with NLP to provide accurate, fast candidate evaluation."

### Upload Section (2 minutes)
1. Paste the sample job description
2. Upload 3 sample resumes (drag and drop or browse)
3. Click "Start Analysis"
4. Show loading animation
5. Explain what's happening: "The system is extracting text from PDFs, analyzing semantic similarity, matching skills, and calculating scores"

### Results Display (3 minutes)
1. Show the ranked results
2. Highlight the match percentages
3. Point out the color-coded match bar
4. Show extracted skills and experience tags
5. Explain: "Candidates are ranked by semantic similarity to the job description (70%) plus keyword/skill matching (30%)"

### Candidate Details (2 minutes)
1. Click on a top candidate to open drawer
2. Show the score visualization
3. Highlight extracted information:
   - Skills (in blue)
   - Experience (in purple)
   - Education (in green)
4. Read the AI feedback
5. Show the full resume preview
6. Explain the rating logic

### Key Talking Points

**Technical Excellence:**
- "Built with modern tech: React 19, Next.js 16, FastAPI, and transformers"
- "Uses sentence-transformers for semantic understanding"
- "Includes spaCy for entity extraction and NLP"

**Speed:**
- "Processes multiple resumes in seconds"
- "Lightweight ML models optimized for performance"
- "Can run on standard hardware"

**Accuracy:**
- "Semantic matching understands context, not just keywords"
- "Combines multiple ranking metrics for better results"
- "AI-generated feedback for each candidate"

**Scalability:**
- "No database required (can add later)"
- "Stateless architecture"
- "Easy to deploy and scale"

## Performance Metrics to Highlight

If asked about performance:

```
Typical Processing Time:
- Single resume: 0.5-1 second
- 5 resumes: 2-3 seconds
- 10 resumes: 4-5 seconds

Model Sizes:
- Semantic model: 67MB (cached in memory)
- NER model: 40MB (cached in memory)
- Total overhead: ~107MB

Infrastructure:
- CPU: Any modern processor (ARM/x86)
- RAM: 2GB minimum
- Disk: 200MB for models
```

## Common Questions & Answers

**Q: How accurate is the scoring?**
A: The system provides a good first-pass ranking. The 70/30 split between semantic and keyword matching provides balanced evaluation. For critical decisions, human review is recommended.

**Q: Can it understand domain-specific terms?**
A: Yes, the semantic matching model understands context and can recognize domain-specific patterns. The keyword matching provides additional support for technical terms.

**Q: How does it handle PDF formatting issues?**
A: It extracts raw text using pdfplumber, which handles most PDF formats. Very complex layouts or images in PDFs may not parse perfectly.

**Q: Can it scale to thousands of resumes?**
A: Yes, it can process many resumes sequentially. For very large batches, a queue-based system (like Celery) could be added.

**Q: What are the costs?**
A: The current system has no AI API costs (models run locally). Only infrastructure costs (compute, storage).

**Q: How do we integrate this with our ATS?**
A: The API can be integrated via the `/api/sort-resumes` endpoint. Webhooks could trigger scoring. A dedicated integration layer could be built.

## Troubleshooting During Demo

### System runs slowly
- This is normal on first run (models loading)
- Subsequent requests will be faster
- May be slow on low-end hardware

### "Backend not responding"
- Check if backend is running
- Verify port 8000 is accessible
- Check firewall settings

### PDF extraction fails
- Try with a different PDF
- Ensure PDF is not corrupted
- Check file permissions

### Results don't match expectations
- Review job description (more details = better matching)
- Check if resume contains relevant keywords
- Remember semantic matching looks for meaning, not just keywords

## Demo Data Persistence

Note: Current version doesn't persist results. To keep results:
1. Screenshot the results
2. Export candidate cards
3. Or add a database (see DEPLOYMENT.md)

## Following Up

After the demo:
1. Share repository link
2. Provide setup instructions (QUICKSTART.md)
3. Offer to answer technical questions
4. Discuss customization/integration options
5. Provide deployment guidance (DEPLOYMENT.md)

## Customization Ideas for Your Demo

- Use real job descriptions from your company
- Use real resumes (anonymized) from your hiring pipeline
- Adjust the semantic/keyword balance in scoring
- Add custom skill definitions
- Integrate with your ATS system
- Add result persistence with a database

## Next Steps

1. **Integration**: Connect to your ATS system
2. **Customization**: Add company-specific scoring logic
3. **Scale**: Set up production infrastructure
4. **Enhancement**: Add advanced features
   - Batch processing
   - Custom model training
   - Result analytics dashboard
   - Candidate management
   - Interview scheduling

## Support

For questions or issues during demo:
1. Check QUICKSTART.md for setup help
2. Check README.md for detailed documentation
3. Review error logs in browser console
4. Check backend logs in terminal

Enjoy the demo!
