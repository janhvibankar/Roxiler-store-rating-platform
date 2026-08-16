# Store Rating Platform

A full-stack web application for discovering and rating stores with role-based features for System Administrators, Normal Users, and Store Owners.

```text
Current Phase: Phase 1 — Project Architecture
```

## Technology Stack

- **Frontend**: React.js (Vite, JavaScript, Axios, React Router DOM)
- **Backend**: Express.js (Node.js, JavaScript, REST API architecture)
- **Database**: PostgreSQL (Driver: `pg`, connection pool configured for future schema implementation)
- **Architecture**: Layered Backend (Routes → Controllers → Services → Repositories → PostgreSQL)

## Folder Structure

```text
store-rating-platform/
│
├── client/
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, Sidebar, Button, Table, etc.)
│   │   ├── pages/            # Page view placeholders (Login, Signup, Dashboards, Store List, etc.)
│   │   ├── layouts/          # Application layouts (MainLayout)
│   │   ├── services/         # Centralized API service layer (api, auth, user, store, rating)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   ├── constants/        # System constants & roles (ADMIN, USER, STORE_OWNER)
│   │   ├── App.jsx           # Root application router setup
│   │   └── main.jsx          # Entry point
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/           # Database & env config
│   │   ├── controllers/      # Route request/response controllers
│   │   ├── middleware/       # Express error handling & auth middleware placeholders
│   │   ├── routes/           # REST API routes (/api/auth, /api/users, /api/stores, etc.)
│   │   ├── services/         # Business logic layer
│   │   ├── repositories/     # Data access layer for PostgreSQL
│   │   ├── utils/            # Helper utils & response formatters
│   │   ├── constants/        # System role definitions
│   │   └── app.js            # Express application setup
│   │
│   ├── server.js             # HTTP server listener entry point
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── README.md
└── package.json
```

## User Roles Defined

- `ADMIN` (System Administrator)
- `USER` (Normal User)
- `STORE_OWNER` (Store Owner)

## Setup & Running

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Variables
Copy `server/.env.example` to `server/.env` and update configuration values as needed:
```bash
cp server/.env.example server/.env
```

### 3. Run Applications
- Run both Client and Server concurrently:
  ```bash
  npm run dev
  ```
- Run Client independently:
  ```bash
  npm run client
  ```
- Run Server independently:
  ```bash
  npm run server
  ```

### Health Check Endpoint
- GET `http://localhost:5000/api/health` returns `{ "status": "success", "message": "Backend service is running smoothly." }`
