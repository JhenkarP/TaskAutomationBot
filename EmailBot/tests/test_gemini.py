import pytest
from app.gemini import call_gemini_api

def test_call_gemini_api_basic():
    prompt = "Summary: Test\nCompany: TestCorp\nDeadline: 2025-12-31"
    result = call_gemini_api(prompt)
    assert "summary" in result
    assert "company" in result
    assert "deadline" in result
