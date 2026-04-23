// webapp/src/components/dashboard/IncidentFeed.jsx
import { useState } from "react";

const SEVERITY_LABELS = ["", "Low", "Minor", "Moderate", "High", "Critical"];
const SEVERITY_COLORS = ["", "#22c55e", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];
const TYPE_ICONS = {
  fire: "🔥",
  medical: "🏥",
  security: "🔒",
  flood: "💧",
  smoke: "💨",
  panic: "🚨",
  sos: "🆘",
  default: "⚠️",
};

export default function IncidentFeed({
  incidents,
  onSelect,
  selected,
  onAcknowledge,
  onResolve,
}) {
  const [filter, setFilter] = useState("all");

  const filtered = incidents.filter((i) => {
    if (filter === "active") return i.status === "active";
    if (filter === "acknowledged") return i.status === "acknowledged";
    if (filter === "resolved") return i.status === "resolved";
    return true;
  });

  return (
    <div className="incident-feed">
      {/* Filter bar */}
      <div className="feed-filters">
        {["all", "active", "acknowledged", "resolved"].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="filter-count">
              {f === "all"
                ? incidents.length
                : incidents.filter((i) => i.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="feed-layout">
        {/* Incident list */}
        <div className="feed-list">
          {filtered.length === 0 && (
            <div className="empty-state">
              <span>✅</span>
              <p>No incidents</p>
            </div>
          )}
          {filtered.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              isSelected={selected?.id === incident.id}
              onClick={() => onSelect(incident)}
              onAcknowledge={onAcknowledge}
              onResolve={onResolve}
            />
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <IncidentDetail
            incident={selected}
            onAcknowledge={onAcknowledge}
            onResolve={onResolve}
            onClose={() => onSelect(null)}
          />
        )}
      </div>
    </div>
  );
}

function IncidentCard({ incident, isSelected, onClick, onAcknowledge, onResolve }) {
  const sev = incident.severity || 1;
  const icon = TYPE_ICONS[incident.type] || TYPE_ICONS.default;
  const color = SEVERITY_COLORS[sev];
  const timeAgo = getTimeAgo(incident.created_at);

  return (
    <div
      className={`incident-card ${isSelected ? "selected" : ""} status-${incident.status}`}
      onClick={onClick}
      style={{ "--sev-color": color }}
    >
      <div className="card-sev-bar" />
      <div className="card-icon">{icon}</div>
      <div className="card-body">
        <div className="card-top">
          <span className="card-type">{incident.type?.toUpperCase() || "UNKNOWN"}</span>
          <span className="card-time">{timeAgo}</span>
        </div>
        <p className="card-location">
  {typeof incident.location === "string" ? incident.location : `Device ${incident.device_id}`}
</p>
        <p className="card-summary">{incident.ai_triage || incident.description || "No description"}</p>
        <div className="card-meta">
          <span className="sev-badge" style={{ background: color }}>
            SEV {sev} — {SEVERITY_LABELS[sev]}
          </span>
          <span className={`status-chip ${incident.status}`}>{incident.status}</span>
        </div>
      </div>
      {incident.status === "active" && (
        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn-ack" onClick={() => onAcknowledge(incident.id)}>
            ACK
          </button>
        </div>
      )}
    </div>
  );
}

function IncidentDetail({ incident, onAcknowledge, onResolve, onClose }) {
  const sev = incident.severity || 1;
  const color = SEVERITY_COLORS[sev];

  return (
    <div className="incident-detail">
      <button className="detail-close" onClick={onClose}>✕</button>
      <div className="detail-header" style={{ "--sev-color": color }}>
        <span className="detail-icon">{TYPE_ICONS[incident.type] || "⚠️"}</span>
        <div>
          <h2>{incident.type?.toUpperCase()}</h2>
         <p>{typeof incident.location === "string" ? incident.location : `Device ${incident.device_id}`}</p>
        </div>
        <span className="sev-badge large" style={{ background: color }}>
          SEV {sev} — {SEVERITY_LABELS[sev]}
        </span>
      </div>

      <div className="detail-section">
        <h3>🧠 AI Triage Summary</h3>
        <p className="ai-summary">{incident.ai_triage || "No AI summary available"}</p>
      </div>

      {incident.sopChecklist && (
        <div className="detail-section">
          <h3>📋 SOP Checklist</h3>
          <ul className="sop-list">
            {incident.sopChecklist.map((item, i) => (
              <li key={i} className="sop-item">
                <input type="checkbox" id={`sop-${i}`} />
                <label htmlFor={`sop-${i}`}>{item}</label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="detail-section">
        <h3>📊 Incident Data</h3>
        <div className="detail-grid">
          <DetailRow label="Device ID" value={incident.device_id} />
          <DetailRow label="Source" value={incident.source} />
          <DetailRow label="Reported at" value={formatTime(incident.created_at)} />
          <DetailRow label="Status" value={incident.status} />
          <DetailRow label="Venue" value={incident.venue_id} />
          <DetailRow label="Clustered" value={incident.clustered ? "Yes" : "No"} />
        </div>
      </div>

      {incident.rawData && (
        <div className="detail-section">
          <h3>🔍 Raw Sensor Data</h3>
          <pre className="raw-data">{JSON.stringify(incident.rawData, null, 2)}</pre>
        </div>
      )}

      <div className="detail-actions">
        {incident.status === "active" && (
          <button className="btn-primary" onClick={() => onAcknowledge(incident.id)}>
            ✓ Acknowledge
          </button>
        )}
        {incident.status !== "resolved" && (
          <button className="btn-success" onClick={() => onResolve(incident.id)}>
            ✅ Mark Resolved
          </button>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value || "—"}</span>
    </div>
  );
}

function getTimeAgo(timestamp) {
  if (!timestamp) return "Unknown";
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function formatTime(timestamp) {
  if (!timestamp) return "—";
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString();
}