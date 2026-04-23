// webapp/src/components/dashboard/TriagePanel.jsx

const SEVERITY_COLORS = ["", "#22c55e", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];
const SEVERITY_LABELS = ["", "Low", "Minor", "Moderate", "High", "Critical"];

export default function TriagePanel({ incidents }) {
  const withTriage = incidents.filter((i) => i.aiSummary || i.severity);

  // Group by severity
  const bySeverity = [5, 4, 3, 2, 1].map((sev) => ({
    sev,
    items: withTriage.filter((i) => i.severity === sev),
  }));

  // Stats
  const avgSeverity = withTriage.length
    ? (withTriage.reduce((s, i) => s + (i.severity || 0), 0) / withTriage.length).toFixed(1)
    : 0;

  return (
    <div className="triage-panel">
      <div className="triage-header">
        <div className="triage-stat">
          <span className="tstat-value">{withTriage.length}</span>
          <span className="tstat-label">Triaged</span>
        </div>
        <div className="triage-stat">
          <span className="tstat-value" style={{ color: SEVERITY_COLORS[Math.round(avgSeverity)] }}>
            {avgSeverity}
          </span>
          <span className="tstat-label">Avg Severity</span>
        </div>
        <div className="triage-stat">
          <span className="tstat-value" style={{ color: "#ef4444" }}>
            {withTriage.filter((i) => i.severity >= 4).length}
          </span>
          <span className="tstat-label">High Priority</span>
        </div>
        <div className="triage-stat">
          <span className="tstat-value">
            {incidents.filter((i) => i.status === "resolved").length}
          </span>
          <span className="tstat-label">Resolved</span>
        </div>
      </div>

      <div className="triage-columns">
        {bySeverity.map(({ sev, items }) => (
          <div key={sev} className="triage-col">
            <div
              className="col-header"
              style={{ borderColor: SEVERITY_COLORS[sev], color: SEVERITY_COLORS[sev] }}
            >
              <span className="col-sev">SEV {sev}</span>
              <span className="col-label">{SEVERITY_LABELS[sev]}</span>
              <span className="col-count">{items.length}</span>
            </div>
            <div className="col-cards">
              {items.length === 0 && (
                <div className="col-empty">None</div>
              )}
              {items.map((incident) => (
                <TriageCard key={incident.id} incident={incident} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TriageCard({ incident }) {
  const color = SEVERITY_COLORS[incident.severity || 1];
  return (
    <div className="triage-card" style={{ "--sev-color": color }}>
      <div className="tc-top">
        <span className="tc-type">{incident.type?.toUpperCase()}</span>
        <span className={`tc-status ${incident.status}`}>{incident.status}</span>
      </div>
     <p className="tc-location">
  {typeof incident.location === "string" ? incident.location : `Device ${incident.device_id}`}
</p>
      {incident.aiSummary && (
        <p className="tc-ai">
          <span className="ai-tag">AI</span> {incident.aiSummary}
        </p>
      )}
      {incident.confidence && (
        <div className="tc-confidence">
          <span>Confidence</span>
          <div className="conf-bar">
            <div className="conf-fill" style={{ width: `${incident.confidence * 100}%`, background: color }} />
          </div>
          <span>{Math.round(incident.confidence * 100)}%</span>
        </div>
      )}
    </div>
  );
}
