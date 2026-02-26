# TalentAI - Intelligent Resume Screening Platform

An enterprise-grade AI-powered resume screening and ranking system that uses semantic matching and natural language processing to intelligently rank candidate resumes against job descriptions.

## Features

- **Semantic Matching**: Uses transformer-based models (sentence-transformers) for intelligent resume-to-job matching
- **Named Entity Recognition**: Extracts skills, experience, education, and company names using spaCy
- **PDF Processing**: Reliably extracts text from PDF resumes
- **Intelligent Ranking**: Combines semantic similarity with keyword matching for accurate candidate ranking
- **Modern UI**: Built with React 19, Next.js 16, TypeScript, and Tailwind CSS v4
- **Real-time Feedback**: Provides AI-generated evaluation and feedback for each candidate
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Fast Performance**: In-memory model caching for quick processing

## Architecture

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Components**: Modern, modular React components with proper TypeScript support
- **File Upload**: Drag-and-drop PDF upload with validation
- **State Management**: React hooks with SWR for data fetching

### Backend
- **Framework**: FastAPI (Python)
- **ML Models**:
  - `sentence-transformers` for semantic similarity (all-MiniLM-L6-v2)
  - `spaCy` for named entity recognition and NLP
  - `pdfplumber` for PDF text extraction
- **Performance**: In-memory model caching, chunked processing
- **API**: RESTful API with proper error handling and validation

## Setup & Installation

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.8+ (for backend)
- pnpm or npm (for frontend package management)

### Frontend Setup

1. Install dependencies:
```bash
pnpm install
# or
npm install
```

2. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Download the spaCy model (required for NER):
```bash
python -m spacy download en_core_web_sm
```

5. Run the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

## Environment Variables

### Frontend
Create a `.env.local` file in the project root (optional, only needed if backend is not on localhost:8000):

```
BACKEND_URL=http://localhost:8000
```

### Backend
The backend uses default environment variables. To customize:

```
# Optional: Set BACKEND_URL if frontend is not on localhost:3000
BACKEND_URL=http://localhost:8000
```

## API Endpoints

### POST /api/sort-resumes
Sorts and ranks resumes based on job description match.

**Request:**
- `job_description` (FormData string): Job description text
- `resumes` (FormData files): PDF resume files

**Response:**
```json
{
  "candidates": [
    {
      "id": "uuid",
      "filename": "resume.pdf",
      "score": 0.85,
      "matchPercentage": 85,
      "summary": "Resume summary...",
      "extractedSkills": ["Python", "React", "AWS"],
      "extractedExperience": ["Google", "Meta"],
      "extractedEducation": ["BS Computer Science"],
      "feedback": "Strong semantic match...",
      "rawText": "Full resume text..."
    }
  ],
  "jobDescription": "Job description text...",
  "analysisTime": 2.5
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "TalentAI Resume Screening API"
}
```

## Usage

1. **Start both servers**:
   - Frontend: `pnpm dev` (runs on port 3000)
   - Backend: `uvicorn main:app --reload` (runs on port 8000)

2. **Access the application**:
   - Open `http://localhost:3000` in your browser

3. **Upload resumes**:
   - Paste or type a job description in the job description field
   - Drag and drop PDF resumes or click to select them
   - Click "Start Analysis"

4. **View results**:
   - Candidates are ranked by match percentage
   - Click on any candidate to view detailed information
   - View extracted skills, experience, education, and AI feedback

## Technical Details

### Resume Processing Flow

1. **PDF Extraction**: pdfplumber extracts text from uploaded PDFs
2. **Text Processing**: Text is split into chunks for better processing
3. **Entity Extraction**: spaCy NER extracts named entities (companies, skills, etc.)
4. **Semantic Matching**: Candidate resume embeddings are compared with job description embedding using cosine similarity
5. **Skill Matching**: Keywords and skills are extracted and matched
6. **Scoring**: Combined score (70% semantic, 30% keyword) determines final ranking
7. **Feedback Generation**: AI-generated feedback is created based on analysis

### Performance Optimization

- **Model Caching**: ML models are loaded once and reused across requests
- **Text Chunking**: Large texts are split into chunks for faster embedding computation
- **Lightweight Models**: Uses efficient transformer models optimized for inference
- **In-Memory Storage**: No database, all processing is in-memory

## Model Details

### Semantic Similarity Model
- **Model**: `all-MiniLM-L6-v2` (33M parameters)
- **Dimension**: 384-dimensional embeddings
- **Size**: ~67MB
- **Speed**: Very fast inference on CPU

### NER Model
- **Model**: spaCy `en_core_web_sm`
- **Size**: ~40MB
- **Entities**: PERSON, ORG, GPE, DATE, PRODUCT, etc.

## Limitations & Future Improvements

### Current Limitations
- No persistent storage (results are not saved)
- No authentication/authorization
- Processing limited by available system memory
- Single-threaded processing

### Future Improvements
- Database integration for result persistence
- User authentication and role-based access
- Batch processing queue for large-scale operations
- Multi-threaded/async processing
- Custom model training for specific industries
- Resume parsing improvements
- Integration with ATS systems
- Export functionality (PDF, CSV reports)
- Advanced filtering and search

## Troubleshooting

### Backend not responding
- Ensure FastAPI server is running: `uvicorn main:app --reload`
- Check that port 8000 is not in use
- Verify BACKEND_URL environment variable if needed

### PDF extraction fails
- Ensure PDF file is valid and not corrupted
- Check file size is reasonable (< 50MB)
- Try with a different PDF

### Slow processing
- Processing time depends on resume length and system CPU
- First request may be slower (models are loaded)
- Larger batch of resumes takes longer to process

### spaCy model not found
- Run: `python -m spacy download en_core_web_sm`
- Ensure you're in the backend virtual environment

## License

This project is provided as-is for educational and commercial use.

## Support

For issues or questions, please refer to the documentation or contact support.
