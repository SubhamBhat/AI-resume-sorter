# Deployment Guide - TalentAI

This guide covers deploying TalentAI to production environments.

## Local Deployment

### Single-Machine Setup

1. **Clone the repository**:
```bash
git clone <repository-url>
cd talentai
```

2. **Deploy Frontend (Next.js)**:
```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Start production server
pnpm start
```

3. **Deploy Backend (FastAPI)**:
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Run FastAPI with production settings
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Docker Deployment

### Docker Setup

1. **Create Dockerfile for Frontend**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

2. **Create Dockerfile for Backend**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install -r requirements.txt
RUN python -m spacy download en_core_web_sm

COPY backend .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

3. **Create docker-compose.yml**:
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - BACKEND_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - DEBUG=false
    volumes:
      - ./backend:/app

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
```

4. **Run Docker Compose**:
```bash
docker-compose up -d
```

## Cloud Deployment

### Vercel (Frontend)

1. **Connect GitHub Repository**:
   - Go to vercel.com
   - Import the GitHub repository
   - Select the project

2. **Configure Environment**:
   - Set `BACKEND_URL` to your backend service URL

3. **Deploy**:
   - Vercel automatically deploys on git push

### Heroku (Backend)

1. **Create Heroku App**:
```bash
heroku create talentai-backend
```

2. **Add Buildpack**:
```bash
heroku buildpacks:add heroku/python
```

3. **Deploy**:
```bash
git push heroku main
```

4. **Scale Dynos** (optional):
```bash
heroku ps:scale web=2
```

### AWS (Full Stack)

#### Backend with EC2:

1. **Launch EC2 Instance**:
   - Ubuntu 22.04 LTS
   - t3.medium or larger (for ML models)
   - Security group: Allow ports 80, 443, 8000

2. **SSH and Setup**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3.11 python3.11-venv python3-pip nginx

# Clone repository
git clone <repo-url>
cd talentai/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Download gunicorn
pip install gunicorn
```

3. **Create Systemd Service** (`/etc/systemd/system/talentai.service`):
```ini
[Unit]
Description=TalentAI FastAPI Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/talentai/backend
ExecStart=/home/ubuntu/talentai/backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:8000 main:app
Restart=always

[Install]
WantedBy=multi-user.target
```

4. **Start Service**:
```bash
sudo systemctl start talentai
sudo systemctl enable talentai
```

#### Frontend with CloudFront + S3:

1. **Build Frontend**:
```bash
npm run build
```

2. **Deploy to S3**:
```bash
aws s3 sync .next/out s3://talentai-frontend/
```

3. **Create CloudFront Distribution**:
   - Origin: S3 bucket
   - Set BACKEND_URL environment variable

### Google Cloud (Backend)

1. **Deploy with Cloud Run**:
```bash
cd backend

# Create container
gcloud builds submit --tag gcr.io/PROJECT_ID/talentai-backend

# Deploy
gcloud run deploy talentai-backend \
  --image gcr.io/PROJECT_ID/talentai-backend \
  --platform managed \
  --region us-central1 \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300
```

## Production Considerations

### Performance
- Use gunicorn or uvicorn with multiple workers
- Enable caching for ML models
- Use CDN for static assets
- Consider model quantization for faster inference

### Security
- Enable HTTPS/TLS
- Set appropriate CORS headers
- Validate and sanitize all inputs
- Use environment variables for sensitive data
- Implement rate limiting

### Monitoring
- Set up logging (e.g., ELK stack)
- Monitor API response times
- Track error rates
- Monitor CPU/memory usage

### Scaling
- Use load balancers for multiple backend instances
- Implement job queue for heavy processing
- Cache results when possible
- Consider serverless options for cost optimization

## Database Integration (Optional Future)

To add persistent storage:

```bash
# Install database packages
pip install sqlalchemy psycopg2-binary alembic

# Create database migrations
alembic init alembic
```

## Environment Variables for Production

### Frontend
```env
BACKEND_URL=https://api.talentai.com
NODE_ENV=production
```

### Backend
```env
DEBUG=false
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=["https://talentai.com", "https://app.talentai.com"]
MAX_RESUMES=100
PROCESSING_TIMEOUT_SECONDS=300
```

## Monitoring & Maintenance

### Health Checks
```bash
# Frontend
curl -f http://localhost:3000 || exit 1

# Backend
curl -f http://localhost:8000/health || exit 1
```

### Log Rotation
Configure logrotate for FastAPI logs:
```bash
/var/log/talentai/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
}
```

### Backup
- Backup any persisted data (if database is added)
- Document model versions in use
- Keep deployment configuration in version control

## Troubleshooting

### High Memory Usage
- Reduce number of workers
- Limit concurrent requests
- Consider model quantization

### Slow Response Times
- Check CPU usage
- Monitor model loading times
- Verify network latency

### PDF Processing Failures
- Check file permissions
- Verify PDF validity
- Monitor disk space

## Support & Updates

For updates and patches:
1. Test in staging environment first
2. Use zero-downtime deployment
3. Monitor deployment metrics
4. Have rollback plan ready
