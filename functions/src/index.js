require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { triageIncident } = require("./geminiTriage");

admin.initializeApp();
const db = admin.firestore();

exports.onIncidentCreated = functions.firestore
  .document("incidents/{incidentId}")
  .onCreate(async (snap, context) => {
    const incident = snap.data();
    const incidentId = context.params.incidentId;

    console.log(`New incident: ${incidentId}`, incident);

    // Step 1: Resolve device location from Firestore
    let locationData = incident.location || {};
    let locationUncertain = incident.location_uncertain || false;

    if (incident.device_id) {
      const deviceDoc = await db
        .collection("devices")
        .doc(incident.device_id)
        .get();
      if (deviceDoc.exists) {
        const device = deviceDoc.data();
        locationUncertain = !device.location_verified;
        if (device.location_verified) {
          locationData = {
            floor: device.floor,
            wing: device.wing,
            room: device.room,
            venue_id: device.venue_id,
          };
        }
      }
    }

    // Step 2: Check for nearby clustering (Net 3)
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    const nearbySnap = await db
      .collection("incidents")
      .where("venue_id", "==", incident.venue_id || "hotel-grand")
      .where("status", "==", "active")
      .get();

    const clusterSize = nearbySnap.size;
    const clustered = clusterSize >= 3;

    // Step 3: Build enriched incident for Gemini
    const enrichedIncident = {
      ...incident,
      location: locationData,
      location_uncertain: locationUncertain,
      clustered,
      cluster_size: clusterSize,
    };

    // Step 4: Call Gemini AI triage
    console.log(`Calling Gemini triage for incident ${incidentId}...`);
    const aiTriage = await triageIncident(enrichedIncident);
    console.log(`Gemini triage complete:`, aiTriage);

    // Step 5: Write everything back to Firestore
    await snap.ref.update({
      location: locationData,
      location_uncertain: locationUncertain,
      clustered,
      cluster_size: clusterSize,
      status: aiTriage.severity_score >= 4 ? "critical" : "active",
      ai_triage: aiTriage,
      processed_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Incident ${incidentId} fully processed. Severity: ${aiTriage.severity_score}`);
    return null;
  });

exports.health = functions.https.onRequest((req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
