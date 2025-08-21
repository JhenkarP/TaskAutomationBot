#TaskAutomationBots\EmailBot\app\firewall.py
from app.logger_setup import get_logger
import re
import ipaddress
import sqlite3
import os

os.makedirs("data", exist_ok=True)
logger = get_logger("firewall")

DB_PATH = "data/firewall.db"
conn = sqlite3.connect(DB_PATH, check_same_thread=False)
c = conn.cursor()
c.execute("""
CREATE TABLE IF NOT EXISTS blocked_identifiers (
    identifier TEXT PRIMARY KEY
)
""")
conn.commit()

class Firewall:
    @classmethod
    def is_valid_ip(cls, identifier: str) -> bool:
        try:
            ipaddress.ip_address(identifier)
            return True
        except ValueError:
            return False

    @classmethod
    def is_valid_email(cls, identifier: str) -> bool:
        pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        return re.match(pattern, identifier) is not None

    @classmethod
    def block(cls, identifier: str):
        if cls.is_valid_ip(identifier) or cls.is_valid_email(identifier):
            c.execute("INSERT OR REPLACE INTO blocked_identifiers (identifier) VALUES (?)", (identifier,))
            conn.commit()
            logger.warning(f"Blocked: {identifier}")
            if cls.is_valid_email(identifier):
                from app.db import c as db_c, conn as db_conn
                db_c.execute("DELETE FROM emails WHERE sender_email = ?", (identifier,))
                db_conn.commit()
                logger.info(f"Deleted all emails from blocked sender: {identifier}")
        else:
            logger.error(f"Invalid identifier, cannot block: {identifier}")
            raise ValueError("Invalid IP or email")

    @classmethod
    def unblock(cls, identifier: str):
        c.execute("DELETE FROM blocked_identifiers WHERE identifier = ?", (identifier,))
        conn.commit()
        logger.info(f"Unblocked: {identifier}")

    @classmethod
    def check(cls, identifier: str) -> bool:
        c.execute("SELECT 1 FROM blocked_identifiers WHERE identifier = ?", (identifier,))
        if c.fetchone():
            logger.error(f"Blocked: {identifier}")
            return False
        logger.info(f"Allowed: {identifier}")
        return True

    @classmethod
    def get_all(cls):
        c.execute("SELECT identifier FROM blocked_identifiers")
        return [row[0] for row in c.fetchall()]
