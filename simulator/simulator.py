import argparse
import uuid
import json
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
firebase_admin.initialize_app(options={
    "projectId": "crisis-sync-e0da3"
})
db = firestore.client()

# Crisis type definitions
CRISIS_TYPES = {
    "fire":     {"severity": 5, "emoji": "🔥", "description": "Fire detected via smoke + heat sensors"},
    "medical":  {"severity": 4, "emoji": "🚑", "description": "Medical emergency detected"},
    "security": {"severity": 4, "emoji": "🚨", "description": "Security breach detected via acoustic AI"},
    "flood":    {"severity": 3, "emoji": "💧", "description": "Water leak detected"},
    "unknown":  {"severity": 2, "emoji": "⚠️",  "description": "Anomaly detected, type unclear"},
}

def fire_alert(device_id, crisis_type, severity_override=None, moved=False, cluster=False):
    """Fire a single alert from a device"""

    crisis = CRISIS_TYPES.get(crisis_type, CRISIS_TYPES["unknown"])
    severity = severity_override if severity_override else crisis["severity"]

    incident_id = str(uuid.uuid4())[:8].upper()

    payload = {
        "incident_id": incident_id,
        "device_id": device_id,
        "venue_id": "hotel-grand",
        "type": crisis_type,
        "severity": severity,
        "description": crisis["description"],
        "location_uncertain": moved,
        "location": {},  # Cloud Function will resolve this from device record
        "status": "active",
        "clustered": False,
        "cluster_size": 1,
        "ai_triage": None,  # Will be filled by Gemini in Stage 3
        "created_at": firestore.SERVER_TIMESTAMP,
        "source": "iot_sensor" if not moved else "iot_sensor_unverified",
    }

    # Write to Firestore — Cloud Function triggers automatically
    db.collection("incidents").document(incident_id).set(payload)

    print(f"\n{crisis['emoji']}  ALERT FIRED")
    print(f"   Incident ID : {incident_id}")
    print(f"   Device      : {device_id}")
    print(f"   Type        : {crisis_type.upper()}")
    print(f"   Severity    : {severity}/5")
    print(f"   Location    : {'⚠️  UNVERIFIED (device moved)' if moved else 'resolving from cloud...'}")
    print(f"   Firestore   : incidents/{incident_id}")
    print(f"\n   → Check Firebase console to see it live!\n")

    return incident_id

def fire_cluster(crisis_type):
    """Fire alerts from 3 nearby devices — demos Net 3 clustering"""
    nearby_devices = ["D-301", "D-302", "D-303"]
    print(f"\n🔴 CLUSTER SCENARIO — firing {len(nearby_devices)} simultaneous alerts")
    print(f"   This demos Net 3: system should merge these into one incident zone\n")
    ids = []
    for device in nearby_devices:
        iid = fire_alert(device, crisis_type)
        ids.append(iid)
    print(f"   Cluster incident IDs: {', '.join(ids)}")
    print(f"   Watch the dashboard — all 3 should show cluster_size >= 3\n")

def list_devices():
    """Show all enrolled devices"""
    print("\n📡 Enrolled devices:\n")
    docs = db.collection("devices").stream()
    for doc in docs:
        d = doc.to_dict()
        status = "✅ verified" if d.get("location_verified") else "⚠️  unverified"
        print(f"   {doc.id}  →  Room {d.get('room')}, Floor {d.get('floor')}, {d.get('wing')} Wing  [{status}]")
    print()

def simulate_move(device_id):
    """Simulate a device being physically moved — demos Net 1"""
    db.collection("devices").document(device_id).update({
        "location_verified": False
    })
    print(f"\n📦 Device {device_id} marked as MOVED")
    print(f"   location_verified = False")
    print(f"   Next alert from this device will have location_uncertain = True\n")

# ── CLI ──────────────────────────────────────────────────────────────────────

parser = argparse.ArgumentParser(
    description="CrisisSync IoT Simulator — fire test incidents into Firebase"
)
subparsers = parser.add_subparsers(dest="command")

# fire command
fire_parser = subparsers.add_parser("fire", help="Fire a single crisis alert")
fire_parser.add_argument("--device", default="D-304", help="Device ID (default: D-304)")
fire_parser.add_argument("--type",   default="fire",  help="Crisis type: fire, medical, security, flood, unknown")
fire_parser.add_argument("--severity", type=int,      help="Override severity 1-5")
fire_parser.add_argument("--moved",  action="store_true", help="Simulate device was moved (Net 1 demo)")

# cluster command
cluster_parser = subparsers.add_parser("cluster", help="Fire 3 simultaneous alerts (Net 3 demo)")
cluster_parser.add_argument("--type", default="fire", help="Crisis type")

# list command
subparsers.add_parser("list", help="List all enrolled devices")

# move command
move_parser = subparsers.add_parser("move", help="Simulate a device being moved (Net 1 demo)")
move_parser.add_argument("--device", required=True, help="Device ID to mark as moved")

args = parser.parse_args()

if args.command == "fire":
    fire_alert(args.device, args.type, args.severity, args.moved)
elif args.command == "cluster":
    fire_cluster(args.type)
elif args.command == "list":
    list_devices()
elif args.command == "move":
    simulate_move(args.device)
else:
    parser.print_help()

def auto_detect_mode(duration_seconds=60):
    """
    Mimics the ESP32 continuous sensing loop.
    Randomly triggers realistic crisis events over time.
    Run this during your demo — judges see alerts appearing
    automatically with zero human input.
    """
    import time
    import random

    print(f"\n🤖 AUTO-DETECT MODE — simulating {duration_seconds}s of continuous sensing")
    print(f"   Mimics ESP32 microphone + smoke + temp sensors running 24/7")
    print(f"   Press Ctrl+C to stop\n")

    scenarios = [
        ("D-304", "fire",     "Smoke 450ppm + temp +8°C in 45s"),
        ("D-201", "medical",  "Person fell — no movement 120s + scream detected"),
        ("D-302", "security", "Glass break acoustic pattern + 92dB scream"),
        ("D-303", "fire",     "Smoke 380ppm — possible kitchen fire"),
    ]

    elapsed = 0
    for device_id, crisis_type, trigger_reason in scenarios:
        wait = random.randint(8, 18)
        print(f"   ⏱  Sensing... ({wait}s until next anomaly detected)")
        time.sleep(wait)
        elapsed += wait
        if elapsed > duration_seconds:
            break
        print(f"\n   📡 ANOMALY DETECTED: {trigger_reason}")
        fire_alert(device_id, crisis_type)

    print("\n✅ Auto-detect session complete\n")

