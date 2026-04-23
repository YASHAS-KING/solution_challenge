// webapp/src/components/dashboard/DeviceStatus.jsx

const DEVICE_ICONS = {
  smoke: "💨",
  fire: "🔥",
  motion: "👁️",
  flood: "💧",
  co2: "☁️",
  panic: "🔴",
  default: "📡",
};

export default function DeviceStatus({ devices }) {
  const online = devices.filter((d) => d.status === "online").length;
  const offline = devices.filter((d) => d.status === "offline").length;
  const alerting = devices.filter((d) => d.status === "alerting").length;

  return (
    <div className="device-status">
      <div className="device-summary">
        <SummaryCard label="Online" count={online} color="#22c55e" />
        <SummaryCard label="Alerting" count={alerting} color="#ef4444" pulse />
        <SummaryCard label="Offline" count={offline} color="#6b7280" />
        <SummaryCard label="Total" count={devices.length} color="#3b82f6" />
      </div>

      <div className="device-grid">
        {devices.length === 0 && (
          <div className="empty-state">
            <span>📡</span>
            <p>No devices registered</p>
          </div>
        )}
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ label, count, color, pulse }) {
  return (
    <div className={`dev-summary-card ${pulse ? "pulsing" : ""}`} style={{ "--card-color": color }}>
      <span className="sum-count" style={{ color }}>{count}</span>
      <span className="sum-label">{label}</span>
    </div>
  );
}

function DeviceCard({ device }) {
  const icon = DEVICE_ICONS[device.type] || DEVICE_ICONS.default;
  const lastSeen = device.lastSeen
    ? new Date(device.lastSeen?.toDate ? device.lastSeen.toDate() : device.lastSeen).toLocaleTimeString()
    : "—";

  return (
    <div className={`device-card status-${device.status}`}>
      <div className="device-icon">{icon}</div>
      <div className="device-info">
        <div className="device-id">{device.id}</div>
        <div className="device-type">{device.type?.toUpperCase()}</div>
        <div className="device-location">{device.location || "—"}</div>
        <div className="device-last-seen">Last: {lastSeen}</div>
      </div>
      <div className={`device-dot ${device.status}`} title={device.status} />
      {device.readings && (
        <div className="device-readings">
          {Object.entries(device.readings).map(([k, v]) => (
            <span key={k} className="reading-pill">
              {k}: {typeof v === "number" ? v.toFixed(1) : v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
