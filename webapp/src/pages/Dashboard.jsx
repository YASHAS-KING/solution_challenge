// webapp/src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import IncidentFeed from "../components/dashboard/IncidentFeed";
import DeviceStatus from "../components/dashboard/DeviceStatus";
import SeverityHeatmap from "../components/dashboard/SeverityHeatmap";
import TriagePanel from "../components/dashboard/TriagePanel";
import Analytics from "../components/dashboard/Analytics";

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");
  const [clearing, setClearing] = useState(false);

  // Live incident feed from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "incidents"),
      orderBy("created_at", "desc"),
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setIncidents(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Device status feed
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "devices"), (snap) => {
      setDevices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const activeCount = incidents.filter((i) => i.status === "active").length;
  const criticalCount = incidents.filter((i) => i.severity >= 4).length;
  const onlineDevices = devices.filter((d) => d.status === "online").length;

  const handleAcknowledge = async (incidentId) => {
    await updateDoc(doc(db, "incidents", incidentId), {
      status: "acknowledged",
      acknowledgedAt: new Date().toISOString(),
    });
  };

  const handleResolve = async (incidentId) => {
    await updateDoc(doc(db, "incidents", incidentId), {
      status: "resolved",
      resolvedAt: new Date().toISOString(),
    });
  };

  const simulateAlert = async () => {
    const types = ["fire", "medical", "security", "flood"];
    const deviceList = ["D-101", "D-201", "D-301", "D-302", "D-303", "D-304"];
    const locations = ["Floor 1 - Room 101", "Floor 2 - Room 201", "Floor 3 - Room 301", "Lobby", "Restaurant"];

    const type = types[Math.floor(Math.random() * types.length)];
    const device = deviceList[Math.floor(Math.random() * deviceList.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const severity = Math.floor(Math.random() * 4) + 2;

    await addDoc(collection(db, "incidents"), {
      type,
      device_id: device,
      venue_id: "hotel-grand",
      source: "webapp_simulation",
      status: "active",
      severity,
      location,
      description: `${type} detected via simulation`,
      ai_triage: null,
      clustered: false,
      created_at: serverTimestamp(),
    });
  };

  const clearAllAlerts = async () => {
    if (!window.confirm("Delete all incidents? This cannot be undone.")) return;
    setClearing(true);
    try {
      const snap = await getDocs(collection(db, "incidents"));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
      setSelectedIncident(null);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">CrisisSync</span>
          <span className="brand-sub">Command Center</span>
        </div>
        <div className="dash-stats">
          <StatBadge label="ACTIVE" value={activeCount} color="var(--red)" pulse={activeCount > 0} />
          <StatBadge label="CRITICAL" value={criticalCount} color="var(--orange)" />
          <StatBadge label="DEVICES ONLINE" value={`${onlineDevices}/${devices.length}`} color="var(--green)" />
        </div>
        <div className="dash-time">
          <LiveClock />
        </div>
        <div className="dash-actions">
          <button className="sim-btn" onClick={simulateAlert}>
            🚨 Simulate Alert
          </button>
          <button className="clear-btn" onClick={clearAllAlerts} disabled={clearing}>
            {clearing ? "Clearing..." : "🗑️ Clear All"}
          </button>
        </div>
      </header>

      {/* Nav Tabs */}
      <nav className="dash-nav">
        {["feed", "triage", "devices", "heatmap", "analytics"].map((tab) => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "feed" && "📡 Live Feed"}
            {tab === "triage" && "🧠 AI Triage"}
            {tab === "devices" && "🔌 Devices"}
            {tab === "heatmap" && "🌡️ Heatmap"}
            {tab === "analytics" && "📊 Analytics"}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="dash-main">
        {loading ? (
          <div className="loading-state">
            <div className="pulse-ring" />
            <p>Connecting to live feed...</p>
          </div>
        ) : (
          <>
            {activeTab === "feed" && (
              <IncidentFeed
                incidents={incidents}
                onSelect={setSelectedIncident}
                selected={selectedIncident}
                onAcknowledge={handleAcknowledge}
                onResolve={handleResolve}
              />
            )}
            {activeTab === "triage" && (
              <TriagePanel incidents={incidents} />
            )}
            {activeTab === "devices" && (
              <DeviceStatus devices={devices} />
            )}
            {activeTab === "heatmap" && (
              <SeverityHeatmap incidents={incidents} />
            )}
            {activeTab === "analytics" && (
  <Analytics incidents={incidents} />
)}

          </>
        )}
      </main>
    </div>
  );
}

function StatBadge({ label, value, color, pulse }) {
  return (
    <div className={`stat-badge ${pulse ? "pulsing" : ""}`} style={{ "--badge-color": color }}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="live-clock">
      <span className="clock-time">{time.toLocaleTimeString()}</span>
      <span className="clock-date">{time.toLocaleDateString()}</span>
    </div>
  );
}