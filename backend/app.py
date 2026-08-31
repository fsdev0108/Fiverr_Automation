from __future__ import annotations
from supabase import create_client
from postgrest.exceptions import APIError
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Set, List
from pydantic import BaseModel
from typing import List, Optional, Tuple
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
from pathlib import Path
import requests as http_requests
import os
import re
import requests
import numpy as np
import cv2
import re
from dotenv import load_dotenv

load_dotenv()
# from ultralytics import YOLOyes
app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent

IN_FILE = "new_users"
IN_FILE1 = "us_fillted_users"
IN_FILE2 = "eu_fillted_users"

OUT_FILE = "filltered_users"
OUT_FILE1 = "filltered_users_eu"

FACE_CASCADE = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

TIME_RE = re.compile(r"(\d{1,2})\s*:\s*(\d{2})")


NET = cv2.dnn.readNetFromCaffe(
    str(BASE_DIR / "deploy.prototxt"),
    str(BASE_DIR / "res10_300x300_ssd_iter_140000.caffemodel")
)

class UserIn(BaseModel):
    userid: str
    img_url: str = ""
    time_text: str = ""
    profile_url: Optional[str] = None

class FilterReq(BaseModel):
    users: List[UserIn]
    my_tz: str = "America/Los_Angeles"

def safe_zoneinfo(tz_name: str) -> ZoneInfo:
    try:
        return ZoneInfo(tz_name)
    except Exception:
        # fallback to UTC if tz not found
        return ZoneInfo("UTC")

def get_language_count(language_text: str) -> int:
    if not language_text:
        return 0

    return len([
        lang.strip()
        for lang in language_text.split(",")
        if lang.strip()
    ])

def append_id(table: str, username: str):
    try:
        supabase.table(table).insert({
            "username": username
        }).execute()
    except APIError as e:
        # Ignore duplicate username
        if "duplicate key" in str(e).lower():
            return
        raise
    
def delete_username(table, username):

    return (
        supabase
        .table(table)
        .delete()
        .eq("username", username)
        .execute()
    )

def image_has_face(img_url: str, timeout=10, conf=0.5, upsample_to=800) -> bool:
    if not img_url:
        return False

    try:
        r = requests.get(img_url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0"})
        r.raise_for_status()

        data = np.frombuffer(r.content, dtype=np.uint8)
        img = cv2.imdecode(data, cv2.IMREAD_COLOR)
        if img is None:
            return False

        # Upsample small images so tiny faces become detectable
        h, w = img.shape[:2]
        scale = upsample_to / max(h, w)
        if scale > 1.0:
            img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

        blob = cv2.dnn.blobFromImage(
            img, scalefactor=1.0, size=(300, 300),
            mean=(104.0, 177.0, 123.0), swapRB=False, crop=False
        )
        NET.setInput(blob)
        det = NET.forward()  # shape: [1,1,N,7]

        # Any detection over threshold?
        scores = det[0, 0, :, 2]
        return bool(np.any(scores >= conf))
    except Exception:
        return False
def parse_local_time_hhmm(time_text: str) -> Optional[Tuple[int, int]]:
    if not time_text:
        return None
    m = TIME_RE.search(time_text)
    if not m:
        return None
    hh, mm = int(m.group(1)), int(m.group(2))
    if 0 <= hh <= 23 and 0 <= mm <= 59:
        return hh, mm
    return None

def extract_hour_24(time_text: str) -> int | None:
    """
    Parses strings like:
    'Offline • 05:23 PM local time'
    'Online • 12:01 AM local time'
    """
    if not time_text:
        return None

    m = re.search(r"(\d{1,2}):(\d{2})\s*(AM|PM)", time_text, re.IGNORECASE)
    if not m:
        return None

    hour = int(m.group(1))
    ampm = m.group(3).upper()

    if ampm == "PM" and hour != 12:
        hour += 12
    elif ampm == "AM" and hour == 12:
        hour = 0

    return hour

def has_language(language_text: str, language: str) -> bool:
    if not language_text or not language:
        return False

    languages = [
        lang.strip().lower()
        for lang in language_text.split(",")
        if lang.strip()
    ]

    return language.lower() in languages

@app.route("/userids_from_file", methods=["GET"])
def userids_from_file():

    TAKE_COUNT = 1

    # Get the first username from "new"
    result = (
        supabase
        .table(IN_FILE)
        .select("id, username")
        .order("id")
        .limit(TAKE_COUNT)
        .execute()
    )
    users = result.data
    # print(result)
    print(result.data)
    # print("IN_FILE =", IN_FILE)

    print("user total:", len(users))

    if len(users) == 0:

        # Count filtered users
        filtered = (
            supabase
            .table(OUT_FILE)
            .select("id", count="exact")
            .execute()
        )

        if filtered.count > 30:
            return jsonify({
                "path": "IN_FILE",
                "taken": [],
                "count": 0,
                "remaining": 0
            })

        # Get first username from out_filetxt
        result = (
            supabase
            .table(IN_FILE1)
            .select("id, username")
            .order("id")
            .limit(TAKE_COUNT)
            .execute()
        )

        users = result.data
        
        return jsonify({
            "path": "IN_FILE1",
            "taken": [u["username"] for u in users],
            "count": 0,
            "remaining": max(0, len(users) - TAKE_COUNT)
        })

    return jsonify({
        "path": "IN_FILE",
        "taken": [u["username"] for u in users],
        "count": 1,
        "remaining": "unknown"
    })
def is_within_utc_window(hour_24: int, utc_hour: int, before: int = 2, after: int = 4) -> bool:
    """
    Returns True if hour_24 is between (utc_hour - before) and (utc_hour + after),
    handling wrap-around at midnight.
    """
    if hour_24 is None:
        return False

    # Convert to circular distance (0–23)
    diff = (hour_24 - utc_hour) % 24

    return diff <= after or diff >= (24 - before)



@app.route("/filter_users_and_write", methods=["POST"])
def filter_users_and_write():
    req = request.get_json(silent=True) or {}
    users = req.get("users", [])
    my_tz = req.get("my_tz", "America/Los_Angeles")
    count = req.get("count") or 0
    now_utc = datetime.now(timezone.utc)

    my_zone = safe_zoneinfo(my_tz)
    my_offset_td = datetime.now(my_zone).utcoffset() or timedelta(0)
    my_offset_hours = int(my_offset_td.total_seconds() // 3600)

    min_ok = my_offset_hours - 1
    max_ok = my_offset_hours + 3

    filtered: List[str] = []

    for u in users:
        userid = (u.get("userid") or "").strip()
        language = u.get("language") or ""
        country = u.get("country") or ""
        img_url = u.get("img_url") or ""
        time_text = u.get("time_text") or ""
        is_disabled = u.get("is_disabled") or ""
        print("Processing user:", userid, country, language, time_text)
        print("Counts:", count)
        if not language:
            if count:
                delete_username(IN_FILE, userid)
                continue

            delete_username(IN_FILE1, userid)
            continue
        if not time_text:
            continue
        
        if count:
            delete_username(IN_FILE, userid)
        else:
            delete_username(IN_FILE1, userid)

        if not image_has_face(img_url):
            print("❌ {} has no face in image, skipping".format(userid))
            continue
        if has_language(language, "French") and country == "United States":
            print("❌ {} speaks French, skipping".format(userid))
            continue
        language_count = get_language_count(language)
        if is_disabled:
            print("❌ {} Contact me is disabled".format(userid))
            continue
        hour_24 = extract_hour_24(time_text)
        utc_hour = (now_utc.hour + 17) % 24  # Convert to UTC+17 for filtering
        print("❌", country)
        if not is_within_utc_window(hour_24, utc_hour) and country == "United States":
            print(f"❌ {hour_24} VS {utc_hour} ==> {is_within_utc_window(hour_24, utc_hour)}" )
            continue
        
        print ("✅ User passed filters:", userid)
        
        if country == "United States":
            append_id(OUT_FILE, userid)
            if count:
                append_id(IN_FILE1, userid)
        else:
            append_id(OUT_FILE1, userid)
            append_id(IN_FILE2, userid)
        filtered.append(userid)

    return jsonify({
        "in_file": str(IN_FILE),
        "out_file": str(OUT_FILE),
        "count": len(filtered),
        "filtered_userids": filtered
    })



@app.route("/api/save-ids", methods=["POST"])
def save_ids():
    """
    JSON:
    {
        "ids": ["some/path1", "some/path2"],
        "region": "US",
        "page_url": "https://www.fiverr.com/..."
    }
    """
    payload = request.get_json(silent=True) or {}
    ids = payload.get("ids") or []
    region = payload.get("region") or "default"
    page_url = payload.get("page_url", "")

    print(f"📥 Received {len(ids)} ids from region={region}, page={page_url}")

    if not isinstance(ids, list):
        return jsonify({"error": "ids must be a list"}), 400

    new_ids: List[str] = []

    for raw_id in ids:
        id_value = str(raw_id).strip()
        result = (
            supabase
            .table(region)
            .select("username")
            .eq("username", id_value)
            .limit(1)
            .execute()
        )

        if not id_value or result.data:
            continue
        append_id(region, id_value)
        append_id(IN_FILE, id_value)
        new_ids.append(id_value)
        print("➡️ New ID:", id_value)

    return jsonify(
        {
            "status": "ok",
            "received": len(ids),
            "new": len(new_ids),
            "new_ids": new_ids,
        }
    )

@app.get("/api/us")
def get_pdf():
    result = (
        supabase
        .table("filltered_users")   # change to your table
        .select("id, username")
        .order("id")
        .limit(1)
        .execute()
    )

    if not result.data:
        return jsonify({"error": "No usernames left"}), 404

    row = result.data[0]

    # Delete the row after taking it
    (
        supabase
        .table("filltered_users")
        .delete()
        .eq("id", row["id"])
        .execute()
    )

    return jsonify({
        "url": row["username"]
    })

@app.get("/api/eu")
def get_eu():
    result = (
        supabase
        .table("filltered_users_eu")   # change to your table
        .select("id, username")
        .order("id")
        .limit(1)
        .execute()
    )

    if not result.data:
        return jsonify({"error": "No usernames left"}), 404

    row = result.data[0]

    # Delete the row after taking it
    (
        supabase
        .table("filltered_users_eu")
        .delete()
        .eq("id", row["id"])
        .execute()
    )

    return jsonify({
        "url": row["username"]
    })



@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    print("🚀 Backend starting on port 8000")
    app.run(host="0.0.0.0", port=8000, debug=True, use_reloader=False)
