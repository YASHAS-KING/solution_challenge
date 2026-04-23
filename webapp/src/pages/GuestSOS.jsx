// webapp/src/pages/GuestSOS.jsx
// This is the PWA page loaded via QR code: /sos?room=304&venue=lobby
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const CRISIS_TYPES = [
  { id: "fire", icon: "🔥", label: "Fire / Smoke" },
  { id: "medical", icon: "🏥", label: "Medical Emergency" },
  { id: "security", icon: "🚨", label: "Security / Assault" },
  { id: "flood", icon: "💧", label: "Flood / Water Leak" },
  { id: "other", icon: "⚠️", label: "Other Emergency" },
];

export default function GuestSOS() {
  const params = new URLSearchParams(window.location.search);
  const roomNumber = params.get("room") || "Unknown";
  const venue = params.get("venue") || "";

  const [step, setStep] = useState("home"); // home | form | submitted
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState("");
  const [guestName, setGuestName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handlePanicSubmit = async () => {
    if (!selectedType) {
      setError("Please select the type of emergency.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      await addDoc(collection(db, "incidents"), {
        type: selectedType,
        source: "guest_sos",
        status: "active",
        severity: selectedType === "fire" || selectedType === "security" ? 4 : 3,
        location: roomNumber !== "Unknown" ? `Room ${roomNumber}` : venue || "Unknown",
        roomNumber,
        venue,
        guestName: guestName || "Anonymous Guest",
        description: description || `${selectedType} emergency reported by guest`,
        aiSummary: null, // Will be filled by Cloud Function
        timestamp: serverTimestamp(),
        rawData: { source: "guest_pwa", roomNumber, venue },
      });
      setStep("submitted");
    } catch (err) {
      setError("Failed to send alert. Please call reception.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "submitted") {
    return <SubmittedScreen roomNumber={roomNumber} />;
  }

  if (step === "form") {
    return (
      <SOSForm
        roomNumber={roomNumber}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        description={description}
        setDescription={setDescription}
        guestName={guestName}
        setGuestName={setGuestName}
        onSubmit={handlePanicSubmit}
        onBack={() => setStep("home")}
        submitting={submitting}
        error={error}
      />
    );
  }

  return <SOSHome roomNumber={roomNumber} onPress={() => setStep("form")} />;
}

function SOSHome({ roomNumber, onPress }) {
  return (
    <div className="sos-home">
      <div className="sos-header">
        <div className="sos-logo">⚡ CrisisSync</div>
        {roomNumber !== "Unknown" && (
          <div className="sos-room">Room {roomNumber}</div>
        )}
      </div>

      <div className="sos-hero">
        <p className="sos-tagline">Are you in an emergency?</p>
        <button className="sos-panic-btn" onClick={onPress}>
          <span className="sos-btn-icon">🆘</span>
          <span className="sos-btn-text">SEND SOS</span>
          <span className="sos-btn-sub">Tap to alert staff immediately</span>
        </button>
        <p className="sos-note">
          Staff will be notified instantly. For life-threatening emergencies,
          also call <strong>112</strong>.
        </p>
      </div>

      <div className="sos-footer">
        <a href="tel:112" className="sos-call-btn">📞 Call Emergency: 112</a>
      </div>
    </div>
  );
}

function SOSForm({
  roomNumber, selectedType, setSelectedType,
  description, setDescription,
  guestName, setGuestName,
  onSubmit, onBack, submitting, error,
}) {
  return (
    <div className="sos-form-page">
      <div className="sos-form-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>🆘 Emergency Report</h1>
        {roomNumber !== "Unknown" && <span className="room-badge">Room {roomNumber}</span>}
      </div>

      <div className="sos-form-body">
        <div className="form-section">
          <label className="form-label">Type of Emergency *</label>
          <div className="crisis-grid">
            {CRISIS_TYPES.map((c) => (
              <button
                key={c.id}
                className={`crisis-btn ${selectedType === c.id ? "selected" : ""}`}
                onClick={() => setSelectedType(c.id)}
              >
                <span className="crisis-icon">{c.icon}</span>
                <span className="crisis-label">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">Your Name (optional)</label>
          <input
            className="form-input"
            placeholder="e.g. John Smith"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label className="form-label">Describe the situation (optional)</label>
          <textarea
            className="form-textarea"
            placeholder="Any details that can help staff respond..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}

        <button
          className={`sos-submit-btn ${submitting ? "loading" : ""}`}
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? "Sending alert..." : "🚨 Send Emergency Alert"}
        </button>

        <a href="tel:112" className="sos-call-btn secondary">
          📞 Also call 112 for life-threatening emergencies
        </a>
      </div>
    </div>
  );
}

function SubmittedScreen({ roomNumber }) {
  return (
    <div className="sos-submitted">
      <div className="submitted-icon">✅</div>
      <h1>Alert Sent!</h1>
      <p>Staff have been notified and are on their way.</p>
      {roomNumber !== "Unknown" && (
        <p className="submitted-room">Room <strong>{roomNumber}</strong></p>
      )}
      <div className="submitted-tips">
        <p>While you wait:</p>
        <ul>
          <li>Stay calm and stay where you are</li>
          <li>If fire — move to nearest exit</li>
          <li>Keep your door unlocked for staff</li>
        </ul>
      </div>
      <a href="tel:112" className="sos-call-btn">📞 Call 112 for immediate danger</a>
    </div>
  );
}
