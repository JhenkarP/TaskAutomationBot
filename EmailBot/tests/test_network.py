import pytest
from app.network import ping_host, tcp_client_demo, list_network_interfaces

def test_ping_localhost():
    result = ping_host("127.0.0.1")
    assert "TTL" in result or "time=" in result  # ping output differs by OS

def test_tcp_client_demo_fail():
    result = tcp_client_demo("invalid.host", 1234)
    assert "Connection failed" in result

def test_list_network_interfaces():
    interfaces = list_network_interfaces()
    assert isinstance(interfaces, dict)
