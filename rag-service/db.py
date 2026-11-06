"""
Database access for the SharePlate RAG service.

Connects to:
  1. MongoDB (shareplate_db) for Users, Sessions, and NGO Applications
  2. MySQL (ecorescue_db) for Food Posts and Donations

Both connections are resilient: if a database is temporarily unreachable,
the service reports live data as unavailable without crashing the application.
"""

import os
from typing import List, Optional

from bson import ObjectId
from dotenv import load_dotenv
import pymysql
import pymysql.cursors
from pymongo import MongoClient
from pymongo.errors import PyMongoError

# Load .env file explicitly
_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(_ENV_PATH)


class DatabaseUnavailableError(Exception):
    """Raised when live database data cannot be reached."""
    pass


# ---------------------------------------------------------------------------
# MongoDB (Users, NGO Applications)
# ---------------------------------------------------------------------------

def _get_mongo_db():
    """Return a pymongo Database instance for shareplate_db."""
    uri = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/shareplate_db")
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=3000)
        # Fast ping check to verify connectivity
        client.admin.command("ping")
        return client.get_database("shareplate_db")
    except Exception as exc:
        raise DatabaseUnavailableError("MongoDB is unreachable.") from exc


def fetch_user_by_uid(uid: str) -> Optional[dict]:
    """
    Fetch a user's safe profile and statistics by their MongoDB ObjectId string.
    Never exposes passwords. Returns None if not found.
    """
    if not uid:
        return None

    try:
        obj_id = ObjectId(uid)
    except Exception:
        # Invalid ObjectId format
        return None

    try:
        db = _get_mongo_db()
        user = db["users"].find_one({"_id": obj_id})
    except DatabaseUnavailableError:
        raise
    except PyMongoError as exc:
        raise DatabaseUnavailableError("Failed to query MongoDB users.") from exc

    if user is None:
        return None

    stats = user.get("stats") or {}
    return {
        "uid": str(user["_id"]),
        "name": user.get("name", "Unknown"),
        "role": user.get("role", "donor"),
        "city": user.get("city", ""),
        "stats_totalDonations": stats.get("totalDonations", 0),
        "stats_reliabilityScore": stats.get("reliabilityScore", 5.0),
        "stats_pickupsCompleted": stats.get("pickupsCompleted", 0),
    }


def fetch_ngo_applications() -> List[dict]:
    """Fetch recent NGO applications from MongoDB ngoapplications collection."""
    try:
        db = _get_mongo_db()
        cursor = db["ngoapplications"].find(
            {},
            {"orgName": 1, "status": 1, "city": 1, "darpanId": 1, "_id": 0},
        ).limit(50)
        return list(cursor)
    except DatabaseUnavailableError:
        raise
    except PyMongoError as exc:
        raise DatabaseUnavailableError("Failed to query MongoDB ngoapplications.") from exc


def fetch_platform_stats() -> dict:
    """
    Aggregate cross-database platform statistics:
    - User count from MongoDB
    - Post counts from MySQL
    """
    stats = {
        "total_users": 0,
        "total_posts": 0,
        "total_completed": 0,
        "total_available": 0,
    }

    # Count MongoDB users
    try:
        db = _get_mongo_db()
        stats["total_users"] = db["users"].count_documents({})
    except Exception as exc:
        print(f"[RAG] Could not count MongoDB users: {exc}")

    # Count MySQL posts
    try:
        conn = _get_mysql_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) AS cnt FROM posts")
                row = cursor.fetchone()
                stats["total_posts"] = row["cnt"] if row else 0

                cursor.execute("SELECT COUNT(*) AS cnt FROM posts WHERE status = 'Completed'")
                row = cursor.fetchone()
                stats["total_completed"] = row["cnt"] if row else 0

                cursor.execute("SELECT COUNT(*) AS cnt FROM posts WHERE status = 'Available'")
                row = cursor.fetchone()
                stats["total_available"] = row["cnt"] if row else 0
        finally:
            conn.close()
    except Exception as exc:
        print(f"[RAG] Could not query MySQL post counts: {exc}")

    return stats


# ---------------------------------------------------------------------------
# MySQL (Food Posts / Donations)
# ---------------------------------------------------------------------------

def _get_mysql_connection():
    """Return an active connection to MySQL ecorescue_db."""
    host = (os.getenv("DB_HOST", "localhost") or "localhost").strip()
    port_str = (os.getenv("DB_PORT", "3306") or "3306").strip()
    database = (os.getenv("DB_NAME", "ecorescue_db") or "ecorescue_db").strip()
    user = (os.getenv("DB_USER", "root") or "root").strip()
    password = os.getenv("DB_PASSWORD", "")

    try:
        port = int(port_str)
    except ValueError:
        port = 3306

    try:
        return pymysql.connect(
            host=host,
            user=user,
            password=password,
            port=port,
            database=database,
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=3,
        )
    except Exception as exc:
        print(f"[RAG] MySQL connection error to {host}:{port}/{database}: {exc}")
        raise DatabaseUnavailableError("Could not connect to MySQL database.") from exc


def fetch_posts(limit: int = 50) -> List[dict]:
    """
    Fetch recent food donation posts from MySQL posts table.
    """
    conn = _get_mysql_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, restaurantId, restaurantName, foodType, quantity,
                       pickupDeadline, instructions, status, claimedByNgoId, createdAt
                FROM posts
                ORDER BY createdAt DESC
                LIMIT %s
                """,
                (limit,),
            )
            return cursor.fetchall()
    except DatabaseUnavailableError:
        raise
    except Exception as exc:
        raise DatabaseUnavailableError("Failed to query MySQL posts table.") from exc
    finally:
        conn.close()
