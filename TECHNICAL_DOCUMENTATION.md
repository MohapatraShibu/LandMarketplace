# Technical Documentation – LandConnect

## Technologies and Frameworks

- **Backend**: Python FastAPI – lightweight, fast, easy to explain
- **Database**: SQLite – file-based, zero setup, free
- **Authentication**: PyJWT – JSON Web Tokens for secure login sessions
- **Frontend**: React Native with Expo – cross-platform mobile, runs via Expo Go app
- **Navigation**: React Navigation – stack-based screen navigation
- **HTTP Client**: Axios – REST API calls from mobile app
- **Calling**: Simulated audio/video call flow (initiate, receive, accept/reject, end, mute, video toggle) — no WebRTC or WebSocket required, works in browser demo
- **Maps**: OpenStreetMap free tiles (static map display)

## Architecture

The application follows a client-server model:

1. **Backend (FastAPI)** runs on port 8000 and exposes REST APIs.
2. **SQLite database** stores users, listings, and messages in a single file (`landconnect.db`).
3. **Frontend (React Native/Expo)** connects to the backend via Axios for REST API calls.
4. **Calling** is a simulated flow handled entirely on the frontend — calling → incoming (2 second delay) → active → end, with mute and video toggle buttons.

### Data Flow

- User registers/logs in → JWT token issued → stored locally on device
- Token sent with every API request → backend validates and returns user data
- Listings and messages stored in SQLite, returned as JSON
- Calling: user taps "Video Call" → screen shows "Calling..." → after 2 seconds shows "Incoming Call" with Accept/Reject → tap Accept shows active call screen with Mute/Stop Video/End Call buttons → tap End Call returns to previous screen

## Implementation Decisions

- **SQLite instead of PostgreSQL**: zero installation, works immediately, free
- **FastAPI instead of Node.js**: simple Python code, automatic API docs, easy to explain
- **Expo instead of bare React Native**: no Android Studio/Xcode setup needed, runs via Expo Go app
- **WebRTC + WebSocket**: free, no third-party calling API keys required, peer-to-peer media
- **JavaScript instead of TypeScript**: simpler codebase, easier to understand and explain

## Role-Based Access Control

- **Buyer**: browse listings, message users, start calls
- **Seller**: browse listings, create/edit/delete own listings, message users, start calls
- **Broker**: browse listings, create/edit/delete any listing, message users, start calls

## Major Technical Challenges

1. **Simulated calling on mobile**: No camera/microphone permissions needed since calling is simulated. Handled with state transitions and button alerts.
2. **Local network testing**: Backend accessed via `localhost:8000` for web browser demo, or machine IP for physical devices on same network.
3. **Role enforcement**: Backend checks user role on listing create/edit/delete endpoints.
4. **CORS configuration**: Backend allows all origins so frontend can connect from Netlify or localhost.

## File Summary

- `backend/main.py` – all API routes, database initialization
- `frontend/App.js` – navigation stack
- `frontend/src/screens/` – Login, Register, Home, ListingDetail, CreateListing, Messages, Call, Profile, Map
- `frontend/src/services/api.js` – Axios API client with JWT interceptor