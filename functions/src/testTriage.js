require("dotenv").config();
const { triageIncident } = require("./geminiTriage");

const mockIncident = {
  device_id: "D-304",
  type: "fire",
  severity: 5,
  description: "Smoke 450ppm + temperature spike 8°C in 45 seconds + screaming detected 91dB",
  location: { floor: 3, wing: "East", room: "304" },
  location_uncertain: false,
  clustered: true,
  cluster_size: 3,
};

async function test() {
  console.log("Testing Gemini triage...\n");
  console.log("Input:", JSON.stringify(mockIncident, null, 2));
  console.log("\nCalling Gemini...\n");

  const result = await triageIncident(mockIncident);

  console.log("=== GEMINI TRIAGE RESULT ===\n");
  console.log(JSON.stringify(result, null, 2));
}

test().catch(console.error);
