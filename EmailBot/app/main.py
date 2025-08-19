#TaskAutomationBots\EmailBot\app\main.py
from fastapi import FastAPI
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager

from app.email_fetcher import fetch_last_emails
from app.gemini import call_gemini_api
from app.db import is_processed, save_email, c, reset_db, conn
from app.network import NetworkMonitor
from app.firewall import Firewall
from app.system_monitor import SystemMonitor
from app.logger_setup import get_logger

logger = get_logger("main")

def process_emails():
    emails = fetch_last_emails()
    for email in emails:
        if is_processed(email['id']):
            continue
        prompt = f"Email Subject: {email['subject']}\nEmail Body: {email['body']}\nExtract summary, company, and deadline in format:\nSummary: ...\nCompany: ...\nDeadline: ..."
        result = call_gemini_api(prompt)
        save_email(email['id'], email['subject'], result['summary'], result['company'], result['deadline'])
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

# ---------------- Email Endpoints ----------------
@app.get("/emails")
def get_emails():
    c.execute("SELECT * FROM emails")
    rows = c.fetchall()
    return rows

@app.get("/fetch-emails")
def fetch_emails_now():
    process_emails()
    return {"status": "Emails fetched and processed"}

@app.post("/reset-db")
def reset_database():
    reset_db()
    return {"status": "Database has been reset successfully"}

# ---------------- Network Endpoints ----------------
@app.get("/network/ping")
def api_ping(host: str = "8.8.8.8"):
    return {"host": host, "ping_result": NetworkMonitor.ping_host(host)}

@app.get("/network/tcp")
def api_tcp(host: str = "example.com", port: int = 80):
    return {"host": host, "port": port, "status": NetworkMonitor.tcp_client_demo(host, port)}

@app.get("/network/interfaces")
def api_interfaces():
    return NetworkMonitor.list_network_interfaces()

# ---------------- Firewall Endpoints ----------------
@app.post("/firewall/block/{ip}")
def block_ip(ip: str):
    Firewall.block_ip(ip)
    return {"status": f"{ip} blocked"}

@app.post("/firewall/unblock/{ip}")
def unblock_ip(ip: str):
    Firewall.unblock_ip(ip)
    return {"status": f"{ip} unblocked"}

@app.get("/firewall/check/{ip}")
def check_ip(ip: str):
    status = Firewall.check_connection(ip)
    return {"ip": ip, "allowed": status}

# ---------------- System Monitoring ----------------
@app.get("/system/cpu")
def cpu():
    return {"cpu_percent": SystemMonitor.cpu_usage()}

@app.get("/system/memory")
def memory():
    return {"memory_percent": SystemMonitor.memory_usage()}

@app.get("/system/network")
def network_usage():
    return SystemMonitor.network_usage()
