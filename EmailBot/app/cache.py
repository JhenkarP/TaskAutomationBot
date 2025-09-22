# TaskAutomationBots\EmailBot\app\cache.py
import redis
import json
from app.logger_setup import get_logger

logger = get_logger("cache")

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True
)

def set_cache(key: str, value: dict, ttl: int = None):
    try:
        data = json.dumps(value)
        if ttl:
            redis_client.setex(key, ttl, data)
        else:
            redis_client.set(key, data)
        logger.info(f"Cached key: {key} (TTL={ttl})")
    except Exception as e:
        logger.error(f"Failed to set cache {key}: {e}")

def get_cache(key: str):
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else None
    except Exception as e:
        logger.error(f"Failed to get cache {key}: {e}")
        return None

def delete_cache(key: str):
    try:
        redis_client.delete(key)
        logger.info(f"Deleted cache key: {key}")
    except Exception as e:
        logger.error(f"Failed to delete cache {key}: {e}")

def sync_email_cache(email_id: str, email_data: dict = None):
    from app.db import conn
    if not email_data:
        cur = conn.cursor()
        cur.execute("SELECT * FROM emails WHERE id = ?", (email_id,))
        row = cur.fetchone()
        cur.close()
        if not row:
            return
        email_data = {
            "id": row[0],
            "subject": row[1],
            "summary": row[2],
            "company": row[3],
            "deadline": row[4],
            "sender_name": row[5],
            "sender_email": row[6],
            "pinned": bool(row[7]),
            "score": row[8]
        }
    set_cache(f"email:{email_id}", email_data, ttl=86400)
