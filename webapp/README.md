# ⚡ CrisisSync — Rapid Crisis Response for Hospitality
### Google Solution Challenge 2026

> A real-time crisis coordination platform that unifies IoT sensors, Gemini AI triage, a live command dashboard, and guest SOS reporting into one system.

---

## 👥 Team

| Name | Stage | What they built |
|---|---|---|
| **Yashas S** | Stage 1, 2, 3 | Firebase setup, IoT simulator, Gemini AI triage Cloud Functions |
| **Yashwanth V** | Stage 4, 5 | React dashboard, Guest SOS PWA, QR generator, Staff mobile view |
| **Vikas Yadav** | Stage 6 | Analytics / final deployment |

---

## 🗺️ Project Structure

```
solution_challenge/
├── simulator/               # Stage 2 — Python IoT sensor simulator
│   ├── simulator.py         # CLI tool to fire test crisis alerts
│   ├── requirements.txt     # Python dependencies
│   └── venv/                # Python virtual environment (not in git)
│
├── functions/               # Stage 3 — Firebase Cloud Functions (Node.js)
│   ├── src/
│   │   ├── index.js         # Main Cloud Functions entry point
│   │   └── testTriage.js    # Test script for Gemini triage
│   └── package.json
│
└── webapp/                  # Stage 4 & 5 — React web app (Vite)
    ├── public/
    │   └── manifest.json    # PWA manifest for guest SOS installability
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx    # Stage 4: Manager command dashboard
    │   │   ├── GuestSOS.jsx     # Stage 5: Guest panic button PWA
    │   │   ├── StaffMobile.jsx  # Stage 5: Staff mobile incident view
    │   │   └── QRGenerator.jsx  # Stage 5: QR code generator per room
    │   ├── components/dashboard/
    │   │   ├── IncidentFeed.jsx     # Live incident list + detail panel
    │   │   ├── TriagePanel.jsx      # AI triage kanban by severity
    │   │   ├── DeviceStatus.jsx     # IoT device grid
    │   │   └── SeverityHeatmap.jsx  # Location x crisis type heatmap
    │   ├── styles/
    │   │   ├── global.css       # CSS variables, fonts, base styles
    │   │   ├── dashboard.css    # Dashboard + all tab styles
    │   │   └── sos.css          # Guest SOS + staff mobile styles
    │   ├── firebase.js          # Firebase initialization
    │   └── App.jsx              # React Router — all routes
    ├── .env                 # Firebase config (NOT in git)
    └── package.json
```

---

## 🔥 Firestore Data Schema

### `incidents` collection
Each document = one crisis event

```json
{
  "type": "fire",
  "device_id": "D-304",
  "venue_id": "hotel-grand",
  "source": "iot_sensor | guest_sos | webapp_simulation",
  "status": "active | acknowledged | resolved",
  "severity": 5,
  "location": "Floor 3 - Room 304",
  "description": "Fire detected via smoke + heat sensors",
  "ai_triage": "Gemini AI summary written by Cloud Function",
  "sopChecklist": ["Evacuate floor 3", "Call fire dept"],
  "clustered": false,
  "created_at": "Firestore Timestamp",
  "acknowledgedAt": "ISO string",
  "resolvedAt": "ISO string"
}
```

### `devices` collection
Each document = one IoT sensor device

```json
{
  "id": "D-304",
  "type": "fire | smoke | motion | flood",
  "status": "online | offline | alerting",
  "location": "Floor 3 - Room 304",
  "room": "304",
  "floor": "3",
  "wing": "East",
  "location_verified": true,
  "lastSeen": "Firestore Timestamp",
  "readings": { "temp": 28.5, "smoke": 0.02 }
}
```

---

## 🚀 Routes (webapp)

| URL | Who uses it | What it does |
|---|---|---|
| `/` or `/dashboard` | Hotel managers | Full command center with live feed, AI triage, devices, heatmap |
| `/sos?room=304` | Hotel guests | One-tap SOS panic button loaded via QR code |
| `/staff` | On-floor staff | Lightweight mobile incident list |
| `/qr` | Hotel admin | Generate and download QR codes for each room |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- Python 3.9+
- Firebase CLI: `npm install -g firebase-tools`
- Google Cloud CLI: https://cloud.google.com/sdk/docs/install

---

### 1. Clone the repo

```bash
git clone https://github.com/YASHAS-KING/solution_challenge.git
cd solution_challenge
```

---

### 2. Set up the webapp (Stage 4 & 5)

```bash
cd webapp
npm install
```

Create a `.env` file inside `webapp/` with these values (get from Firebase Console → Project Settings → Your Apps → Config):

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=crisis-sync-e0da3.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://crisis-sync-e0da3-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=crisis-sync-e0da3
VITE_FIREBASE_STORAGE_BUCKET=crisis-sync-e0da3.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ NEVER commit `.env` to GitHub. It is already in `.gitignore`.

Run the webapp:

```bash
npm run dev
```

Open: `http://localhost:5173`

---

### 3. Set up the simulator (Stage 2)

**Windows:**
```powershell
cd simulator
py -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Mac/Linux:**
```bash
cd simulator
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Authenticate with Google Cloud (one-time setup):
```bash
gcloud auth application-default login
gcloud config set project crisis-sync-e0da3
gcloud auth application-default set-quota-project crisis-sync-e0da3
```

---

### 4. Set up Cloud Functions (Stage 3)

```bash
cd functions
npm install
firebase deploy --only functions
```

Test Gemini triage locally:
```bash
node src/testTriage.js
```

---

## 🧪 Testing the Full System

### Fire test alerts via simulator

```bash
cd simulator

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Fire a single alert
py simulator.py fire --device D-304 --type fire

# Fire a cluster of 3 simultaneous alerts
py simulator.py cluster --type fire

# List all enrolled devices
py simulator.py list

# Delete all incidents
py simulator.py clear
```

### Or use the dashboard buttons (no simulator needed)
- **🚨 Simulate Alert** — fires a random alert directly from the browser
- **🗑️ Clear All** — deletes all incidents from Firestore

### Test Guest SOS PWA
Open: `http://localhost:5173/sos?room=304`

### Generate room QR codes
Open: `http://localhost:5173/qr`

---

## 🌐 Deployment

Deploy webapp to Firebase Hosting:

```bash
cd webapp
npm run build
firebase deploy --only hosting
```

---

## 🔒 Environment Variables and Security

The `.env` file contains Firebase keys and is excluded from git via `.gitignore`.

To get your own values:
1. Go to https://console.firebase.google.com
2. Select project `crisis-sync-e0da3`
3. Project Settings → Your Apps → SDK setup and configuration
4. Copy the `firebaseConfig` values



---

## 💡 Notes for Stage 6 (Vikas)

- The webapp is fully built. Run `npm run dev` inside `webapp/` to start it.
- All incidents flow through Firestore — the dashboard reads them in real time automatically.
- The `ai_triage` and `sopChecklist` fields are written by the Cloud Functions (Stage 3) — the dashboard displays them automatically once populated.
- For the demo video, use the **🚨 Simulate Alert** button on the dashboard to generate live incidents without needing the Python simulator.
- Firebase Hosting is configured — run `npm run build && firebase deploy --only hosting` to deploy.
- Use `/qr` route to generate and print QR codes for demo hotel rooms.
- Do NOT touch `webapp/src/` files unless you know what you're doing — the frontend is complete.