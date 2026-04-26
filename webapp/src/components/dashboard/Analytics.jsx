import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";
import { format, differenceInMinutes } from "date-fns";

export default function Analytics({ incidents }) {

  // Response time = acknowledgedAt - created_at (in minutes)
  const chartData = incidents
    .filter(i => i.created_at && i.acknowledgedAt)
    .map(i => ({
      name: i.type?.toUpperCase() + " · " + (i.location?.slice(0, 12) || i.id.slice(0, 6)),
      responseTime: differenceInMinutes(
        new Date(i.acknowledgedAt),
        i.created_at.toDate()   // created_at is a Firestore Timestamp
      ),
    }));

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 Analytics Dashboard</h2>

      {/* ── RESPONSE TIME CHART ── */}
      <h3>Response Time per Incident (minutes)</h3>

      {chartData.length === 0 ? (
        <p style={{ color: "#888" }}>
          No acknowledged incidents yet. Acknowledge some alerts to see chart data.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis label={{ value: "mins", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Bar dataKey="responseTime" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* ── INCIDENT TIMELINE LOG ── */}
      <h3 style={{ marginTop: "2rem" }}>🕒 Incident Timeline Log</h3>

      {incidents.length === 0 ? (
        <p style={{ color: "#888" }}>No incidents found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {incidents.map(incident => (
            <div key={incident.id} style={{
              border: "1px solid #ddd", borderRadius: "8px",
              padding: "1rem", background: "#f9fafb"
            }}>
              <strong>
                {incident.type?.toUpperCase() || "Unknown"} — {incident.location || "Unknown Location"}
              </strong>
              <span style={{
                marginLeft: "0.75rem", fontSize: "0.75rem",
                padding: "2px 8px", borderRadius: "999px", background: "#e0e7ff", color: "#4f46e5"
              }}>
                {incident.status}
              </span>

              <ul style={{ marginTop: "0.5rem", paddingLeft: "1.2rem", color: "#555" }}>

                {/* created_at is a Firestore Timestamp → use .toDate() */}
                {incident.created_at && (
                  <li>🔴 Reported: {format(incident.created_at.toDate(), "dd MMM yyyy, hh:mm a")}</li>
                )}

                {/* acknowledgedAt is stored as ISO string → use new Date() */}
                {incident.acknowledgedAt && (
                  <li>🟡 Acknowledged: {format(new Date(incident.acknowledgedAt), "dd MMM yyyy, hh:mm a")}</li>
                )}

                {/* resolvedAt is stored as ISO string → use new Date() */}
                {incident.resolvedAt && (
                  <li>🟢 Resolved: {format(new Date(incident.resolvedAt), "dd MMM yyyy, hh:mm a")}</li>
                )}

              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}