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
        try:
            output = subprocess.check_output(command, stderr=subprocess.STDOUT, universal_newlines=True)
            logger.info(f"Ping successful to {host}")
            return {"status": "success", "output": output}
        except subprocess.CalledProcessError as e:
            logger.error(f"Ping failed to {host}: {e.output}")
            return {"status": "failed", "output": e.output}
        except Exception as e: 
            logger.error(f"Ping exception to {host}: {str(e)}")
            return {"status": "failed", "output": str(e)}

    @staticmethod
    def tcp_client_demo(host="example.com", port=80):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(3)
            sock.connect((host, port))
            sock.close()
            logger.info(f"TCP connection successful to {host}:{port}")
            return "connected"
        except Exception as e:
            logger.error(f"TCP connection failed to {host}:{port} - {str(e)}")
            return f"failed: {str(e)}"

    @staticmethod
    def list_network_interfaces():
        interfaces = psutil.net_if_addrs()
        result = {}
        for iface, addrs in interfaces.items():
            result[iface] = []
            for addr in addrs:
                result[iface].append({
                    "family": str(addr.family),
                    "address": addr.address,
                    "netmask": addr.netmask,
                    "broadcast": addr.broadcast
                })
        logger.info("Listed network interfaces")
        return result
