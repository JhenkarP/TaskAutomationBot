#TaskAutomationBots\EmailBot\tests\test_main.py
import pytest
from fastapi.testclient import TestClient
from app.main import app, process_emails
from app.db import save_email

client = TestClient(app)

def test_fetch_emails_now(monkeypatch):
    monkeypatch.setattr("app.main.process_emails", lambda: None)
    r = client.get("/fetch-emails")
    assert r.status_code == 200
    assert "status" in r.json()

def test_get_emails(monkeypatch):
    save_email("99", "Sub", "Sum", "Comp", "2025-01-01", "Tester", "t@test.com")
    r = client.get("/emails")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert any(e["id"] == "99" for e in r.json())

def test_firewall_block_and_check():
    r = client.post("/firewall/block/spam@test.com")
    assert r.status_code == 200
    check = client.get("/firewall/check/spam@test.com").json()
    assert check["allowed"] is False
    r2 = client.post("/firewall/unblock/spam@test.com")
    assert r2.status_code == 200
