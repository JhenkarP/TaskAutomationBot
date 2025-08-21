#TaskAutomationBots\EmailBot\app\db.py
import sqlite3
import os
from app.logger_setup import get_logger

logger = get_logger("db")

os.makedirs("data", exist_ok=True)
conn = sqlite3.connect("data/emails.db", check_same_thread=False)

cur = conn.cursor()
cur.execute("""
CREATE TABLE IF NOT EXISTS emails (
    id TEXT PRIMARY KEY,
    subject TEXT,
    summary TEXT,
    company TEXT,
    deadline TEXT,
    sender_name TEXT,
    sender_email TEXT
)
""")
conn.commit()
cur.close()
logger.info("emails.db initialized and ensured schema")

def is_processed(email_id: str) -> bool:
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM emails WHERE id = ?", (email_id,))
    exists = cur.fetchone() is not None
    cur.close()
    if exists:
        logger.info(f"Email already processed: {email_id}")
    return exists

def save_email(email_id: str, subject: str, summary: str, company: str, deadline: str, sender_name: str, sender_email: str):
    from app.firewall import Firewall
    if not Firewall.check(sender_email):
        logger.info(f"Save skipped for blocked sender: {sender_email}")
        return
    cur = conn.cursor()
    cur.execute(
        "INSERT OR REPLACE INTO emails (id, subject, summary, company, deadline, sender_name, sender_email) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (email_id, subject, summary, company, deadline, sender_name, sender_email)
    )
    conn.commit()
    cur.close()
    logger.info(f"Saved email {email_id} from {sender_email}")

def reset_db():
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS emails")
    cur.execute("""
    CREATE TABLE emails (
        id TEXT PRIMARY KEY,
        subject TEXT,
        summary TEXT,
        company TEXT,
        deadline TEXT,
        sender_name TEXT,
        sender_email TEXT
    )
    """)
    conn.commit()
    cur.close()
    logger.warning("emails table reset")
