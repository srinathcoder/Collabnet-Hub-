from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import re

app = FastAPI(title="CollabNet Career Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

# Knowledge base: each entry has keywords (ANY match triggers), and a reply
KNOWLEDGE_BASE = [
    # --- Platform Usage ---
    {
        "keywords": ["upload", "resume", "cv"],
        "reply": "📄 **Upload Your Resume:**\nGo to your **Candidate Dashboard** → Click **Upload Resume** → Select a PDF file (max 5MB) → Click **Upload**.\n\nOur AI will automatically parse and extract your skills from the document."
    },
    {
        "keywords": ["apply", "job", "application"],
        "reply": "💼 **Applying to Jobs:**\nOn your **Candidate Dashboard**, scroll to **Available Jobs** → Click **Apply Now** on any job listing.\n\nOur AI will compare your resume against the job description and give you a Match Score."
    },
    {
        "keywords": ["post job", "create job", "new job", "add job"],
        "reply": "📝 **Posting a Job (Recruiters):**\nGo to your **Recruiter Dashboard** → Fill in the job title, description, required skills, and experience → Click **Post Job**.\n\nThe job will be visible to all candidates immediately."
    },
    {
        "keywords": ["score", "match", "percentage", "ranking"],
        "reply": "📊 **AI Match Score:**\nOur AI analyzes your resume against job requirements and generates a percentage score:\n• **80%+** = Excellent match ✅\n• **50-79%** = Good match ⚡\n• **Below 50%** = Needs improvement 📈\n\nThe score considers skills, experience, and keyword relevance."
    },
    {
        "keywords": ["certificate", "verify", "tamper", "fake", "forge"],
        "reply": "🏆 **Certificate Verification:**\nUpload your certificate (PDF/JPG/PNG) on the **Candidate Dashboard**. Our AI uses OCR and URL validation:\n• For **Udemy certificates**, it checks the verification URL\n• It flags potentially **tampered or forged** documents\n• Status can be: verified, suspicious, or tampered"
    },
    {
        "keywords": ["candidate", "applicant", "who applied", "view applicant"],
        "reply": "👥 **Viewing Applicants (Recruiters):**\nGo to your **Recruiter Dashboard** → Under each posted job, you'll see all applicants ranked by Match Score.\n\nYou can **Shortlist**, **Reject**, or **Download** their resumes directly."
    },
    {
        "keywords": ["shortlist", "reject", "hire", "status"],
        "reply": "✅ **Managing Applications:**\n**Recruiters** can update application status:\n• Click **Shortlist** to move candidates forward\n• Click **Reject** to decline\n\nCandidates can see their updated status in **My Applications**."
    },
    {
        "keywords": ["career", "guidance", "roadmap", "path", "domain"],
        "reply": "🚀 **Career Guidance:**\nClick **Career Guide** on your dashboard to explore 6 tech domains:\n• Frontend, Backend, Full-Stack\n• Data Science, AI/ML, DevOps\n\nEach domain has a detailed **step-by-step roadmap**, required skills, certifications, and expert tips."
    },
    {
        "keywords": ["download", "resume download"],
        "reply": "⬇️ **Downloading Resumes (Recruiters):**\nOn your **Recruiter Dashboard**, each applicant has a **Download Resume** button that lets you save their uploaded PDF."
    },
    {
        "keywords": ["login", "sign in", "log in", "account"],
        "reply": "🔐 **Login:**\nGo to the **Login** page → Enter your email and password → Click **Sign In**.\n\nYou'll be redirected to your dashboard based on your role (Candidate, Recruiter, or Admin)."
    },
    {
        "keywords": ["signup", "sign up", "register", "create account", "join"],
        "reply": "📋 **Sign Up:**\nGo to the **Sign Up** page → Enter your name, email, and password → Select your role (Candidate or Recruiter) → Click **Sign Up**.\n\nThen log in with your new credentials."
    },
    {
        "keywords": ["admin", "dashboard", "manage", "overview"],
        "reply": "🛡️ **Admin Dashboard:**\nAdmins can view platform-wide statistics including:\n• Total users, jobs, and applications\n• Suspicious/tampered certificates\n• Full user and job tables"
    },

    # --- Career Advice ---
    {
        "keywords": ["frontend", "front-end", "react", "html", "css", "javascript"],
        "reply": "💻 **Frontend Development:**\nKey skills: HTML5, CSS3, JavaScript (ES6+), React/Vue/Angular, Tailwind CSS.\n\n**Roadmap:**\n1. Master HTML/CSS/JS fundamentals\n2. Learn Git & version control\n3. Pick a framework (React recommended)\n4. Build 3-5 portfolio projects\n5. Learn testing (Jest) and deployment (Vercel)"
    },
    {
        "keywords": ["backend", "back-end", "node", "express", "api", "server"],
        "reply": "⚙️ **Backend Development:**\nKey skills: Node.js/Python, SQL, REST APIs, Authentication, Docker.\n\n**Roadmap:**\n1. Learn Node.js + Express (or Python + FastAPI)\n2. Master SQL (PostgreSQL) & NoSQL (MongoDB)\n3. Build RESTful APIs\n4. Implement JWT authentication\n5. Learn Docker & cloud deployment"
    },
    {
        "keywords": ["full stack", "fullstack", "mern", "pern"],
        "reply": "🚀 **Full-Stack Development:**\nKey skills: MERN/PERN stack, System Design, CI/CD, Cloud.\n\n**Roadmap:**\n1. Learn frontend (React) + backend (Node/Express)\n2. Connect them with APIs (Axios)\n3. Add authentication & file storage\n4. Learn real-time features (Socket.io)\n5. Deploy with CI/CD pipelines"
    },
    {
        "keywords": ["data science", "data analyst", "pandas", "numpy", "tableau"],
        "reply": "📊 **Data Science:**\nKey skills: Python, Pandas, SQL, Visualization, ML basics.\n\n**Roadmap:**\n1. Learn math & statistics foundations\n2. Master Python (Pandas, NumPy)\n3. Advanced SQL & data wrangling\n4. Visualization (Matplotlib, Tableau)\n5. Intro to Machine Learning\n6. Do Kaggle projects"
    },
    {
        "keywords": ["machine learning", "ml", "ai", "artificial intelligence", "deep learning", "neural", "tensorflow", "pytorch"],
        "reply": "🧠 **AI & Machine Learning:**\nKey skills: PyTorch/TensorFlow, NLP, Computer Vision, MLOps.\n\n**Roadmap:**\n1. Learn calculus, statistics & linear algebra\n2. Python + Scikit-Learn\n3. Deep Learning (neural networks)\n4. Specialize: NLP or Computer Vision\n5. MLOps (deployment & monitoring)\n6. Explore Hugging Face & LLMs"
    },
    {
        "keywords": ["devops", "docker", "kubernetes", "ci/cd", "cloud", "aws", "terraform"],
        "reply": "☁️ **DevOps & Cloud:**\nKey skills: Linux, Docker, Kubernetes, CI/CD, AWS/GCP, Terraform.\n\n**Roadmap:**\n1. Master Linux & terminal\n2. Learn networking & security\n3. Docker & Kubernetes\n4. Infrastructure as Code (Terraform)\n5. CI/CD (GitHub Actions)\n6. AWS/GCP professional patterns"
    },

    # --- General Help ---
    {
        "keywords": ["help", "how", "what can", "features", "do"],
        "reply": "👋 **Here's what I can help with:**\n\n• 📄 How to upload resumes\n• 💼 How to apply to jobs\n• 📊 Understanding match scores\n• 🏆 Certificate verification\n• 🚀 Career guidance & roadmaps\n• 📝 How to post jobs (recruiters)\n• 👥 Viewing applicants (recruiters)\n\nJust ask me anything about using CollabNet Hub!"
    },
    {
        "keywords": ["thank", "thanks", "great", "awesome", "perfect", "cool"],
        "reply": "😊 You're welcome! Let me know if you need anything else. Happy to help!"
    },
    {
        "keywords": ["hello", "hi", "hey", "good morning", "good evening"],
        "reply": "👋 Hello! Welcome to CollabNet Hub! How can I help you today?\n\nYou can ask me about uploading resumes, applying to jobs, career guidance, or anything else about the platform."
    },
]

def generate_bot_reply(message: str) -> str:
    msg = message.lower().strip()

    # Check each knowledge entry
    best_match = None
    best_score = 0

    for entry in KNOWLEDGE_BASE:
        score = 0
        for keyword in entry["keywords"]:
            if keyword in msg:
                # Longer keyword matches get higher priority
                score += len(keyword)
        if score > best_score:
            best_score = score
            best_match = entry

    if best_match and best_score > 0:
        return best_match["reply"]

    # Fallback
    return (
        "🤔 I'm not sure about that, but I can help with:\n\n"
        "• **Resume uploads** – How to upload and parse your resume\n"
        "• **Job applications** – How to apply and check your match score\n"
        "• **Career guidance** – Roadmaps for Frontend, Backend, AI/ML, etc.\n"
        "• **Certificate verification** – How the AI checks your certificates\n"
        "• **Recruiter tools** – Posting jobs and managing applicants\n\n"
        "Try asking one of these topics!"
    )

@app.post("/chatbot/ask")
async def ask_chatbot(request: ChatRequest):
    try:
        reply = generate_bot_reply(request.message)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@app.get("/")
async def root():
    return {"status": "CollabNet Chatbot Service is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)
