const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "crisis-sync-e0da3"
});

const db = admin.firestore();

async function seed() {
  await db.collection("venues").doc("hotel-grand").set({
    name: "The Grand Hotel",
    floors: 5,
    wings: ["East", "West", "North"],
    address: "123 Main Street",
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });

  const devices = [
    { id: "D-301", room: "301", floor: 3, wing: "East", venue_id: "hotel-grand" },
    { id: "D-302", room: "302", floor: 3, wing: "East", venue_id: "hotel-grand" },
    { id: "D-303", room: "303", floor: 3, wing: "East", venue_id: "hotel-grand" },
    { id: "D-304", room: "304", floor: 3, wing: "East", venue_id: "hotel-grand" },
    { id: "D-201", room: "201", floor: 2, wing: "West", venue_id: "hotel-grand" },
    { id: "D-101", room: "Lobby", floor: 1, wing: "Main", venue_id: "hotel-grand" },
  ];

  for (const d of devices) {
    await db.collection("devices").doc(d.id).set({
      ...d,
      location_verified: true,
      last_seen: admin.firestore.FieldValue.serverTimestamp(),
      active: true
    });
  }

  await db.collection("staff").doc("staff-001").set({
    name: "Ravi Kumar",
    role: "Security",
    zone: "East Wing",
    email: "ravi@grandhotel.com",
    fcm_token: null
  });

  await db.collection("staff").doc("staff-002").set({
    name: "Priya Sharma",
    role: "Medical",
    zone: "All",
    email: "priya@grandhotel.com",
    fcm_token: null
  });

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch(console.error);
