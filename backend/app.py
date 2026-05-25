from __future__ import annotations
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
# from ultralytics import YOLOyes
app = Flask(__name__)
CORS(app)

DATA_DIR = "data"
DATA_DIR1 = Path("data")
IMAGES_DIR = "images"
IN_FILE = DATA_DIR1 / "new.txt"
IN_FILE1 = DATA_DIR1 / "OUT_FILEtxt.txt"
OUT_FILE = "filtered"
OUT_FILE1 = "EU_filtered"
OUT_FILE2 = DATA_DIR1 / "filtered.txt"
FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
TIME_RE = re.compile(r"(\d{1,2})\s*:\s*(\d{2})")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)


NET = cv2.dnn.readNetFromCaffe(
    "deploy.prototxt",
    "res10_300x300_ssd_iter_140000.caffemodel"
)

class UserIn(BaseModel):
    userid: str
    img_url: str = ""
    time_text: str = ""
    profile_url: Optional[str] = None

class FilterReq(BaseModel):
    users: List[UserIn]
    my_tz: str = "America/Los_Angeles"

def read_userids_from_file(path: Path) -> List[str]:
    if not path.exists():
        return []
    lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    return [ln.strip() for ln in lines if ln.strip()]


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


def write_userids_to_file(path: Path, userids: List[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(userids) + ("\n" if userids else ""), encoding="utf-8")

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

    all_users = read_userids_from_file(IN_FILE)

    # Take first 10
    taken_users = all_users[:TAKE_COUNT]
    remaining_users = all_users[TAKE_COUNT:]
    print ("user total", len(all_users) )
    if len(all_users) == 0:
        all_user2 = read_userids_from_file(OUT_FILE2)
        if len(all_user2) > 30:
            return jsonify({
                "path": str(IN_FILE),
                "taken": [],
                "count": 0,
                "remaining": 0
            })
        
        all_users1 = read_userids_from_file(IN_FILE1)
        # Take first 10
        taken_users1 = all_users1[:TAKE_COUNT]
        remaining_users1 = all_users1[TAKE_COUNT:]
        return jsonify({
            "path": str(IN_FILE1),
            "taken": taken_users1,
            "count": 0,
            "remaining": remaining_users1
        })

    # Read all users


    # Write remaining back to file

    return jsonify({
        "path": str(IN_FILE),
        "taken": taken_users,
        "count": 1,
        "remaining": len(remaining_users)
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
                all_users = read_userids_from_file(IN_FILE)
                remaining_users = all_users[1:]
                write_userids_to_file(IN_FILE, remaining_users)
                continue
            all_users = read_userids_from_file(IN_FILE1)
            remaining_users = all_users[1:]
            write_userids_to_file(IN_FILE1, remaining_users)
            continue
        if not time_text:
            continue
        
        if count == 0:
            all_users = read_userids_from_file(IN_FILE1)
            remaining_users = all_users[1:]
            write_userids_to_file(IN_FILE1, remaining_users)
        all_users = read_userids_from_file(IN_FILE)
        remaining_users = all_users[1:]
        write_userids_to_file(IN_FILE, remaining_users)

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
                append_id("OUT_FILE.txt", userid)
        else:
            append_id(OUT_FILE1, userid)
            append_id("EU_OUT_FILE.txt", userid)
        filtered.append(userid)
    # write_userids_to_file(OUT_FILE, filtered)

    return jsonify({
        "in_file": str(IN_FILE),
        "out_file": str(OUT_FILE),
        "count": len(filtered),
        "filtered_userids": filtered
    })

def region_file(region: str) -> str:
    safe_region = "".join(c for c in region if c.isalnum() or c in ("-", "_"))
    if not safe_region:
        safe_region = "default"
    return os.path.join(DATA_DIR, f"{safe_region}.txt")


def load_saved_ids(region: str) -> Set[str]:
    filename = region_file(region)
    if not os.path.exists(filename):
        return set()
    with open(filename, "r", encoding="utf-8") as f:
        return set(line.strip() for line in f if line.strip())


def append_id(region: str, id_value: str) -> None:
    filename = region_file(region)
    with open(filename, "a", encoding="utf-8") as f:
        f.write( id_value + "\n")

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

    saved = load_saved_ids(region)
    new_ids: List[str] = []

    for raw_id in ids:
        id_value = str(raw_id).strip()
        if not id_value or id_value in saved:
            continue
        saved.add(id_value)
        append_id(region, id_value)
        append_id("new", id_value)
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


# @app.post("/api/save-image")
# def save_image():
#     """
#     JSON:
#     {
#         "id": "user-path-or-id",
#         "img": "ture"
#     }
#     """
#     payload = request.get_json(silent=True) or {}
#     id = (payload.get("id") or "").strip()
#     img = (payload.get("img") or "").strip()
    
#     print("➡️ ID:", id)
#     if not id:
#         return jsonify({"error": "missing id or img_url"}), 400
#     saved = load_saved_ids("new")
#     saved1 = load_saved_ids("US")
#     if not id or id in saved1:
#         return jsonify({"status": "ok", "message": "id already saved"}), 200
#     append_id("US", id)
#     print("➡️ New ID:", id)
    
#     if img == "ture":
#         append_id("new", id)
#         print("➡️ New Human ID:", id)

#     return jsonify(
#         {
#             "status": "ok",
#             "new_ids": id,
#         }
#     )


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    print("🚀 Backend starting on port 8000")
    app.run(host="0.0.0.0", port=8000, debug=True, use_reloader=False)
