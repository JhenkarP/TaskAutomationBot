#TaskAutomationBots\EmailBot\app\email_fetcher.py
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def fetch_last_emails(max_results=20):
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    service = build("gmail", "v1", credentials=creds)
    results = service.users().messages().list(userId="me", maxResults=max_results).execute()
    messages = results.get("messages", [])

    emails = []
    for msg in messages:
        m = service.users().messages().get(userId="me", id=msg["id"]).execute()
        subject = ""
        body = ""

        for header in m["payload"]["headers"]:
            if header["name"] == "Subject":
                subject = header["value"]

        body = m.get("snippet", "")
        emails.append({"id": msg["id"], "subject": subject, "body": body})

    return emails
