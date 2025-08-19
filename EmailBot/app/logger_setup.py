#TaskAutomationBots\EmailBot\app\logger_setup.py
import logging
import os

os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    filename="logs/emailbot.log",
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

def get_logger(name: str):
    return logging.getLogger(name)
