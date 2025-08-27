#TaskAutomationBots\EmailBot\app\db.py
import sqlite3
import os
import datetime
from app.logger_setup import get_logger

logger = get_logger("db")

os.makedirs("data", exist_ok=True)
conn = sqlite3.connect("data/emails.db", check_same_thread=False)
cur = conn.cursor()

# Emails table: pinned (BOOLEAN) and score (REAL)
cur.execute("""
CREATE TABLE IF NOT EXISTS emails (
    id TEXT PRIMARY KEY,
    subject TEXT,
    summary TEXT,
    company TEXT,
    deadline TEXT,
    sender_name TEXT,
    sender_email TEXT,
    pinned INTEGER DEFAULT 0,
    score REAL DEFAULT 0
)
""")

# VIP senders table
cur.execute("""CREATE TABLE IF NOT EXISTS vip_senders (email TEXT PRIMARY KEY)""")

# Keyword table
cur.execute("""CREATE TABLE IF NOT EXISTS keywords (word TEXT PRIMARY KEY)""")

conn.commit()
cur.close()
logger.info("emails.db initialized and ensured schema")

# ---------------- Email Functions ----------------

def is_processed(email_id: str) -> bool:
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM emails WHERE id = ?", (email_id,))
    exists = cur.fetchone() is not None
    cur.close()
    if exists:
        logger.info(f"Email already processed: {email_id}")
    return exists


def calculate_score(email):
    """Base score calculation: VIP, keywords, pinned only (deadline handled on frontend)"""
    score = 0
    cur = conn.cursor()

    # VIP sender
    cur.execute("SELECT 1 FROM vip_senders WHERE email = ?", (email['sender_email'],))
    if cur.fetchone():
        score += 50

    # Keywords in subject or summary
    cur.execute("SELECT word FROM keywords")
    keywords = [row[0].lower() for row in cur.fetchall()]
    content = (email.get('subject','') + ' ' + email.get('summary','')).lower()
    for kw in keywords:
        if kw in content:
            score += 10

    # Pinned email
    if email.get('pinned'):
        score += 30

    cur.close()
    return score


def recalculate_scores():
    """Recalculate base scores for all emails when VIPs/keywords/pins change"""
    cur = conn.cursor()
    cur.execute("SELECT id, subject, summary, company, deadline, sender_name, sender_email, pinned FROM emails")
    rows = cur.fetchall()

    for row in rows:
        email = {
            "subject": row[1],
            "summary": row[2],
            "company": row[3],
            "deadline": row[4],
            "sender_name": row[5],
            "sender_email": row[6],
            "pinned": bool(row[7])
        }
        new_score = calculate_score(email)
        cur.execute("UPDATE emails SET score = ? WHERE id = ?", (new_score, row[0]))

    conn.commit()
    cur.close()
    logger.info("Recalculated all email scores")


def save_email(email_id: str, subject: str, summary: str, company: str, deadline: str, sender_name: str, sender_email: str, pinned: int = 0):
    from app.firewall import Firewall
    if not Firewall.check(sender_email):
        logger.info(f"Save skipped for blocked sender: {sender_email}")
        return

    email_data = {
        'subject': subject,
        'summary': summary,
        'company': company,
        'deadline': deadline,
        'sender_name': sender_name,
        'sender_email': sender_email,
        'pinned': pinned
    }

    score = calculate_score(email_data)

    cur = conn.cursor()
    cur.execute("""
        INSERT OR REPLACE INTO emails 
        (id, subject, summary, company, deadline, sender_name, sender_email, pinned, score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (email_id, subject, summary, company, deadline, sender_name, sender_email, pinned, score))
    conn.commit()
    cur.close()
    logger.info(f"Saved email {email_id} from {sender_email} with score {score}")

# ---------------- VIP Functions ----------------

def add_vip(email):
    cur = conn.cursor()
    cur.execute("INSERT OR REPLACE INTO vip_senders (email) VALUES (?)", (email,))
    conn.commit()
    cur.close()
    recalculate_scores()
    logger.info(f"VIP added: {email}")


def remove_vip(email):
    cur = conn.cursor()
    cur.execute("DELETE FROM vip_senders WHERE email = ?", (email,))
    conn.commit()
    cur.close()
    recalculate_scores()
    logger.info(f"VIP removed: {email}")


def get_all_vips():
    cur = conn.cursor()
    cur.execute("SELECT email FROM vip_senders")
    vips = [row[0] for row in cur.fetchall()]
    cur.close()
    return vips

# ---------------- Keyword Functions ----------------

def add_keyword(word):
    cur = conn.cursor()
    cur.execute("INSERT OR REPLACE INTO keywords (word) VALUES (?)", (word,))
    conn.commit()
    cur.close()
    recalculate_scores()
    logger.info(f"Keyword added: {word}")


def remove_keyword(word):
    cur = conn.cursor()
    cur.execute("DELETE FROM keywords WHERE word = ?", (word,))
    conn.commit()
    cur.close()
    recalculate_scores()
    logger.info(f"Keyword removed: {word}")


def get_all_keywords():
    cur = conn.cursor()
    cur.execute("SELECT word FROM keywords")
    kws = [row[0] for row in cur.fetchall()]
    cur.close()
    return kws

# ---------------- Reset ----------------

def reset_db():
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS emails")
    cur.execute("DROP TABLE IF EXISTS vip_senders")
    cur.execute("DROP TABLE IF EXISTS keywords")
    cur.execute("""
        CREATE TABLE emails (
            id TEXT PRIMARY KEY,
            subject TEXT,
            summary TEXT,
            company TEXT,
            deadline TEXT,
            sender_name TEXT,
            sender_email TEXT,
            pinned INTEGER DEFAULT 0,
            score REAL DEFAULT 0
        )
    """)
    cur.execute("CREATE TABLE IF NOT EXISTS vip_senders (email TEXT PRIMARY KEY)")
    cur.execute("CREATE TABLE IF NOT EXISTS keywords (word TEXT PRIMARY KEY)")
    conn.commit()
    cur.close()
    logger.warning("Database reset completed")
