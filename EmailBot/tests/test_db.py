#TaskAutomationBots\EmailBot\tests\test_db.py
import pytest
from app import db

def test_save_and_retrieve_email():
    db.save_email("1", "Subject", "Summary", "Company", "2025-01-01", "Alice", "alice@test.com")
    assert db.is_processed("1") is True

def test_save_skipped_for_blocked(monkeypatch):
    from app.firewall import Firewall
    Firewall.block("bob@test.com")
    db.save_email("2", "Subj", "Sum", "Comp", "2025-01-01", "Bob", "bob@test.com")
    assert db.is_processed("2") is False

def test_reset_db_clears_entries():
    db.save_email("3", "Subj", "Sum", "Comp", "2025-01-01", "Eve", "eve@test.com")
    assert db.is_processed("3")
    db.reset_db()
    assert not db.is_processed("3")
