# RateStore — Store Rating Platform

RateStore is a full-stack web application for local business discovery, community ratings, and store management. It features role-based access control for System Administrators, Normal Users, and Store Owners, supported by a warm off-white editorial UI design system.

---

## Technology Stack

- **Frontend**: React.js (Vite, JavaScript, React Router v6, Axios REST client)
- **Backend**: Node.js, Express.js (RESTful API architecture)
- **Database**: MySQL 8.x (`mysql2/promise` connection pool, foreign key constraints, `AVG(rating)` SQL aggregation)
- **Authentication**: JSON Web Tokens (JWT, 24h expiration)
- **Password Security**: `bcryptjs` salted hashing (10 rounds)

---

## Authentication & Role-Based Login

RateStore uses a single, centralized login page (`/login`) for all account types. There are intentionally no separate `/admin-login` or `/owner-login` pages.

### Public Signup

Anyone can register an account at:
```text
/signup
```
Public registration always enforces:
```text
role = USER
```
This is an intentional security design choice: public users cannot select or claim `ADMIN` or `STORE_OWNER` roles during registration.

### Admin-Created Accounts

Privileged accounts (`ADMIN` and `STORE_OWNER`) as well as additional `USER` accounts can only be created by an authenticated System Administrator through the Admin interface:
```text
Admin Dashboard → Manage Users → Add New User → Select Role (USER | STORE_OWNER | ADMIN)
```
The assigned role is stored in the MySQL `users` table.

### Single Login Architecture Flow

All three roles log in through the same `/login` interface without selecting their role:

```text
React Login Page (/login)
       ↓
POST /api/auth/login
       ↓
Express Auth Controller
       ↓
Auth Service (bcrypt password verification)
       ↓
MySQL users table (lookup email & role)
       ↓
Generate JWT { userId, role }
       ↓
React receives authenticated user profile
       ↓
Role-Based Navigation & Page Redirect
```

### Role-Based Destinations

Upon authentication, users are directed to their role's target view:

| Role | Default Route | Available Features |
| :--- | :--- | :--- |
| **USER** | `/stores` | Browse store directory, search by name/address, rate stores (1–5 stars), update profile password. |
| **STORE_OWNER** | `/owner/dashboard` | View assigned retail stores, monitor average customer rating, inspect customer feedback log, update password. |
| **ADMIN** | `/admin/dashboard` | Access system metrics (users/stores/ratings count), manage users (`/admin/users`), manage stores (`/admin/stores`), create accounts. |

---

## Security & Architecture Rationale

Using one login endpoint and interface avoids duplicating authentication logic across separate portals. Authorization is enforced after authentication using the verified `role` stored in MySQL and signed inside the JWT payload.

Role selection is intentionally **not** exposed on the public login page to prevent malicious users from attempting to claim or request elevated permissions.

---

## Demo Accounts

The repository includes a curated set of seeded demonstration accounts for manual evaluation:

| Role | Name | Email | Password | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Rajesh Sharma System Administrator | `admin@storerating.com` | `AdminPass123!` | System Administration & User/Store Creation |
| **STORE_OWNER** | Vikram Mehta Retail Store Owner | `owner@storerating.com` | `OwnerPass123!` | Managing Apex Electronics Store & Supermarket |
| **STORE_OWNER** | Pooja Joshi Retail Store Owner | `owner2@storerating.com` | `OwnerPass123!` | Managing Green Leaf Cafe & Appliance Hub |
| **USER** | Aarav Patil Registered Store Consumer | `user@storerating.com` | `UserPass123!` | Store browsing, search, & star rating submissions |
| **USER** | Sneha Kulkarni Senior Verified Consumer | `user2@storerating.com` | `UserPass123!` | Community rating submissions |
| **USER** | Rohan Deshmukh Verified Store Consumer | `user3@storerating.com` | `UserPass123!` | Community rating submissions |

---

## Demo Dataset Rationale

The MySQL database intentionally maintains a small, clean demonstration dataset so reviewers can quickly evaluate all features without sifting through hundreds of generated test records:

- **6 Users total**: 1 ADMIN, 2 STORE_OWNERs, 3 USERs.
- **5 Stores total**:
  - *Apex Electronics Store* (Owner: Vikram Mehta) — 3 ratings (Average: 4.33/5)
  - *Shree Ganesh Supermarket Pune* (Owner: Vikram Mehta) — 1 rating (5/5)
  - *Green Leaf Organic Food Cafe* (Owner: Pooja Joshi) — 1 rating (3/5)
  - *Bharat Electronics Appliance Hub* (Owner: Pooja Joshi) — 0 ratings (Unrated)
  - *City Corner Departmental Store* (Owner: Vikram Mehta) — 1 rating (4/5)
- **6 Ratings total**: Covers multiple ratings, single rating, unrated store, and varied rating values (3 to 5 stars).

*Note: The MySQL schema and Node.js backend support arbitrary scale; the concise dataset is curated for convenient reviewer testing.*

---

## Setup & Running

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment
Create `server/.env` with your MySQL connection credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=store_rating_platform
DB_PORT=3306
JWT_SECRET=super_secret_jwt_key_12345!
```

### 3. Run Applications
- Run both Backend & Frontend:
  ```bash
  npm run dev
  ```
- Backend API (Port 5000):
  ```bash
  cd server && npm start
  ```
- Frontend Web App (Port 3000):
  ```bash
  cd client && npm run dev
  ```

---

## Verification & Automated Tests

To execute the complete regression test suite (219 tests):
```bash
node server/database/testDb.js
node server/database/testAuth.js
node server/database/testAuthz.js
node server/database/testAdmin.js
node server/database/testUser.js
node server/database/testOwner.js
node server/database/testSearchSort.js
node server/database/testValidation.js
```
Expected output: **219 / 219 PASSED**.

To test the frontend production build:
```bash
npm run build --prefix client
```
Expected output: **SUCCESS (0 errors)**.
