#TaskAutomationBots\EmailBot\tests\test_firewall.py
import pytest
from app.firewall import Firewall

def test_block_and_check_email():
    Firewall.block("spam@test.com")
    assert not Firewall.check("spam@test.com")
    assert "spam@test.com" in Firewall.get_all()

def test_block_and_unblock_ip():
    ip = "192.168.0.1"
    Firewall.block(ip)
    assert not Firewall.check(ip)
    Firewall.unblock(ip)
    assert Firewall.check(ip)

def test_invalid_identifier():
    with pytest.raises(ValueError):
        Firewall.block("not-an-email-or-ip")
