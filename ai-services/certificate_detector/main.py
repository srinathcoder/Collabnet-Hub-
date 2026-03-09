from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pytesseract 
from PIL import Image
import io
import cv2
import numpy as np
import fitz  # PyMuPDF
from io import BytesIO
import uvicorn

app = FastAPI(title="CollabNet Certificate Detector")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # ← CHANGE THIS PATH if different

import re

def extract_text_from_pdf(content: bytes) -> str:
    try:
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text() or ""
        return text.strip()
    except Exception as e:
        raise HTTPException(400, f"PDF error: {str(e)}")

def extract_text_from_image(content: bytes) -> str:
    try:
        img = Image.open(BytesIO(content))
        text = pytesseract.image_to_string(img)
        return text.strip()
    except Exception as e:
        raise HTTPException(400, f"Image OCR error: {str(e)}")

def detect_tampering_basic(content: bytes, text: str, is_image: bool = True) -> dict:
    """
    Checks for Udemy URLs first, heavily relying on them for verification.
    Fallback to basic variance checks if no URL is found mapping.
    """
    try:
        # 1. URL Pattern matching for Udemy
        udemy_match = re.search(r'(ude\.my/[\w-]+|udemy\.com/certificate/[\w-]+)', text, re.IGNORECASE)
        if udemy_match:
            return {'status': 'verified', 'reason': f'Valid Udemy Certificate URL found: {udemy_match.group(0)}'}

        # 2. Fallback checks
        if is_image:
            img_array = np.frombuffer(content, np.uint8)
            img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            if img is None:
                return {'status': 'tampered', 'reason': 'Invalid image format'}

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

            if laplacian_var < 50:
                return {'status': 'suspicious', 'reason': 'Low variance - possible compression/tampering'}
            if laplacian_var > 300:
                return {'status': 'suspicious', 'reason': 'High noise - possible editing'}
            
            return {'status': 'verified', 'reason': 'Document appears visually authentic but no URL found'}
        else:
            # PDF - simple metadata check using PyMuPDF
            doc = fitz.open(stream=content, filetype="pdf")
            metadata = doc.metadata
            if metadata is None or not metadata.get('producer'):
                return {'status': 'suspicious', 'reason': 'Missing or invalid metadata'}
            return {'status': 'verified', 'reason': 'Document structure intact but no URL found'}
    except Exception as e:
        return {'status': 'tampered', 'reason': f'Analysis failed: {str(e)}'}

@app.post("/verify")
async def verify_certificate(certificate: UploadFile = File(...)):
    try:
        content = await certificate.read()
        filename = certificate.filename.lower()

        is_pdf = filename.endswith('.pdf')
        is_image = filename.endswith(('.jpg', '.jpeg', '.png'))

        if not (is_pdf or is_image):
            raise HTTPException(400, detail="Only PDF, JPG, PNG allowed")

        # Extract text via OCR
        text = extract_text_from_pdf(content) if is_pdf else extract_text_from_image(content)

        # Basic tampering & URL check
        result = detect_tampering_basic(content, text, is_image=is_image)

        return {
            "status": result['status'],
            "reason": result['reason'],
            "ocr_text": text[:500] + "..." if len(text) > 500 else text,
            "file_name": certificate.filename,
        }
    except Exception as e:
        raise HTTPException(500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
# Force reload