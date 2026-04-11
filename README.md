# CrisisSync — Rapid Crisis Response for Hospitality

> Google Solutions Challenge 2026

## Problem
Hospitality venues face fragmented, delayed crisis response. Guests panic,
staff use disconnected channels, and first responders arrive without clear
information.

## Solution
CrisisSync is a real-time crisis coordination platform combining:
- Autonomous IoT sensor detection (no human needed to report)
- Gemini AI triage (converts chaos into structured, prioritized alerts)
- Live command dashboard (full situational awareness for managers)
- Guest SOS app (one-tap reporting from any phone via QR)
- Incident analytics (learning from every event)

## Problems Solved
| # | Problem | How CrisisSync solves it |
|---|---------|--------------------------|
| 1 | Delayed detection | IoT sensors auto-detect and report instantly |
| 2 | Fragmented communication | Single Firebase channel for all parties |
| 3 | No clear information | Structured JSON + Gemini AI normalization |
| 4 | No prioritization | AI severity scoring 0–5 |
| 5 | Location confusion | Cloud-resolved location, BLE fallback |
| 6 | Lack of coordination | Dedup engine merges nearby alerts |
| 7 | Slow decisions | Auto SOP checklist per crisis type |
| 8 | No real-time visibility | Live dashboard with map |
| 9 | Poor guest–staff connection | Guest PWA + status updates |
| 10 | No data logging | Full incident timeline + analytics |

## Architecture
See `/docs/architecture.md`

## Setup
See `/docs/setup.md`

## Tech Stack
- Firebase (Firestore, Realtime DB, Auth, FCM, Hosting)
- Gemini API (AI triage)
- React (webapp + PWA)
- Python (IoT simulator)
- Google Maps SDK

## Team
- Yashwanth V
- Yashas S
- Vikas Yadav