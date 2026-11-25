# Technical Documentation – LandConnect

## Technologies and Frameworks

- **Backend**: Python FastAPI – lightweight, fast, easy to explain
- **Database**: SQLite – file-based, zero setup, free
- **Authentication**: PyJWT – JSON Web Tokens for secure login sessions
- **Frontend**: React Native with Expo – cross-platform mobile, runs via Expo Go app
- **Navigation**: React Navigation – stack-based screen navigation
- **HTTP Client**: Axios – REST API calls from mobile app
- **Calling**: WebRTC (browser/native API) + WebSocket signaling – peer-to-peer audio/video
- **Maps**: OpenStreetMap free tiles (planned integration point)

## Architecture

The application follows a client-server model:

1. **Backend (FastAPI)** runs on port 8000 and exposes REST APIs plus a WebSocket endpoint.
2. **SQLite database** stores users, listings, and messages in a single file (`landconnect.db`).
3. **Frontend (React Native/Expo)** connects to the backend via Axios for REST and WebSocket for call signaling.
4. **WebRTC** establishes direct peer-to-peer media streams between callers and receivers.

### Data Flow

- User registers/logs in → JWT token issued → stored locally on device
- Token sent with every API request → backend validates and returns user data
- Listings and messages stored in SQLite, returned as JSON
- Call signaling: caller sends offer via WebSocket → receiver gets incoming call → answer exchanged → WebRTC peer connection established → media flows directly

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

1. **WebRTC on mobile**: Requires camera/microphone permissions. Handled with try/catch and permission alerts.
2. **Signaling server**: WebSocket connection relays SDP offers/answers and ICE candidates between peers.
3. **Local network testing**: Backend accessed via `10.0.2.2` (Android emulator localhost alias) or machine IP for physical devices.
4. **Role enforcement**: Backend checks user role on listing create/edit/delete endpoints.

## File Summary

- `backend/main.py` – all API routes, WebSocket signaling, database initialization
- `frontend/App.js` – navigation stack
- `frontend/src/screens/` – Login, Register, Home, ListingDetail, CreateListing, Messages, Call, Profile
- `frontend/src/services/api.js` – Axios API client with JWT interceptor