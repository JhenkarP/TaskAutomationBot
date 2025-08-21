#TaskAutomationBots\EmailBot\tests\test_gemini.py
import pytest
import requests
from app import gemini

class DummyResponse:
    def __init__(self, status_code=200, json_data=None, text=""):
        self.status_code = status_code
        self._json = json_data or {}
        self.text = text
    def json(self):
        return self._json

def test_normalize_deadline_valid():
    assert gemini.normalize_deadline("March 1, 2025") == "2025-03-01"

def test_normalize_deadline_invalid():
    assert gemini.normalize_deadline("not a date") is None

def test_call_gemini_api_success(monkeypatch):
    def fake_post(url, json, headers):
        return DummyResponse(200, {
            "candidates": [{
                "content": {"parts": [{"text": "Summary: Hello\nCompany: ACME\nDeadline: 2025-02-01"}]}
            }]
        })
    monkeypatch.setattr(requests, "post", fake_post)
    result = gemini.call_gemini_api("prompt")
    assert result["summary"] == "Hello"
    assert result["company"] == "ACME"
    assert result["deadline"] == "2025-02-01"

def test_call_gemini_api_error(monkeypatch):
    def fake_post(url, json, headers):
        return DummyResponse(500, text="Server error")
    monkeypatch.setattr(requests, "post", fake_post)
    result = gemini.call_gemini_api("prompt")
    assert "Error:" in result["summary"]
