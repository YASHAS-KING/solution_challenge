// webapp/src/pages/QRGenerator.jsx
// Staff-facing page to generate QR codes for each room
import { useState, useRef } from "react";

export default function QRGenerator() {
  const [rooms, setRooms] = useState([
    { number: "101", floor: "1" },
    { number: "102", floor: "1" },
    { number: "201", floor: "2" },
    { number: "202", floor: "2" },
    { number: "301", floor: "3" },
    { number: "302", floor: "3" },
  ]);
  const [newRoom, setNewRoom] = useState("");
  const [venue, setVenue] = useState("Main Building");
  const baseUrl = window.location.origin;

  const addRoom = () => {
    if (newRoom.trim()) {
      setRooms([...rooms, { number: newRoom.trim(), floor: newRoom[0] || "1" }]);
      setNewRoom("");
    }
  };

  return (
    <div className="qr-page">
      <div className="qr-header">
        <h1>⚡ QR Code Generator</h1>
        <p>Generate room-specific SOS QR codes for guest use</p>
      </div>

      <div className="qr-config">
        <div className="config-row">
          <label>Venue Name</label>
          <input
            className="form-input"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g. Main Building"
          />
        </div>
        <div className="config-row">
          <label>Add Room</label>
          <div className="add-row">
            <input
              className="form-input"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              placeholder="e.g. 304"
              onKeyDown={(e) => e.key === "Enter" && addRoom()}
            />
            <button className="btn-primary" onClick={addRoom}>Add</button>
          </div>
        </div>
      </div>

      <div className="qr-grid">
        {rooms.map((room) => {
          const url = `${baseUrl}/sos?room=${room.number}&venue=${encodeURIComponent(venue)}`;
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
          return (
            <div key={room.number} className="qr-card">
              <img src={qrUrl} alt={`QR for Room ${room.number}`} className="qr-image" />
              <div className="qr-info">
                <span className="qr-room">Room {room.number}</span>
                <span className="qr-floor">Floor {room.floor}</span>
              </div>
              <a href={qrUrl} download={`sos-room-${room.number}.png`} className="btn-download">
                ⬇ Download
              </a>
            </div>
          );
        })}
      </div>

      <div className="qr-instructions">
        <h3>📋 Setup Instructions</h3>
        <ol>
          <li>Download QR codes for each room above</li>
          <li>Print and laminate them</li>
          <li>Place inside rooms near the bed or desk</li>
          <li>Guests scan with any phone camera — no app needed</li>
        </ol>
      </div>
    </div>
  );
}
