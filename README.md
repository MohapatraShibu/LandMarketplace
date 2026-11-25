# LandConnect – Land Marketplace Mobile Application

A functional prototype of a real estate land marketplace mobile application with a WhatsApp-inspired interface. Supports buyers, sellers, and brokers with land listings, messaging, and in-app audio/video calling.

## Live Demo

- **Backend (Render):** https://landmarketplace.onrender.com/
- **Frontend (Netlify):** https://helpful-entremet-4e64ed.netlify.app

## Features

- User registration and login with role management (Buyer, Seller, Broker)
- Browse community land listings with images, price, location
- Create, edit, and delete property listings (Seller/Broker)
- In-app messaging between users
- In-app audio and video calling with accept/reject/end
- Role-based access control

## Technology Stack

- Backend: Python FastAPI, SQLite, PyJWT
- Frontend: React Native with Expo, JavaScript
- Calling: Simulated audio/video call flow (initiate, receive, accept/reject, end, mute, video toggle)
- Maps: OpenStreetMap static map integration

## Project Structure

```
LandMarketplace/
├── .env                          # Environment variables (local, gitignored)
├── .env.example                  # Environment template (committed to Git)
├── .gitignore                    # Git ignore rules
├── README.md                     # Setup and deployment instructions
├── script.md                     # Demonstration video script
├── TECHNICAL_DOCUMENTATION.md    # Technical architecture and decisions
├── AI_TOOLS_USAGE.md             # AI tools collaboration summary
├── backend/
│   ├── main.py                   # FastAPI application (auth, listings, messages, WebSocket)
│   ├── requirements.txt          # Python dependencies
│   ├── Procfile                  # Render deployment config
│   ├── runtime.txt               # Python version for Render
│   └── landconnect.db            # SQLite database (auto-created)
├── frontend/
│   ├── App.js                    # Navigation entry point
│   ├── package.json              # Node dependencies and scripts
│   ├── app.json                  # Expo web configuration
│   ├── netlify.toml              # Netlify deployment config
│   ├── .env                      # Frontend environment variables (local, gitignored)
│   ├── .env.example              # Frontend environment template
│   ├── web-build/                # Built web files (for Netlify deployment)
│   └── src/
│       ├── screens/
│       │   ├── LoginScreen.js
│       │   ├── RegisterScreen.js
│       │   ├── HomeScreen.js
│       │   ├── ListingDetailScreen.js
│       │   ├── CreateListingScreen.js
│       │   ├── MessagesScreen.js
│       │   ├── CallScreen.js
│       │   ├── ProfileScreen.js
│       │   └── MapScreen.js
│       └── services/
│           └── api.js            # Axios API client
```

## Setup and Execution Commands

### Backend

1. Create virtual environment:
```
cd D:\company_task\LandMarketplace\backend
python -m venv venv
venv\Scripts\Activate.ps1
```

2. Copy environment variables (from project root):
```
cd D:\company_task\LandMarketplace
copy .env.example .env
```
3. Install dependencies:
```
pip install -r requirements.txt
```

4. Run the server:
```
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

1. Install dependencies:
```
cd D:\company_task\LandMarketplace\frontend
npm install
```

2. Start Expo:
```
npx expo start
```
3. Press **`w`** in the terminal to open the app in your web browser at `http://localhost:19006`.

4. Open on device:
- Install Expo Go app on your phone
- Scan the QR code from the terminal

Or run on Android emulator:
```
npx expo start --android
```

## Git Commands

```
git init
git add .
git commit -m "Initial commit: LandConnect prototype"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Deployment to Free Hosting Platforms

### Backend (Render / Railway / Fly.io)

1. Push your code to GitHub.
2. Create a new Web Service on Render/Railway and connect your GitHub repo.
3. Set the build command: `pip install -r backend/requirements.txt`
4. Set the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Set environment variables in the platform dashboard:
   - `SECRET_KEY` = any random string
   - `ALGORITHM` = HS256
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = 10080
   - `PORT` = 10000 (Render default) or leave default
6. Note your backend URL (e.g. `https://landconnect.onrender.com`).

### Frontend (Expo / Web)

1. Update `frontend/.env` with your deployed backend URL:
   ```
   EXPO_PUBLIC_API_BASE=https://your-backend-url.onrender.com
   ```
2. Run `npx expo start` and scan with Expo Go, or build for web:
   ```
   npx expo export -p web
   ```

### Important Notes for Deployment

- **SQLite**: The database file `landconnect.db` is created automatically on first run. On some free hosts, the filesystem resets on redeploy, so data may not persist. For the demo, this is acceptable.
- **Calling**: The calling feature is a simulated flow (initiate, receive, accept/reject, end, mute, video toggle) that works in the browser demo. For production WebRTC calling, WebSocket signaling would need to be implemented.
- **CORS**: Backend allows all origins (`*`) so your frontend can connect from any URL.

## API Endpoints

- POST /auth/register - Register user
- POST /auth/login - Login user
- GET /auth/me - Get current user
- GET /listings - List all land listings
- POST /listings - Create listing (Seller/Broker)
- PUT /listings/{id} - Update listing
- DELETE /listings/{id} - Delete listing
- GET /messages/{user_id} - Get messages with user
- POST /messages - Send message
- GET /users - List all users
- WS /ws/{user_id} - WebSocket signaling for calls