#TaskAutomationBots\EmailBot\app\main.py
import os
from fastapi import FastAPI, HTTPException
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from app.email_fetcher import fetch_last_emails
from app.gemini import call_gemini_api
from app.db import (
    is_processed, save_email, reset_db, conn,
    add_vip, remove_vip, get_all_vips,
    add_keyword, remove_keyword, get_all_keywords,
    recalculate_scores
)
from app.network import NetworkMonitor
from app.firewall import Firewall
from app.logger_setup import get_logger

logger = get_logger("main")

# ----------------- Email Processing -----------------

def process_emails():
    emails = fetch_last_emails()
    for email in emails:
        sender_email = email['sender_email']
        sender_ip = email.get('sender_ip', None)

        # Firewall checks
        if not Firewall.check(sender_email):
            logger.warning(f"Skipped blocked email from: {sender_email}")
            continue
        if sender_ip and not Firewall.check(sender_ip):
            logger.warning(f"Skipped blocked email from IP: {sender_ip}")
            continue

        # Skip already processed
        if is_processed(email['id']):
            continue

        # Build prompt
        prompt = (
            f"Email Subject: {email['subject']}\n"
            f"Email Body: {email['body']}\n"
            f"Extract summary, company, and deadline(summarize well and find deadlines - companies accurately ) in format:\n"
            f"Summary: ...\nCompany: ...\nDeadline: ..."
        )

        result = call_gemini_api(prompt)
        save_email(
            email['id'],
            email['subject'],
            result['summary'],
            result['company'],
            result['deadline'],
            email['sender_name'],
            sender_email
        )
        logger.info(f"Processed email {email['id']}")

# ----------------- FastAPI App -----------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = BackgroundScheduler()
    scheduler.add_job(process_emails, 'interval', minutes=5)
    scheduler.start()
    yield
    conn.commit()
    conn.close()
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Email Routes -----------------

@app.get("/emails")
def get_emails():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM emails ORDER BY score DESC")
    rows = cursor.fetchall()
    emails = []
    for row in rows:
        emails.append({
            "id": str(row[0]),
            "subject": row[1],
            "summary": row[2],
            "company": row[3],
            "deadline": row[4],
            "sender_name": row[5],
            "sender_email": row[6],
            "pinned": bool(row[7]),
            "score": row[8]
        })
    return emails

@app.patch("/emails/{email_id}")
def update_email_deadline(email_id: str, payload: dict):
    """Update deadline only; frontend uses deadline to add dynamic score"""
    new_deadline = payload.get("deadline")
    if not new_deadline:
        raise HTTPException(status_code=400, detail="Deadline is required")

    cursor = conn.cursor()
    cursor.execute("UPDATE emails SET deadline = ? WHERE id = ?", (new_deadline, email_id))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Email not found")

    conn.commit()
    return {"status": "success", "email_id": email_id, "new_deadline": new_deadline}

@app.patch("/emails/pin/{email_id}")
def pin_email(email_id: str, payload: dict):
    """Pin or unpin email → recalc backend score"""
    pinned = payload.get("pinned", True)
    cursor = conn.cursor()
    cursor.execute("UPDATE emails SET pinned = ? WHERE id = ?", (int(pinned), email_id))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Email not found")
    conn.commit()
    recalculate_scores()
    return {"status": "success", "email_id": email_id, "pinned": pinned}

@app.get("/emails/prioritized")
def get_prioritized_emails():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM emails ORDER BY score DESC LIMIT 20")
    rows = cursor.fetchall()
    emails = []
    for row in rows:
        emails.append({
            "id": str(row[0]),
            "subject": row[1],
            "summary": row[2],
            "company": row[3],
            "deadline": row[4],
            "sender_name": row[5],
            "sender_email": row[6],
            "pinned": bool(row[7]),
            "score": row[8]
        })
    return emails

# ----------------- VIP Routes -----------------

@app.post("/vip/add")
def api_add_vip(payload: dict):
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    add_vip(email)
    recalculate_scores()
    return {"status": "VIP added", "email": email}

@app.post("/vip/remove")
def api_remove_vip(payload: dict):
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    remove_vip(email)
    recalculate_scores()
    return {"status": "VIP removed", "email": email}

@app.get("/vip/list")
def api_list_vips():
    return {"vips": get_all_vips()}

# ----------------- Keywords Routes -----------------

@app.post("/keyword/add")
def api_add_keyword(payload: dict):
    word = payload.get("word")
    if not word:
        raise HTTPException(status_code=400, detail="Keyword is required")
    add_keyword(word)
    recalculate_scores()
    return {"status": "Keyword added", "word": word}

@app.post("/keyword/remove")
def api_remove_keyword(payload: dict):
    word = payload.get("word")
    if not word:
        raise HTTPException(status_code=400, detail="Keyword is required")
    remove_keyword(word)
    recalculate_scores()
    return {"status": "Keyword removed", "word": word}

@app.get("/keyword/list")
def api_list_keywords():
    return {"keywords": get_all_keywords()}

# ----------------- Other Utilities -----------------

@app.get("/fetch-emails")
def fetch_emails_now():
    process_emails()
    return {"status": "Emails fetched and processed"}

@app.post("/reset-db")
def reset_database():
    reset_db()
    return {"status": "Database has been reset successfully"}

@app.post("/firewall/block/{identifier}")
def block_identifier(identifier: str):
    Firewall.block(identifier)
    return {"status": f"{identifier} blocked"}

@app.post("/firewall/unblock/{identifier}")
def unblock_identifier(identifier: str):
    Firewall.unblock(identifier)
    return {"status": f"{identifier} unblocked"}

@app.get("/firewall/check/{identifier}")
def check_identifier(identifier: str):
    status = Firewall.check(identifier)
    return {"identifier": identifier, "allowed": status}

@app.get("/firewall/blocked")
def get_blocked_identifiers():
    blocked_list = Firewall.get_all()
    return {"blocked": blocked_list}

@app.get("/network/ping")
def api_ping(host: str = "8.8.8.8"):
    return {"host": host, "ping_result": NetworkMonitor.ping_host(host)}

@app.get("/network/tcp")
def api_tcp(host: str = "example.com", port: int = 80):
    return {"host": host, "port": port, "status": NetworkMonitor.tcp_client_demo(host, port)}

@app.get("/network/interfaces")
def api_interfaces():
    return NetworkMonitor.list_network_interfaces()

@app.get("/logs")
def get_logs():
    log_file = "logs/emailbot.log"
    if not os.path.exists(log_file):
        return {"logs": []}
    with open(log_file, "r") as f:
        lines = f.readlines()
    last_20_logs = lines[-20:] if len(lines) > 20 else lines
    return {"logs": [line.strip() for line in last_20_logs]}
