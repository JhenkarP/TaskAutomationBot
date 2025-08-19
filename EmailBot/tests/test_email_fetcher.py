import pytest
from app.email_fetcher import fetch_last_emails

def test_fetch_emails_structure():
    emails = fetch_last_emails(max_results=1)
    if emails:
        email = emails[0]
        assert "id" in email
        assert "subject" in email
        assert "body" in email
