# TalentAI - Developer Checklist

Use this checklist to verify the project is properly set up and working.

## Pre-Setup Verification

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Python 3.8+ installed (`python --version`)
- [ ] pnpm installed (`pnpm --version`)
- [ ] Git installed (`git --version`)
- [ ] Text editor/IDE available (VS Code recommended)
- [ ] 2GB+ free disk space
- [ ] 4GB+ available RAM

## Frontend Setup

- [ ] Navigate to project root: `cd talentai`
- [ ] Install dependencies: `pnpm install`
- [ ] No installation errors in terminal
- [ ] `node_modules` folder created
- [ ] `.next` folder will be created on first build

## Backend Setup

- [ ] Navigate to backend: `cd backend`
- [ ] Create virtual environment: `python -m venv venv`
- [ ] Activate venv: `source venv/bin/activate` (or `venv\Scripts\activate`)
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Download spaCy model: `python -m spacy download en_core_web_sm`
- [ ] No errors in pip installation
- [ ] spaCy model downloaded (367MB)
- [ ] Confirm models are cached: `python -c "import spacy; spacy.load('en_core_web_sm')"`

## Starting Services

### Frontend Service
- [ ] Terminal 1: Navigate to project root
- [ ] Run: `pnpm dev`
- [ ] Output shows: "ready - started server on 0.0.0.0:3000"
- [ ] No errors in console
- [ ] Frontend accessible at http://localhost:3000

### Backend Service
- [ ] Terminal 2: Navigate to backend directory
- [ ] Ensure venv activated
- [ ] Run: `uvicorn main:app --reload`
- [ ] Output shows: "Application startup complete"
- [ ] Backend accessible at http://localhost:8000
- [ ] Health check works: `curl http://localhost:8000/health`

## UI Verification

### Homepage
- [ ] Page loads without errors
- [ ] Header displays "TalentAI" with logo
- [ ] Job description textarea visible
- [ ] File upload area visible
- [ ] "Start Analysis" button visible and disabled (until inputs filled)

### Job Description Input
- [ ] Can type in textarea
- [ ] Text is visible and formatted correctly
- [ ] Placeholder text visible
- [ ] Textarea scrolls if content overflows

### File Upload
- [ ] Drag-and-drop area visible
- [ ] Can drag PDF files into area
- [ ] Visual feedback when dragging (color change)
- [ ] Can click to open file browser
- [ ] File browser opens (browser dependent)
- [ ] Can select multiple PDF files
- [ ] Selected files display in list
- [ ] Can remove files individually (× button works)
- [ ] File names show correctly

### Button Behavior
- [ ] "Start Analysis" button disabled when inputs empty
- [ ] "Start Analysis" button enabled with valid inputs
- [ ] Button shows loading state when clicked
- [ ] Button text changes to "Analyzing Resumes..."
- [ ] Loading spinner visible

## API Integration

### Frontend-Backend Communication
- [ ] Open browser developer console (F12)
- [ ] Go to Network tab
- [ ] Submit a valid form
- [ ] POST request to `/api/sort-resumes` should appear
- [ ] Request status should be 200 (success)
- [ ] Response contains JSON with `candidates` array

### Error Handling
- [ ] Submit without job description → error message appears
- [ ] Submit without resumes → error message appears
- [ ] Try with non-PDF file → error message appears
- [ ] Error messages display as toast notifications (top of screen)

## Results Display

### Results View
- [ ] After successful submission, results grid appears
- [ ] "Candidate Results" header visible
- [ ] "New Analysis" button visible
- [ ] Number of candidates shown correctly

### Result Cards
- [ ] Cards display in list format
- [ ] Rank number visible (#1, #2, etc.)
- [ ] Filename displays
- [ ] Match percentage shows (0-100%)
- [ ] Progress bar displays and fills to match percentage
- [ ] Color matches percentage (green for high, orange for medium)
- [ ] Summary text visible (truncated to 2 lines)
- [ ] Skill tags visible (blue badges)
- [ ] Experience tags visible (purple badges)
- [ ] Education tags visible (green badges)
- [ ] Clicking card doesn't cause errors

## Candidate Drawer

### Opening Drawer
- [ ] Click on a candidate card
- [ ] Drawer slides in from right (animated)
- [ ] Backdrop appears (semi-transparent black)
- [ ] Close button (×) visible in header
- [ ] "Candidate Details" header visible

### Drawer Content
- [ ] Match score displayed large (percentage)
- [ ] Score bar visible
- [ ] Resume filename displayed
- [ ] Summary text visible
- [ ] Skills section with skill badges
- [ ] Experience section with experience items
- [ ] Education section with education items
- [ ] AI Evaluation section with feedback text
- [ ] Full Resume Text section with truncated text

### Drawer Interactions
- [ ] Can scroll through drawer content
- [ ] Close button closes drawer (animated)
- [ ] Clicking backdrop closes drawer
- [ ] ESC key closes drawer
- [ ] Body scroll disabled when drawer open
- [ ] Body scroll restored when drawer closed
- [ ] Drawer content doesn't overflow (scrollable internally)

## "New Analysis" Button
- [ ] Button appears in results view
- [ ] Clicking button returns to input view
- [ ] All previous data clears
- [ ] New upload form is ready

## Console Messages

### Browser Console (F12)
- [ ] No JavaScript errors
- [ ] No console errors in red
- [ ] May see normal warnings (acceptable)

### Backend Console
- [ ] POST requests logged
- [ ] No Python errors
- [ ] Processing time logged
- [ ] No uncaught exceptions

## Performance Testing

### Single Resume Upload
- [ ] Upload 1 resume
- [ ] Processing completes in <2 seconds
- [ ] Results display correctly
- [ ] Match percentage is reasonable (30-95%)

### Multiple Resume Upload
- [ ] Upload 3-5 resumes
- [ ] All resumes processed
- [ ] Ranked in descending order by match %
- [ ] No processing errors
- [ ] Processing time reasonable (under 10 seconds)

### Large Resume
- [ ] Try uploading a large PDF (>5MB)
- [ ] Processing works (may be slower)
- [ ] No crash or freeze

## Responsive Design

### Desktop (1920px+)
- [ ] Layout looks clean and organized
- [ ] Two-column layout may be visible
- [ ] All elements properly sized
- [ ] No text overflow

### Tablet (768px-1024px)
- [ ] Single column layout
- [ ] Elements stack properly
- [ ] Drawer still works
- [ ] Touch interactions responsive

### Mobile (< 768px)
- [ ] Header adapts to mobile
- [ ] Form inputs full width
- [ ] File list scrollable horizontally
- [ ] Drawer full screen or fullscreen overlay
- [ ] All buttons touchable (large enough)
- [ ] No horizontal scroll

## Browser Compatibility

Test in major browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Accessibility

- [ ] Can navigate with keyboard (Tab key)
- [ ] Can use keyboard to submit form (Enter)
- [ ] Focus indicators visible
- [ ] Button states clear
- [ ] Error messages clear and helpful

## Data Validation

### Job Description Validation
- [ ] Accepts any text
- [ ] Trims whitespace
- [ ] Rejects empty/whitespace-only

### File Upload Validation
- [ ] Rejects non-PDF files (error message)
- [ ] Accepts PDF files
- [ ] Validates file size
- [ ] Shows error for corrupted PDFs

### API Response Validation
- [ ] All candidates have required fields
- [ ] Match percentages are 0-100
- [ ] Skills array is not empty
- [ ] Feedback text is readable

## Documentation Verification

- [ ] README.md exists and is complete
- [ ] QUICKSTART.md exists and is accurate
- [ ] DEPLOYMENT.md exists with options
- [ ] DEMO.md exists with demo script
- [ ] .env.example exists with variables
- [ ] PROJECT_SUMMARY.md explains architecture
- [ ] Code has inline comments
- [ ] No TODOs left in code

## Optional: Advanced Verification

### Database Integration (if adding)
- [ ] Database connection string configured
- [ ] Tables created
- [ ] Results persist after page reload
- [ ] Can view historical results

### Authentication (if adding)
- [ ] Login page accessible
- [ ] Can create account
- [ ] Can log in
- [ ] Protected routes work
- [ ] Session persists

### Monitoring (if deploying)
- [ ] Error logging configured
- [ ] Performance monitoring active
- [ ] Health checks passing
- [ ] Metrics dashboards visible

## Deployment Readiness

- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables configured
- [ ] BACKEND_URL set correctly
- [ ] Ports not conflicting
- [ ] File permissions correct
- [ ] No hardcoded secrets
- [ ] Ready for production deployment

## Common Issues & Fixes

### Issue: "Backend not responding"
- [ ] Solution: Check backend is running on port 8000
- [ ] Solution: Verify BACKEND_URL env variable
- [ ] Solution: Check firewall settings

### Issue: "PDF extraction failed"
- [ ] Solution: Try different PDF
- [ ] Solution: Check file is not corrupted
- [ ] Solution: Verify file permissions

### Issue: "Module not found" (Python)
- [ ] Solution: Ensure venv is activated
- [ ] Solution: Run `pip install -r requirements.txt` again
- [ ] Solution: Check Python version (3.8+)

### Issue: "Cannot find module" (TypeScript)
- [ ] Solution: Run `pnpm install` again
- [ ] Solution: Delete `node_modules` and `pnpm-lock.yaml`
- [ ] Solution: Verify Node.js version (18+)

### Issue: "spaCy model not found"
- [ ] Solution: Run `python -m spacy download en_core_web_sm`
- [ ] Solution: Check disk space (367MB needed)

### Issue: "Port already in use"
- [ ] Solution: Kill process on port 3000: `lsof -ti:3000 | xargs kill`
- [ ] Solution: Kill process on port 8000: `lsof -ti:8000 | xargs kill`
- [ ] Solution: Use different ports if needed

## Sign-Off

When all items are checked:
- [ ] Project is properly set up
- [ ] All features working
- [ ] Performance is acceptable
- [ ] Documentation is complete
- [ ] Ready for use/deployment

---

**Setup Date**: _______________
**Verified By**: _______________
**Notes**: _______________________________________________________________

