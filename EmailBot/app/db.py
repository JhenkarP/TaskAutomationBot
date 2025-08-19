#TaskAutomationBots\EmailBot\app\db.py
import sqlite3
import os

os.makedirs("data", exist_ok=True)
conn = sqlite3.connect("data/emails.db", check_same_thread=False)
c = conn.cursor()

c.execute("""
CREATE TABLE IF NOT EXISTS emails (
    id TEXT PRIMARY KEY,
    subject TEXT,
    summary TEXT,
    company TEXT,
    deadline TEXT
)
""")
conn.commit()

def is_processed(email_id: str) -> bool:
    c.execute("SELECT 1 FROM emails WHERE id = ?", (email_id,))
    return c.fetchone() is not None

def save_email(email_id: str, subject: str, summary: str, company: str, deadline: str):
    c.execute(
        "INSERT OR REPLACE INTO emails (id, subject, summary, company, deadline) VALUES (?, ?, ?, ?, ?)",
        (email_id, subject, summary, company, deadline)
    )
    conn.commit()

def reset_db():
    c.execute("DROP TABLE IF EXISTS emails")
    c.execute("""
    CREATE TABLE emails (
        id TEXT PRIMARY KEY,
        subject TEXT,
        summary TEXT,
        company TEXT,
        deadline TEXT
    )
    """)
    conn.commit()
