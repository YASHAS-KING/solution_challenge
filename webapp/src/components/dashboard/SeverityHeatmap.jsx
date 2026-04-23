// webapp/src/components/dashboard/SeverityHeatmap.jsx
import { useMemo } from "react";

const SEVERITY_COLORS = ["", "#22c55e", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];

// Safely extract a display string for location
function getLocation(incident) {
  if (typeof incident.location === "string" && incident.location.trim()) {
    return incident.location;
  }
  // fallback to device_id while Cloud Function resolves location
  if (incident.device_id) return `Device ${incident.device_id}`;
  return null;
}

export default function SeverityHeatmap({ incidents }) {
  const { locations, types, matrix, maxCount } = useMemo(() => {
    const locationSet = new Set();
    const typeSet = new Set();

    incidents.forEach((i) => {
      const loc = getLocation(i);
      if (loc) locationSet.add(loc);
      if (i.type) typeSet.add(i.type);
    });

    const locations = Array.from(locationSet).slice(0, 15);
    const types = Array.from(typeSet);

    const matrix = {};
    locations.forEach((loc) => {
      matrix[loc] = {};
      types.forEach((type) => {
        const matching = incidents.filter(
          (i) => getLocation(i) === loc && i.type === type
        );
        const avgSev = matching.length
          ? matching.reduce((s, i) => s + (i.severity || 0), 0) / matching.length
          : 0;
        matrix[loc][type] = { count: matching.length, avgSev };
      });
    });

    const maxCount = Math.max(
      1,
      ...Object.values(matrix).flatMap((row) =>
        Object.values(row).map((cell) => cell.count)
      )
    );

    return { locations, types, matrix, maxCount };
  }, [incidents]);

  // Timeline chart data (incidents per hour)
  const timelineData = useMemo(() => {
    const hours = {};
    incidents.forEach((i) => {
      const ts = i.created_at;
      if (!ts) return;
      const date = ts?.toDate ? ts.toDate() : new Date(ts);
      if (isNaN(date.getTime())) return;
      const hour = date.toLocaleString("en", { hour: "numeric", hour12: true });
      if (!hours[hour]) hours[hour] = { count: 0, maxSev: 0 };
      hours[hour].count++;
      hours[hour].maxSev = Math.max(hours[hour].maxSev, i.severity || 0);
    });
    return Object.entries(hours).slice(-12);
  }, [incidents]);

  const maxBar = Math.max(1, ...timelineData.map(([, v]) => v.count));

  return (
    <div className="heatmap-page">

      {/* Severity summary row */}
      <div className="heatmap-summary">
        {[1, 2, 3, 4, 5].map((sev) => {
          const count = incidents.filter((i) => i.severity === sev).length;
          return (
            <div key={sev} className="hm-sev-card" style={{ "--c": SEVERITY_COLORS[sev] }}>
              <div
                className="hm-sev-bar"
                style={{ height: `${(count / Math.max(1, incidents.length)) * 100}%` }}
              />
              <span className="hm-count">{count}</span>
              <span className="hm-sev-label">SEV {sev}</span>
            </div>
          );
        })}
      </div>

      {/* Timeline bar chart */}
      {timelineData.length > 0 && (
        <div className="heatmap-section">
          <h3 className="section-title">📈 Incidents Over Time</h3>
          <div className="timeline-chart">
            {timelineData.map(([hour, data]) => (
              <div key={hour} className="tl-bar-wrap">
                <div
                  className="tl-bar"
                  style={{
                    height: `${(data.count / maxBar) * 100}%`,
                    background: SEVERITY_COLORS[data.maxSev] || "#3b82f6",
                  }}
                  title={`${data.count} incidents`}
                />
                <span className="tl-label">{hour}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location × Type heatmap grid */}
      {locations.length > 0 && types.length > 0 && (
        <div className="heatmap-section">
          <h3 className="section-title">🗺️ Location × Crisis Type Matrix</h3>
          <div className="hm-grid-wrap">
            <table className="hm-table">
              <thead>
                <tr>
                  <th className="hm-corner">Location ↓ / Type →</th>
                  {types.map((t) => (
                    <th key={t} className="hm-col-head">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc}>
                    <td className="hm-row-head">{loc}</td>
                    {types.map((type) => {
                      const cell = matrix[loc][type];
                      const intensity = cell.count / maxCount;
                      const bgColor = cell.count > 0
                        ? SEVERITY_COLORS[Math.round(cell.avgSev)] || "#3b82f6"
                        : "transparent";
                      return (
                        <td
                          key={type}
                          className="hm-cell"
                          style={{
                            background: cell.count > 0
                              ? `${bgColor}${Math.round(intensity * 200 + 30).toString(16).padStart(2, "0")}`
                              : "transparent",
                          }}
                          title={`${loc} / ${type}: ${cell.count} incidents`}
                        >
                          {cell.count > 0 ? cell.count : ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {incidents.length === 0 && (
        <div className="empty-state">
          <span>🗺️</span>
          <p>No incidents yet — simulate an alert to see the heatmap.</p>
        </div>
      )}
    </div>
  );
}