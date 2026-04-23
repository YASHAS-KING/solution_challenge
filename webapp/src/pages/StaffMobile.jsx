// webapp/src/pages/StaffMobile.jsx
// Lightweight mobile view for on-floor staff
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc } from "firebase/firestore";

const SEV_COLORS = ["", "#22c55e", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];
const TYPE_ICONS = { fire: "🔥", medical: "🏥", security: "🔒", flood: "💧", smoke: "💨", panic: "🚨", sos: "🆘" };

export default function StaffMobile() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "incidents"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    return onSnapshot(q, (snap) => {
      setIncidents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const active = incidents.filter((i) => i.status === "active");
  const rest = incidents.filter((i) => i.status !== "active");

  const handleAck = async (id) => {
    await updateDoc(doc(db, "incidents", id), {
      status: "acknowledged",
      acknowledgedAt: new Date().toISOString(),
    });
  };

  const handleResolve = async (id) => {
    await updateDoc(doc(db, "incidents", id), {
      status: "resolved",
      resolvedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="staff-mobile">
      <div className="sm-header">
        <span className="sm-logo">⚡ CrisisSync</span>
        <span className="sm-role">Staff View</span>
      </div>

      {loading && <div className="sm-loading">Connecting...</div>}

      {active.length > 0 && (
        <div className="sm-section">
          <div className="sm-section-title urgent">🚨 ACTIVE ALERTS ({active.length})</div>
          {active.map((i) => (
            <MobileCard key={i.id} incident={i} onAck={handleAck} onResolve={handleResolve} />
          ))}
        </div>
      )}

      {active.length === 0 && !loading && (
        <div className="sm-clear">
          <span>✅</span>
          <p>All clear — no active incidents</p>
        </div>
      )}

      {rest.length > 0 && (
        <div className="sm-section">
          <div className="sm-section-title">Recent</div>
          {rest.map((i) => (
            <MobileCard key={i.id} incident={i} onAck={handleAck} onResolve={handleResolve} />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileCard({ incident, onAck, onResolve }) {
  const [expanded, setExpanded] = useState(false);
  const color = SEV_COLORS[incident.severity || 1];
  const icon = TYPE_ICONS[incident.type] || "⚠️";

  return (
    <div className={`sm-card ${incident.status}`} style={{ "--c": color }} onClick={() => setExpanded(!expanded)}>
      <div className="sm-card-main">
        <span className="sm-icon">{icon}</span>
        <div className="sm-info">
          <span className="sm-type">{incident.type?.toUpperCase()}</span>
          <span className="sm-loc">{incident.location}</span>
        </div>
        <div className="sm-right">
          <span className="sm-sev" style={{ background: color }}>S{incident.severity}</span>
          <span className={`sm-status ${incident.status}`}>{incident.status}</span>
        </div>
      </div>

      {expanded && (
        <div className="sm-expanded">
          {incident.aiSummary && <p className="sm-ai">{incident.aiSummary}</p>}
          {incident.guestName && <p className="sm-guest">Guest: {incident.guestName}</p>}
          {incident.roomNumber && <p className="sm-room">Room: {incident.roomNumber}</p>}
          <div className="sm-btns">
            {incident.status === "active" && (
              <button className="sm-btn ack" onClick={(e) => { e.stopPropagation(); onAck(incident.id); }}>
                ✓ Acknowledge
              </button>
            )}
            {incident.status !== "resolved" && (
              <button className="sm-btn resolve" onClick={(e) => { e.stopPropagation(); onResolve(incident.id); }}>
                ✅ Resolve
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
