#TaskAutomationBots\EmailBot\tests\test_network.py
import socket
from app.network import NetworkMonitor

def test_ping_host(monkeypatch):
    def fake_check_output(cmd, stderr, universal_newlines):
        return "ping success"
    monkeypatch.setattr("subprocess.check_output", fake_check_output)
    result = NetworkMonitor.ping_host("8.8.8.8")
    assert result["status"] == "success"

def test_ping_host_failure(monkeypatch):
    def fake_check_output(cmd, stderr, universal_newlines):
        raise Exception("ping fail")
    monkeypatch.setattr("subprocess.check_output", fake_check_output)
    result = NetworkMonitor.ping_host("8.8.8.8")
    assert result["status"] == "failed"

def test_tcp_client_demo_success(monkeypatch):
    class DummySocket:
        def settimeout(self, t): pass
        def connect(self, addr): pass
        def close(self): pass
    monkeypatch.setattr(socket, "socket", lambda *a, **kw: DummySocket())
    assert NetworkMonitor.tcp_client_demo("host", 80) == "connected"

def test_tcp_client_demo_failure(monkeypatch):
    class DummySocket:
        def settimeout(self, t): pass
        def connect(self, addr): raise Exception("fail")
        def close(self): pass
    monkeypatch.setattr(socket, "socket", lambda *a, **kw: DummySocket())
    result = NetworkMonitor.tcp_client_demo("host", 80)
    assert "failed" in result

def test_list_network_interfaces(monkeypatch):
    monkeypatch.setattr("psutil.net_if_addrs", lambda: {"eth0": []})
    result = NetworkMonitor.list_network_interfaces()
    assert "eth0" in result
