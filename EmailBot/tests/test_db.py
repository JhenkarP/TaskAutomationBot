import pytest
from app.db import reset_db, save_email, is_processed, c

def test_save_and_check_email():
    reset_db()
    email_id = "test123"
    save_email(email_id, "Subject", "Summary", "Company", "2025-12-31")
    assert is_processed(email_id) == True

def test_reset_db_clears_data():
    reset_db()
    c.execute("SELECT * FROM emails")
    rows = c.fetchall()
    assert rows == []
