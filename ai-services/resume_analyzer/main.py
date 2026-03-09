from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
from io import BytesIO
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
import uvicorn

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

nlp = spacy.load("en_core_web_sm")

app = FastAPI(title="CollabNet Resume Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF parsing error: {str(e)}")

def clean_text(text: str) -> str:
    text = re.sub(r'[^a-zA-Z\s]', '', text.lower())
    tokens = word_tokenize(text)
    tokens = [lemmatizer.lemmatize(token) for token in tokens if token not in stop_words]
    return ' '.join(tokens)

def extract_skills(text: str) -> list:
    doc = nlp(text)
    # Simple rule-based + common skills list (expand later)
    common_skills = [
        'python', 'javascript', 'react', 'node.js', 'java', 'sql', 'mongodb', 'aws', 'docker',
        'html', 'css', 'tailwind', 'typescript', 'angular', 'vue', 'django', 'flask', 'spring'
    ]
    found = set()
    for token in doc:
        if token.text.lower() in common_skills:
            found.add(token.text.lower())
    return list(found)

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        content = await resume.read()
        raw_text = extract_text_from_pdf(content)
        cleaned_resume = clean_text(raw_text)
        cleaned_job = clean_text(job_description)

        resume_skills = extract_skills(cleaned_resume)
        job_skills = extract_skills(cleaned_job)

        # TF-IDF similarity
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([cleaned_resume, cleaned_job])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        score = round(similarity * 100, 1)

        matched = [s for s in job_skills if s in resume_skills]
        missing = [s for s in job_skills if s not in resume_skills]

        return {
            "score": score,
            "matched_skills": matched,
            "missing_skills": missing,
            "extracted_resume_skills": resume_skills[:20],  # top 20 for preview
            "resume_preview": raw_text[:500] + "..." if len(raw_text) > 500 else raw_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# Domain-Specific Resume Review
# ──────────────────────────────────────────────

DOMAIN_SKILLS = {
    "frontend": {
        "core": ["html", "css", "javascript", "typescript", "react", "vue", "angular", "next.js", "tailwind", "sass", "bootstrap", "webpack", "vite"],
        "bonus": ["figma", "responsive", "accessibility", "a11y", "seo", "jest", "testing", "storybook", "graphql", "redux", "zustand"],
        "title": "Frontend Development",
    },
    "backend": {
        "core": ["node.js", "express", "python", "django", "flask", "fastapi", "java", "spring", "sql", "postgresql", "mysql", "mongodb", "rest", "api", "graphql"],
        "bonus": ["redis", "docker", "nginx", "authentication", "jwt", "oauth", "microservices", "rabbitmq", "kafka", "grpc"],
        "title": "Backend Development",
    },
    "fullstack": {
        "core": ["html", "css", "javascript", "react", "node.js", "express", "mongodb", "sql", "api", "git"],
        "bonus": ["typescript", "docker", "aws", "ci/cd", "system design", "redis", "graphql", "next.js", "testing", "deployment"],
        "title": "Full-Stack Development",
    },
    "data-science": {
        "core": ["python", "pandas", "numpy", "sql", "matplotlib", "statistics", "machine learning", "data visualization", "jupyter"],
        "bonus": ["tableau", "power bi", "scikit-learn", "r", "spark", "hadoop", "deep learning", "nlp", "tensorflow", "seaborn"],
        "title": "Data Science",
    },
    "ml-ai": {
        "core": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "numpy", "scikit-learn", "neural network"],
        "bonus": ["nlp", "computer vision", "hugging face", "transformers", "llm", "reinforcement learning", "mlops", "kubernetes", "docker", "aws sagemaker"],
        "title": "AI & Machine Learning",
    },
    "devops": {
        "core": ["linux", "docker", "kubernetes", "ci/cd", "aws", "terraform", "ansible", "jenkins", "bash", "git"],
        "bonus": ["gcp", "azure", "prometheus", "grafana", "helm", "nginx", "cloudformation", "github actions", "gitlab ci", "monitoring"],
        "title": "DevOps & Cloud",
    },
}

from pydantic import BaseModel as PydanticBaseModel

class DomainReviewRequest(PydanticBaseModel):
    resume_text: str
    domain: str

@app.post("/domain-review")
async def domain_review(request: DomainReviewRequest):
    try:
        domain = request.domain.lower()
        resume_text = request.resume_text.lower()

        if domain not in DOMAIN_SKILLS:
            raise HTTPException(400, detail=f"Unknown domain: {domain}")

        domain_info = DOMAIN_SKILLS[domain]
        core_skills = domain_info["core"]
        bonus_skills = domain_info["bonus"]
        domain_title = domain_info["title"]

        # Check which skills are found
        found_core = [s for s in core_skills if s in resume_text]
        missing_core = [s for s in core_skills if s not in resume_text]
        found_bonus = [s for s in bonus_skills if s in resume_text]
        missing_bonus = [s for s in bonus_skills if s not in resume_text]

        total_core = len(core_skills)
        found_core_count = len(found_core)
        score = round((found_core_count / total_core) * 100) if total_core > 0 else 0

        # Generate feedback
        strengths = []
        improvements = []

        if found_core:
            strengths.append(f"Your resume mentions {found_core_count}/{total_core} core {domain_title} skills: {', '.join(found_core)}")
        if found_bonus:
            strengths.append(f"Great bonus skills found: {', '.join(found_bonus)}")

        if missing_core:
            improvements.append(f"Add these essential {domain_title} skills if you have them: {', '.join(missing_core)}")
        if missing_bonus:
            top_missing = missing_bonus[:5]
            improvements.append(f"Consider adding these in-demand skills: {', '.join(top_missing)}")

        # General resume tips based on content analysis
        if len(resume_text) < 300:
            improvements.append("Your resume seems very short. Add more detail about your projects, experience, and achievements.")
        if "project" not in resume_text and "built" not in resume_text and "developed" not in resume_text:
            improvements.append("Add specific projects you've built. Recruiters love seeing hands-on experience.")
        if "github" not in resume_text and "portfolio" not in resume_text:
            improvements.append("Include links to your GitHub profile or portfolio website.")
        if "certified" not in resume_text and "certification" not in resume_text:
            improvements.append(f"Consider getting a {domain_title} certification to strengthen your profile.")

        # Rating
        if score >= 80:
            rating = "Excellent"
            summary = f"Your resume is very well-aligned with {domain_title} roles!"
        elif score >= 60:
            rating = "Good"
            summary = f"Your resume shows solid {domain_title} potential, with room for improvement."
        elif score >= 40:
            rating = "Fair"
            summary = f"Your resume has some {domain_title} skills but needs significant additions."
        else:
            rating = "Needs Work"
            summary = f"Your resume needs more {domain_title}-specific skills and experience."

        return {
            "domain": domain_title,
            "score": score,
            "rating": rating,
            "summary": summary,
            "strengths": strengths,
            "improvements": improvements,
            "found_core_skills": found_core,
            "missing_core_skills": missing_core,
            "found_bonus_skills": found_bonus,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)