#TaskAutomationBots\EmailBot\app\main.py
# TaskAutomationBots/EmailBot/app/main.py
from fastapi import FastAPI
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager

from app.email_fetcher import fetch_last_emails
from app.gemini import call_gemini_api
from app.db import is_processed, save_email, reset_db, conn
from app.network import NetworkMonitor
from app.firewall import Firewall
from app.logger_setup import get_logger

logger = get_logger("main")


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


@app.get("/emails")
def get_emails():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM emails")
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
            "sender_email": row[6]
        })
    return emails


@app.get("/fetch-emails")
def fetch_emails_now():
    process_emails()
    return {"status": "Emails fetched and processed"}


@app.post("/reset-db")
def reset_database():
    reset_db()
    return {"status": "Database has been reset successfully"}


@app.get("/network/ping")
def api_ping(host: str = "8.8.8.8"):
    return {"host": host, "ping_result": NetworkMonitor.ping_host(host)}


@app.get("/network/tcp")
def api_tcp(host: str = "example.com", port: int = 80):
    return {"host": host, "port": port, "status": NetworkMonitor.tcp_client_demo(host, port)}


@app.get("/network/interfaces")
def api_interfaces():
    return NetworkMonitor.list_network_interfaces()


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
