import psutil
from app.logger_setup import get_logger

logger = get_logger("system")

class SystemMonitor:
    @staticmethod
    def cpu_usage():
        usage = psutil.cpu_percent(interval=1)
        logger.info(f"CPU Usage: {usage}%")
        return usage

    @staticmethod
    def memory_usage():
        mem = psutil.virtual_memory()
        logger.info(f"Memory Usage: {mem.percent}%")
        return mem.percent

    @staticmethod
    def network_usage():
        net = psutil.net_io_counters()
        logger.info(f"Network Sent: {net.bytes_sent}, Received: {net.bytes_recv}")
        return {"sent": net.bytes_sent, "recv": net.bytes_recv}
