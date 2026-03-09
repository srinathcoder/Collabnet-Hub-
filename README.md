# CollabNet Hub

CollabNet Hub is an AI-driven recruitment and career guidance platform that connects candidates and recruiters. It utilizes AI to automate resume screening, detect certificate tampering, analyze career readiness, and provide intelligent career guidance through a chatbot.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Redux Toolkit, Axios, React Router, Vite
- **Backend**: Node.js, Express.js, MongoDB, JWT
- **AI Services**: Python, FastAPI, Scikit-learn, spaCy, NLTK, OpenCV, Tesseract OCR

## Directory Structure
- `/frontend`: React application
- `/backend`: Node.js/Express API service
- `/ai-services`: Python FastAPI microservices (Resume Analyzer, Certificate Detector, Chatbot)

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB (Local or Atlas)
- Tesseract OCR (Install executable and add to PATH)

### 1. Database Setup
Ensure MongoDB is running locally or provide a MongoDB Atlas URI.

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/collabnet
JWT_SECRET=your_super_secret_key
AI_SERVICE_URL=http://localhost:8001
CHATBOT_SERVICE_URL=http://localhost:8003
```
Run the backend:
```bash
npm run dev
```

### 3. AI Services Setup
```bash
cd ai-services
python -m venv collab-ai-env
# Windows: collab-ai-env\Scripts\activate
# Mac/Linux: source collab-ai-env/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m nltk.downloader punkt stopwords wordnet
```
Run the services (in separate terminals if needed):
```bash
# Resume Analyzer
cd resume_analyzer
uvicorn main:app --host 0.0.0.0 --port 8001 --reload

# Certificate Detector
cd certificate_detector
uvicorn main:app --host 0.0.0.0 --port 8002 --reload

# Chatbot
cd chatbot
uvicorn main:app --host 0.0.0.0 --port 8003 --reload
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```
Run the frontend:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

## Database Schema Highlights
- **User**: name, email, password, role (candidate/recruiter/admin), resumes, certificates
- **Job**: title, description, skills, experience, postedBy
- **Application**: jobId, candidateId, status, resumeScore, skillMatch
- **Resume**: filePath, skills, extractedText, uploadedAt
- **Certificate**: filePath, verificationStatus (verified/suspicious/tampered), ocrText
- **ChatbotLog**: message, sender, timestamp

## API Endpoints Overview
- `POST /api/v1/auth/register` (Public)
- `POST /api/v1/auth/login` (Public)
- `POST /api/v1/jobs/create` (Recruiter)
- `GET /api/v1/jobs` (Public/Candidate)
- `POST /api/v1/applications/apply` (Candidate)
- `POST /api/v1/resume/upload` (Candidate)
- `POST /api/v1/certificate/verify` (Candidate)
- `POST /api/v1/chatbot/ask` (Candidate)
