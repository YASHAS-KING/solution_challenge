// webapp/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import GuestSOS from "./pages/GuestSOS";
import StaffMobile from "./pages/StaffMobile";
import QRGenerator from "./pages/QRGenerator";
import "./styles/global.css";
import "./styles/dashboard.css";
import "./styles/sos.css";
import "./styles/devices.css";


// Inside your <Routes> block:
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main command dashboard */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Guest SOS PWA — loaded via QR code */}
        <Route path="/sos" element={<GuestSOS />} />

        {/* Staff mobile view */}
        <Route path="/staff" element={<StaffMobile />} />

        {/* QR code generator for room setup */}
        <Route path="/qr" element={<QRGenerator />} />

        <Route path="*" element={<Navigate to="/" />} />
      
      </Routes>
    </BrowserRouter>
  );
}
