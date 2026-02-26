# TalentAI - Quick Start Guide

Get TalentAI up and running in minutes!

## Prerequisites

- Node.js 18+ (download from nodejs.org)
- Python 3.8+ (download from python.org)
- pnpm (install with `npm install -g pnpm`) or npm

## Installation (5 minutes)

### Step 1: Install Frontend Dependencies

```bash
# From the project root directory
pnpm install
# or: npm install
```

### Step 2: Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Create a Python virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Download required spaCy model (this may take a few minutes)
python -m spacy download en_core_web_sm

# Return to project root
cd ..
```

## Running Locally

### Terminal 1: Start Frontend
```bash
pnpm dev
```
Frontend will be available at: http://localhost:3000

### Terminal 2: Start Backend
```bash
cd backend

# Make sure virtual environment is activated
source venv/bin/activate  # or: venv\Scripts\activate on Windows

# Start FastAPI server
uvicorn main:app --reload
```
Backend will be available at: http://localhost:8000

## First Time Setup Complete!

Visit http://localhost:3000 and start screening resumes!

### How to Use:

1. **Enter Job Description**: Paste or type the job description in the text area
2. **Upload Resumes**: 
   - Drag and drop PDF files
   - Or click to browse and select PDFs
3. **Click "Start Analysis"**: Wait for processing to complete
4. **View Results**: See ranked candidates with scores
5. **Click Candidate Cards**: View detailed information, skills, experience, and education

## Common Issues & Solutions

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

### Backend won't start
```bash
# Ensure you're in the backend directory
cd backend

# Activate virtual environment
source venv/bin/activate

# Try starting again
uvicorn main:app --reload
```

### spaCy model missing error
```bash
# In backend directory with venv activated
python -m spacy download en_core_web_sm
```

### "Cannot connect to backend" error
- Ensure backend is running on port 8000
- Check if firewall is blocking connections
- Verify BACKEND_URL in frontend is correct

### PDF upload fails
- Ensure file is a valid PDF (not scanned image)
- Check file size is reasonable (< 50MB)
- Try with a different PDF

### Processing is very slow
- First request is slower (models are loading)
- Slow CPU = slower processing
- Larger resumes take longer to analyze
- This is normal! Subsequent requests will be faster.

## Development Workflow

### Making Changes

**Frontend Changes:**
- Edit files in `components/`, `app/`, etc.
- Changes auto-reload at http://localhost:3000

**Backend Changes:**
- Edit files in `backend/processors/`, `backend/main.py`
- Changes auto-reload with `--reload` flag

### Testing the API Directly

```bash
curl -X POST http://localhost:8000/api/sort-resumes \
  -F "job_description=Senior Software Engineer" \
  -F "resumes=@resume1.pdf" \
  -F "resumes=@resume2.pdf"
```

## Next Steps

1. **Try Sample Resumes**: 
   - Use your own resumes or create test PDFs
   - The system works best with actual resumes

2. **Explore the Code**:
   - Frontend: `components/`, `app/page.tsx`
   - Backend: `backend/main.py`, `backend/processors/`

3. **Customize**:
   - Adjust styling in `app/globals.css` and Tailwind config
   - Modify scoring logic in `backend/processors/scorer.py`
   - Update job description examples

4. **Deploy** (when ready):
   - See `DEPLOYMENT.md` for production deployment options
   - Supports Docker, Vercel, AWS, GCP, Heroku, and more

## Performance Tips

- **Faster Processing**: Shorter resumes = faster analysis
- **Better Matches**: More detailed job descriptions = better scoring
- **Lower Memory**: Process resumes in batches instead of all at once

## Project Structure

```
talentai/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   ├── api/
│   │   └── sort-resumes/   # API route proxy
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Header component
│   ├── InputSection.tsx    # Upload form
│   ├── ResultsGrid.tsx     # Results list
│   └── CandidateDrawer.tsx # Detailed view
├── types/
│   └── index.ts            # TypeScript types
├── backend/
│   ├── main.py             # FastAPI app
│   ├── processors/
│   │   ├── resume_processor.py  # PDF extraction
│   │   └── scorer.py            # Resume scoring
│   └── requirements.txt     # Python dependencies
├── public/                 # Static assets
├── package.json            # Frontend dependencies
├── tsconfig.json           # TypeScript config
└── README.md               # Full documentation
```

## Key Technologies

**Frontend:**
- React 19 + Next.js 16
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Lucide React icons
- Sonner notifications

**Backend:**
- FastAPI (Python)
- Sentence Transformers (semantic matching)
- spaCy (NLP/NER)
- pdfplumber (PDF processing)

## Deployment Checklist

Before going to production:
- [ ] Test with various resume formats
- [ ] Test with large batches of resumes
- [ ] Configure environment variables
- [ ] Set up monitoring/logging
- [ ] Enable HTTPS
- [ ] Set up backups (if using database)
- [ ] Load test the system

## Getting Help

1. **Check README.md** for detailed documentation
2. **Check DEPLOYMENT.md** for deployment options
3. **Review error messages** in browser console and backend logs
4. **Search issues** in GitHub (if applicable)

## What's Next?

- Add database for result persistence
- Add user authentication
- Create admin dashboard
- Build REST API for integrations
- Add more ML models
- Implement batch processing queue

Good luck! Happy screening resumes!
