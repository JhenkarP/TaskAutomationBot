#TaskAutomationBots\EmailBot\tests\test_email_fetcher.py
import pytest
from app import main

def test_process_email_skip_blocked(monkeypatch):
    monkeypatch.setattr("app.firewall.Firewall.check", lambda _: False)
    result = main.process_emails()
    assert result is None
