#TaskAutomationBots\EmailBot\app\gemini.py
import time
import requests
from dateutil import parser
from app.logger_setup import get_logger
from dotenv import dotenv_values

env_vars = dotenv_values(".env")  
logger = get_logger("gemini")

GEMINI_API_KEY = env_vars.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found")

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
_last_call_time = 0
MIN_INTERVAL = 6

def normalize_deadline(deadline_text: str) -> str:
    try:
        dt = parser.parse(deadline_text, fuzzy=True)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        logger.error(f"Failed to normalize deadline: {deadline_text}")
        return None

def call_gemini_api(prompt_text: str):
    global _last_call_time
    now = time.time()
    if now - _last_call_time < MIN_INTERVAL:
        time.sleep(MIN_INTERVAL - (now - _last_call_time))
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt_text}]}]}
    response = requests.post(f"{GEMINI_URL}?key={GEMINI_API_KEY}", json=payload, headers=headers)
    _last_call_time = time.time()
    if response.status_code == 200:
        try:
            output = response.json()
            text = output["candidates"][0]["content"]["parts"][0]["text"]
            lines = text.split("\n")
            summary = lines[0].replace("Summary:", "").strip() if len(lines) > 0 else "No summary"
            company = lines[1].replace("Company:", "").strip() if len(lines) > 1 else "Unknown company"
            deadline_raw = lines[2].replace("Deadline:", "").strip() if len(lines) > 2 else "No deadline"
            deadline = normalize_deadline(deadline_raw)
            return {"summary": summary or "No summary", "company": company or "Unknown company", "deadline": deadline}
        except Exception as e:
            logger.error(f"Gemini parse error: {e}")
            return {"summary": f"ParseError: {e}", "company": "Unknown company", "deadline": None}
    else:
        logger.error(f"Gemini API error {response.status_code}: {response.text}")
        return {"summary": f"Error: {response.text}", "company": "Unknown company", "deadline": None}
