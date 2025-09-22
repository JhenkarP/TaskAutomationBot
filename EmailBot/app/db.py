# TaskAutomationBots\EmailBot\app\db.py
import sqlite3
import os
from app.logger_setup import get_logger
from app.firewall import Firewall
from app.cache import sync_email_cache, redis_client

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
    sender_email TEXT,
    pinned INTEGER DEFAULT 0,
    score REAL DEFAULT 0
)
""")
cur.execute("""CREATE TABLE IF NOT EXISTS vip_senders (email TEXT PRIMARY KEY)""")
cur.execute("""CREATE TABLE IF NOT EXISTS keywords (word TEXT PRIMARY KEY)""")
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

def calculate_score(email):
    score = 0
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM vip_senders WHERE email = ?", (email['sender_email'],))
    if cur.fetchone():
        score += 50
    cur.execute("SELECT word FROM keywords")
    keywords = [row[0].lower() for row in cur.fetchall()]
    content = (email.get('subject','') + ' ' + email.get('summary','')).lower()
    for kw in keywords:
        if kw in content:
            score += 10
    if email.get('pinned'):
        score += 30
    cur.close()
    return score

def save_email(email_id: str, subject: str, summary: str, company: str, deadline: str, sender_name: str, sender_email: str, pinned: int = 0):
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
    email_data["score"] = score
    sync_email_cache(email_id, email_data)
    logger.info(f"Saved email {email_id} from {sender_email} with score {score}")

def recalculate_scores():
    cur = conn.cursor()
    cur.execute("SELECT id, subject, summary, company, deadline, sender_name, sender_email, pinned FROM emails")
    rows = cur.fetchall()
    for row in rows:
        email_id = row[0]
        email_data = {
            "subject": row[1],
            "summary": row[2],
            "company": row[3],
            "deadline": row[4],
            "sender_name": row[5],
            "sender_email": row[6],
            "pinned": bool(row[7])
        }
        new_score = calculate_score(email_data)
        cur.execute("UPDATE emails SET score = ? WHERE id = ?", (new_score, email_id))
        email_data["score"] = new_score
        sync_email_cache(email_id, email_data)
    conn.commit()
    cur.close()
    logger.info("Recalculated all email scores")

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
    redis_client.flushall()
    logger.warning("Database and cache reset completed")
