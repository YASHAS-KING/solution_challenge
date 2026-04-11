# Hardware Layer

## Prototype vs Production

| Layer | Prototype (submission) | Production |
|-------|----------------------|------------|
| Detection | Python simulator fires JSON | ESP32 with MQ-2 + DHT22 + INMP441 mic |
| Acoustic AI | Simulated via CLI flags | TensorFlow Lite model on-device |
| Location | Seeded in Firestore | QR enrollment + BLE trilateration |
| Trigger | Manual `python3 simulator.py fire` | Autonomous firmware loop |

## Sensors planned for hardware stage
- **INMP441** — I2S MEMS microphone for acoustic detection
- **MQ-2** — Smoke and gas sensor
- **DHT22** — Temperature and humidity
- **MPU-6050** — Accelerometer for movement detection (Net 1)
- **ESP32** — Edge compute + WiFi transmission

## Why the simulator is sufficient for evaluation
The entire backend, AI triage pipeline, dashboard, and coordination
logic is fully functional. The simulator fires the identical JSON
payload that the ESP32 firmware would produce. All 10 sub-problems
are demonstrated end-to-end.
