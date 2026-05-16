from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import cv2
import numpy as np
import fitz  # PyMuPDF
from io import BytesIO
import uvicorn
import os
import re

# ---------------------------------------------------------------------------
# Optional pytesseract import — only used if Tesseract binary is available
# ---------------------------------------------------------------------------
TESSERACT_AVAILABLE = False
try:
    import pytesseract
    # On Windows, Tesseract must be at a known path
    if os.name == "nt":
        _win_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        if os.path.isfile(_win_path):
            pytesseract.pytesseract.tesseract_cmd = _win_path
            TESSERACT_AVAILABLE = True
        else:
            TESSERACT_AVAILABLE = False
    else:
        # On Linux/Docker tesseract should be in PATH
        import subprocess
        result = subprocess.run(["tesseract", "--version"], capture_output=True)
        TESSERACT_AVAILABLE = result.returncode == 0
except Exception:
    TESSERACT_AVAILABLE = False

app = FastAPI(title="CollabNet Certificate Detector")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Text extraction helpers
# ---------------------------------------------------------------------------

def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF using PyMuPDF (no Tesseract needed)."""
    try:
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text() or ""
        doc.close()
        return text.strip()
    except Exception as e:
        raise HTTPException(400, f"PDF parsing error: {str(e)}")


def extract_text_from_image(content: bytes) -> str:
    """
    Extract text from an image.
    - If Tesseract is available, use pytesseract OCR.
    - Otherwise, return an empty string and rely on visual checks only.
    """
    if not TESSERACT_AVAILABLE:
        return ""
    try:
        img = Image.open(BytesIO(content))
        text = pytesseract.image_to_string(img)
        return text.strip()
    except Exception:
        return ""


# ---------------------------------------------------------------------------
# Verification logic
# ---------------------------------------------------------------------------

# Certificate-related keyword patterns
CERT_KEYWORDS = re.compile(
    r"(certificat|award|complet|achiev|accreditat|license|diploma|verif|credential|"
    r"udemy|coursera|linkedin|edx|pluralsight|microsoft|google|amazon|aws|"
    r"congratulation|hereby|certif)",
    re.IGNORECASE,
)

UDEMY_URL_PATTERN = re.compile(
    r"(ude\.my/[\w-]+|udemy\.com/certificate/[\w-]+)", re.IGNORECASE
)


def verify_image(content: bytes, text: str) -> dict:
    """Analyse image bytes for certificate authenticity."""
    # 1. URL check (text from OCR if available)
    udemy_match = UDEMY_URL_PATTERN.search(text)
    if udemy_match:
        return {
            "status": "verified",
            "reason": f"Valid Udemy Certificate URL found: {udemy_match.group(0)}",
        }

    # 2. Keyword check
    if text and CERT_KEYWORDS.search(text):
        return {
            "status": "verified",
            "reason": "Certificate keywords detected in document text",
        }

    # 3. Visual integrity check (OpenCV)
    img_array = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if img is None:
        return {"status": "tampered", "reason": "Could not decode image — invalid or corrupt file"}

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

    # Very blurry images often indicate a low-quality scan or screenshot of an edited doc
    if laplacian_var < 20:
        return {
            "status": "suspicious",
            "reason": f"Image sharpness too low (score: {laplacian_var:.1f}) — possible compression or tampering",
        }
    # Extremely high noise can indicate heavy digital editing
    if laplacian_var > 3000:
        return {
            "status": "suspicious",
            "reason": f"Unusual image noise detected (score: {laplacian_var:.1f}) — possible editing artifacts",
        }

    if TESSERACT_AVAILABLE:
        # We ran OCR but found no keywords — inconclusive
        return {
            "status": "suspicious",
            "reason": "No certificate keywords or verified URL found in image text",
        }
    else:
        # No OCR available — visual check passed, report as likely valid
        return {
            "status": "verified",
            "reason": f"Image appears visually authentic (sharpness score: {laplacian_var:.1f}). OCR unavailable on this server.",
        }


def verify_pdf(content: bytes, text: str) -> dict:
    """Analyse PDF bytes for certificate authenticity."""
    # 1. URL check
    udemy_match = UDEMY_URL_PATTERN.search(text)
    if udemy_match:
        return {
            "status": "verified",
            "reason": f"Valid Udemy Certificate URL found: {udemy_match.group(0)}",
        }

    # 2. Keyword check
    if text and CERT_KEYWORDS.search(text):
        return {
            "status": "verified",
            "reason": "Certificate keywords detected in document text",
        }

    # 3. Metadata check
    try:
        doc = fitz.open(stream=content, filetype="pdf")
        metadata = doc.metadata or {}
        doc.close()
        producer = metadata.get("producer", "")
        creator = metadata.get("creator", "")
        if not producer and not creator:
            return {
                "status": "suspicious",
                "reason": "PDF has no metadata — may be a regenerated or tampered document",
            }
        return {
            "status": "verified",
            "reason": f"PDF structure intact — producer: {producer or 'unknown'}, creator: {creator or 'unknown'}",
        }
    except Exception as e:
        return {"status": "tampered", "reason": f"PDF metadata analysis failed: {str(e)}"}


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def health():
    return {
        "status": "ok",
        "service": "CollabNet Certificate Detector",
        "tesseract_ocr": TESSERACT_AVAILABLE,
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "tesseract_available": TESSERACT_AVAILABLE,
    }


@app.post("/verify")
async def verify_certificate(certificate: UploadFile = File(...)):
    try:
        content = await certificate.read()
        filename = (certificate.filename or "").lower()

        is_pdf = filename.endswith(".pdf")
        is_image = filename.endswith((".jpg", ".jpeg", ".png"))

        if not (is_pdf or is_image):
            raise HTTPException(400, detail="Only PDF, JPG, PNG files are allowed")

        if is_pdf:
            text = extract_text_from_pdf(content)
            result = verify_pdf(content, text)
        else:
            text = extract_text_from_image(content)
            result = verify_image(content, text)

        preview = str(text)
        if len(preview) > 500:
            preview = preview[:500] + "..."

        return {
            "status": result["status"],
            "reason": result["reason"],
            "ocr_text": preview,
            "file_name": certificate.filename,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, detail=f"Unexpected error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)