# tests/conftest.py
import pytest
import sqlite3
from app import db, firewall

@pytest.fixture(autouse=True)
def in_memory_db(monkeypatch):
    # Patch db.py connection
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    c = conn.cursor()
    c.execute("""
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

    monkeypatch.setattr(db, "conn", conn)
    monkeypatch.setattr(db, "c", c)

    # Patch firewall connection
    fw_conn = sqlite3.connect(":memory:", check_same_thread=False)
    fw_c = fw_conn.cursor()
    fw_c.execute("CREATE TABLE blocked_identifiers (identifier TEXT PRIMARY KEY)")
    fw_conn.commit()

    monkeypatch.setattr(firewall, "conn", fw_conn)
    monkeypatch.setattr(firewall, "c", fw_c)

    yield

    conn.close()
    fw_conn.close()

