#TaskAutomationBots\EmailBot\app\email_fetcher.py
import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from app.logger_setup import get_logger

logger = get_logger("email_fetcher")
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def fetch_last_emails(max_results=20):
    logger.info(f"Fetching last emails: max_results={max_results}")
    creds = None

    credentials_path = os.getenv("GOOGLE_CREDENTIALS", "secrets/credentials.json")
    token_path = os.getenv("GOOGLE_TOKEN", "secrets/token.json")

    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        logger.info("Loaded Gmail credentials from token.json")

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            logger.info("Refreshed Gmail credentials")
        else:
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)
            logger.info("Completed Gmail OAuth flow")
        with open(token_path, "w") as token:
            token.write(creds.to_json())
            logger.info("Wrote updated Gmail token.json")

    service = build("gmail", "v1", credentials=creds)
    logger.info("Gmail service client initialized")
    results = service.users().messages().list(userId="me", maxResults=max_results).execute()
    messages = results.get("messages", [])

    emails = []
    for msg in messages:
        m = service.users().messages().get(userId="me", id=msg["id"]).execute()
        subject = ""
        sender_name = ""
        sender_email = ""

        for header in m["payload"]["headers"]:
            if header["name"] == "Subject":
                subject = header["value"]
            elif header["name"] == "From":
                from_value = header["value"]
                if "<" in from_value and ">" in from_value:
                    sender_name = from_value.split("<")[0].strip().strip('"')
                    sender_email = from_value.split("<")[1].replace(">", "").strip()
                else:
                    sender_name = from_value
                    sender_email = from_value

        body = m.get("snippet", "")
        emails.append({
            "id": msg["id"],
            "subject": subject,
            "body": body,
            "sender_name": sender_name,
            "sender_email": sender_email
        })
        logger.info(f"Parsed email {msg['id']} from {sender_email}")

    logger.info(f"Returning emails: count={len(emails)}")
    return emails
