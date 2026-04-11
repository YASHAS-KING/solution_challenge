require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// SOP database — what staff should do for each crisis type
const SOP_STEPS = {
  fire: [
    "Activate nearest fire alarm pull station",
    "Call emergency services (fire dept) immediately",
    "Evacuate guests from affected floor via stairwells only — no elevators",
    "Deploy fire extinguisher only if fire is small and contained",
    "Account for all guests at assembly point",
    "Do not re-enter until fire marshal clears the building",
  ],
  medical: [
    "Call ambulance immediately — provide exact room location",
    "Send trained first-aid staff to scene within 2 minutes",
    "Clear the area — keep bystanders back",
    "Do not move the patient unless in immediate danger",
    "Stay on phone with emergency services until paramedics arrive",
    "Assign staff member to meet ambulance at hotel entrance",
  ],
  security: [
    "Alert all security personnel immediately via radio",
    "Lock down affected floor — prevent guest access",
    "Call police — do not confront threat directly",
    "Guide guests to safe rooms, lock doors",
    "Monitor CCTV and relay info to police",
    "Do not share incident details publicly until police arrive",
  ],
  flood: [
    "Shut off water supply valve for affected floor",
    "Evacuate rooms directly below leak",
    "Call emergency plumber immediately",
    "Remove valuables and electronics from flood path",
    "Document damage with photos for insurance",
    "Set up wet floor signs to prevent slip injuries",
  ],
  unknown: [
    "Dispatch nearest staff member to investigate immediately",
    "Keep communication channel open",
    "Assess situation and escalate to appropriate team",
    "Ensure guest safety as first priority",
    "Document everything you observe",
  ],
};

async function triageIncident(incident) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `
You are an emergency response AI for a hotel crisis management system.
Analyze this sensor alert and return ONLY a valid JSON object, no markdown, no explanation.

INCIDENT DATA:
- Device ID: ${incident.device_id}
- Reported Type: ${incident.type}
- Reported Severity: ${incident.severity}/5
- Description: ${incident.description || "No description"}
- Location Uncertain: ${incident.location_uncertain || false}
- Location: Floor ${incident.location?.floor || "unknown"}, ${incident.location?.wing || "unknown"} Wing, Room ${incident.location?.room || "unknown"}
- Multiple simultaneous alerts (clustered): ${incident.clustered || false}
- Cluster size: ${incident.cluster_size || 1}

Return this exact JSON structure:
{
  "confirmed_type": "fire|medical|security|flood|unknown",
  "severity_score": <integer 1-5>,
  "confidence": <float 0.0-1.0>,
  "summary": "<one sentence plain English summary of what is likely happening>",
  "immediate_action": "<single most important action to take RIGHT NOW>",
  "escalate_to_emergency_services": <true|false>,
  "estimated_affected_area": "<description of likely affected zone>",
  "risk_factors": ["<factor1>", "<factor2>"],
  "all_clear_criteria": "<what needs to be true before declaring all clear>"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Strip markdown fences if Gemini adds them
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Attach the correct SOP steps based on confirmed type
    parsed.sop_steps = SOP_STEPS[parsed.confirmed_type] || SOP_STEPS["unknown"];

    return parsed;

  } catch (err) {
    console.error("Gemini triage failed:", err.message);

    // Fallback — return rule-based triage if Gemini fails
    return {
      confirmed_type: incident.type || "unknown",
      severity_score: incident.severity || 3,
      confidence: 0.5,
      summary: `${incident.type} alert from device ${incident.device_id}. Manual verification required.`,
      immediate_action: "Dispatch nearest staff member to investigate immediately",
      escalate_to_emergency_services: incident.severity >= 4,
      estimated_affected_area: `Room ${incident.location?.room || "unknown"}, Floor ${incident.location?.floor || "unknown"}`,
      risk_factors: ["Automated triage unavailable — manual assessment needed"],
      all_clear_criteria: "Staff confirms scene is safe",
      sop_steps: SOP_STEPS[incident.type] || SOP_STEPS["unknown"],
      fallback: true,
    };
  }
}

module.exports = { triageIncident };
