# TaskAutomationBots/EmailBot/app/network.py
import socket
import subprocess
import platform
import psutil
from app.logger_setup import get_logger

logger = get_logger("network")

class NetworkMonitor:
    @staticmethod
    def ping_host(host="8.8.8.8"):
        param = "-n" if platform.system().lower() == "windows" else "-c"
        command = ["ping", param, "4", host]
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        logger.info(f"Ping {host} result: {result.stdout.strip()}")
        return result.stdout

    @staticmethod
    def tcp_client_demo(host="example.com", port=80):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(5)
                s.connect((host, port))
                logger.info(f"Connected to {host}:{port}")
                return True
        except Exception as e:
            logger.warning(f"TCP connection failed to {host}:{port} - {e}")
            return False

    @staticmethod
    def list_network_interfaces():
        addrs = psutil.net_if_addrs()
        interfaces = {}
        for iface, addr_list in addrs.items():
            ipv4s = [addr.address for addr in addr_list if addr.family == socket.AF_INET]
            if ipv4s:
                interfaces[iface] = ipv4s
        logger.info(f"Interfaces found: {interfaces}")
        return interfaces
