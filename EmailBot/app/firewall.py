#TaskAutomationBots\EmailBot\app\firewall.py
from app.logger_setup import get_logger
import time

logger = get_logger("firewall")

class Firewall:
    blocked_ips = set()

    @classmethod
    def block_ip(cls, ip):
        cls.blocked_ips.add(ip)
        logger.warning(f"Blocked IP: {ip}")

    @classmethod
    def unblock_ip(cls, ip):
        cls.blocked_ips.discard(ip)
        logger.info(f"Unblocked IP: {ip}")

    @classmethod
    def check_connection(cls, ip):
        if ip in cls.blocked_ips:
            logger.error(f"Connection attempt blocked from {ip}")
            return False
        logger.info(f"Connection allowed from {ip}")
        return True
