# EquipmentHub - Equipment Rental Marketplace

> A production-oriented full-stack Equipment Rental Marketplace with a Subscription System built for the Indian construction and heavy machinery industry (JCBs, excavators, cranes, silent generators, tractors, and concrete mixers).

---

## 🌟 Core Business Highlights

1. **Dual-Role Unified Account**: Any registered user can both **register & list** equipment for rent and **rent equipment** owned by other users using the same account. No separate owner and customer accounts.
2. **Hardened Subscription Gate**: Machinery owners must hold an active verified subscription plan before listing equipment. Listing limits (Basic: 2, Pro: 10, Business: 50) are strictly verified on the backend.
3. **True Geospatial Radar**: Equipment coordinates are stored as GeoJSON points with MongoDB `2dsphere` indexes, enabling accurate straight-line distance calculations (e.g., `2.4 km away`).
4. **State Machine Booking Flow**: Concurrency-safe reservations with automated price calculation, owner approval, and Razorpay test-mode payment verification.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM v6, Axios, Lucide React, Zod
- **Backend**: Node.js, Express.js (REST API architecture)
- **Database**: MongoDB with Mongoose ODM & `2dsphere` geospatial indexing
- **Security**: Secure HTTP-Only JWT cookies, bcrypt password hashing, Helmet, CORS, and Express rate limiting
- **Payments & Cloud**: Razorpay test mode & Cloudinary image storage

---

## 📁 Project Structure

```text
equipment-hub/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── api/                # Axios instance with credentials & error interceptor
│   │   ├── components/         # Reusable UI (Navbar, Footer, ProtectedRoute, etc.)
│   │   ├── context/            # AuthContext (user, activeSubscription, login, register, logout)
│   │   ├── pages/              # LandingPage, LoginPage, RegisterPage, DashboardPage, Plans, Browse
│   │   ├── App.jsx             # React Router routing setup
│   │   ├── main.jsx            # React root DOM bootstrap
│   │   └── index.css           # Tailwind base styles
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env.example
│
├── server/                     # Node.js + Express REST API
│   ├── scripts/
│   │   ├── seedAdmin.js        # Seed initial administrator
│   │   └── seedCategories.js   # Seed machinery categories & subscription tiers
│   ├── src/
│   │   ├── config/             # MongoDB connection (db.js)
│   │   ├── controllers/        # authController, categoryController
│   │   ├── middleware/         # authMiddleware, errorHandler
│   │   ├── models/             # User, EquipmentCategory, SubscriptionPlan, Subscription
│   │   ├── routes/             # authRoutes, categoryRoutes
│   │   ├── services/           # authService (business logic separation)
│   │   ├── utils/              # tokenUtils (JWT & HTTP-Only cookies)
│   │   ├── validators/         # authValidators (Zod validation schemas)
│   │   ├── app.js              # Express app, Helmet, CORS, Rate limiting
│   │   └── server.js           # Server bootstrap
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── package.json                # Root monorepo workspace scripts
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

### 2. Installation
Install dependencies for both backend and frontend:

```bash
# In the project root or in each folder:
cd server
npm install

cd ../client
npm install
```

### 3. Environment Variables
Both `server/` and `client/` have `.env` and `.env.example` pre-configured.

**Server (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/equipment_hub
JWT_SECRET=super_secret_jwt_key_change_in_production_equipment_hub_2026
JWT_EXPIRES_IN=7d
COOKIE_SECRET=super_secret_cookie_key_equipment_hub
CLIENT_URL=http://localhost:5173
```

### 4. Database Seeding
Seed initial equipment categories and default subscription plans:

```bash
cd server
npm run seed:categories
```

Seed the platform administrator account:
```bash
npm run seed:admin
```
*(Default seed admin: `admin@equipmenthub.com` / `Admin@123456`)*

### 5. Running the Application
Start the backend server:
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

Start the frontend development server:
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

Or from the root directory:
```bash
npm run dev
```

---

## 📡 API Endpoints (Phase 1)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Health check & uptime status |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Login & set HTTP-only cookie |
| `POST` | `/api/auth/logout` | Public | Clear session cookie |
| `GET` | `/api/auth/me` | Protected | Current user session & active plan |
| `PUT` | `/api/auth/profile` | Protected | Update profile & contact information |
| `PUT` | `/api/auth/change-password` | Protected | Change account password |
| `GET` | `/api/categories` | Public | List active machinery categories |
| `GET` | `/api/subscriptions/plans` | Public | List active subscription tiers & limits |
| `GET` | `/api/subscriptions/my` | Protected | Current user subscription & listing quota |
| `GET` | `/api/subscriptions/check-quota` | Protected | Check remaining equipment listing slots |
| `POST` | `/api/subscriptions/create-order` | Protected | Create Razorpay order for subscription |
| `POST` | `/api/subscriptions/verify` | Protected | Verify HMAC-SHA256 signature & activate |
| `POST` | `/api/subscriptions/cancel` | Protected | Cancel auto-renewal for active plan |
| `POST` | `/api/equipment` | Protected (Quota Gated) | Register machinery (GeoJSON Point coordinates) |
| `GET` | `/api/equipment/my` | Protected | List logged-in owner's fleet |
| `GET` | `/api/equipment/:id` | Public | Get machinery specifications & rate details |
| `PUT` | `/api/equipment/:id` | Protected (Owner only) | Update machinery rates and details |
| `PATCH` | `/api/equipment/:id/status` | Protected (Owner only) | Toggle pause / resume listing status |
| `DELETE` | `/api/equipment/:id` | Protected (Owner only) | Remove equipment listing |
| `POST` | `/api/bookings` | Protected | Submit rental request with overlap check |
| `GET` | `/api/bookings/my-rentals` | Protected | List customer rental bookings & invoices |
| `GET` | `/api/bookings/requests-received` | Protected | List incoming requests for owner fleet |
| `GET` | `/api/bookings/:id` | Protected | Get booking invoice details |
| `POST` | `/api/bookings/:id/respond` | Protected (Owner only) | Accept or decline rental request |
| `POST` | `/api/bookings/:id/create-payment` | Protected (Customer only) | Create Razorpay order for rental |
| `POST` | `/api/bookings/:id/verify-payment` | Protected (Customer only) | Verify payment signature & confirm booking |
| `PATCH` | `/api/bookings/:id/progress` | Protected (Owner only) | Record machine handover & return |
| `POST` | `/api/bookings/:id/cancel` | Protected | Cancel rental booking |
| `GET` | `/api/admin/stats` | Admin Only | Platform statistics, fleet & escrow totals |
| `GET` | `/api/admin/users` | Admin Only | User directory with search and status filters |
| `PATCH` | `/api/admin/users/:id/status` | Admin Only | Suspend or reactivate user accounts |
| `GET` | `/api/admin/equipment` | Admin Only | Machinery listings approval dashboard |
| `PATCH` | `/api/admin/equipment/:id/review` | Admin Only | Approve or reject machinery listings |
| `GET` | `/api/admin/subscriptions` | Admin Only | Monitor active member tiers and quotas |
| `GET` | `/api/admin/bookings` | Admin Only | View all platform rental transactions |
| `GET` | `/api/admin/audit-logs` | Admin Only | Immutable audit history of administrative operations |

---

## 🗺️ Phased Roadmap Progress

- [x] **Phase 1: Foundation & Authentication** (Express, MongoDB, JWT Cookie, Dual-Role Dashboard, React + Vite)
- [x] **Phase 2: Subscription System & Razorpay Gateway** (Order creation, HMAC SHA256 signature verification, quota enforcement)
- [x] **Phase 3: Equipment Registration & Media Upload** (Multi-step form, GPS coordinates, 2dsphere index, owner fleet management)
- [x] **Phase 4: Marketplace Discovery & 2dsphere Proximity** (Geospatial search, Leaflet map view, filters, machinery detail page)
- [x] **Phase 5: Booking State Machine & Invoices** (Availability verification, concurrency locking, Razorpay escrow, printable invoice)
- [x] **Phase 6: Admin Dashboard & Hardening** (Fleet approvals, user moderation, audit logs, RBAC protection)

