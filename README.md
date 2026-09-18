# 💰 SnapSave — Full-Stack Expense Tracker

**Smart expense analyzer for PhonePe UPI users**

Know where your money actually goes. Upload your PhonePe statement PDF, get instant spending insights, set savings goals & category budgets — all backed by a secure Express + MongoDB backend.

> Built with React 18 + Vite + Tailwind CSS + Express.js + MongoDB Atlas

---

## ✨ Features

### Frontend (React SPA)
- 📊 **Dashboard** — Real-time totals (spent / received / savings rate), category pie chart, daily bar chart, computed waste alerts, personalized saving tips, financial health score
- 🔍 **Deep Insights** — Top 10 merchants table, category breakdown with percentages, repeated small-expense detection, time-of-day heatmap, dynamically computed potential savings
- 🎯 **Goals & Budgets** — Monthly savings goal (create / edit via API), per-category budget creation & deletion, real spending merged from transactions, dynamic achievements (First Upload, 100+ Transactions, Budget Master, Super Saver)
- 📁 **Upload** — Drag-and-drop PhonePe PDF upload, server-side parsing, auto-categorization into 8 categories, instant dashboard sync after upload
- 🔐 **Auth** — Login / Register with JWT, protected routes, 401 auto-logout with redirect, persistent auth state
- 📱 **Responsive** — Mobile bottom nav + desktop top nav
- 🎨 **Modern UI** — Gradient hero, glassmorphism cards, smooth page transitions, empty states, error banners, "Demo Data" badge

### Backend (Express REST API)
- 🔐 **JWT Authentication** — Secure register / login with bcryptjs password hashing, 7-day token expiry
- 📄 **PDF Upload & Parsing** — Server-side PhonePe statement parsing with `pdfjs-dist`, regex-based transaction extraction, auto-categorization (food, transport, shopping, entertainment, health, recharge, transfers, other)
- 💳 **Transaction CRUD** — Full create / read / update / delete API with date filtering, category filtering, type filtering, pagination & aggregation summaries
- 🎯 **Goals API** — Create `monthly_savings` & `category_budget` goals, track progress, query by month
- 🏥 **Health Check** — `GET /api/health` endpoint for monitoring
- ✅ **All 20 endpoints tested** — Comprehensive REST Client test file included (`backend/test-complete.rest`)

### Analytics Engine (`src/utils/analytics.js`)
- `calculateTotals()` — Total spent, received, net, savings rate (handles both DEBIT/debit casing)
- `getCategoryBreakdown()` — Category-wise amounts with percentages and colors
- `getDailySpending()` — Dynamic day count derived from actual transaction dates
- `getTopMerchants()` — Top 10 by total spend with count & average
- `getRepeatedExpenses()` — Merchants with 3+ small transactions
- `getTimePatterns()` — Real hour extraction with category-based heuristic fallback for midnight timestamps
- `getWasteAlerts()` — Flags merchants with 3+ visits and ≥₹150 total spend
- `generateSavingTips()` — Up to 4 personalized tips based on top category, frequent merchants, entertainment & transport spend, savings rate
- `calculateFinancialScore()` — 0–100 score with grade (A–F), emoji, and label

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework with hooks |
| Vite 5 | Dev server & bundler (port 5500) |
| Tailwind CSS 3 | Utility-first styling with custom theme |
| React Router v6 | Client-side routing with protected routes |
| Recharts | Charts (pie, bar, heatmap, budget progress) |
| pdfjs-dist | In-browser PDF parsing (guest mode) |
| Context API | Auth state management |

### Backend
| Technology | Purpose |
|---|---|
| Express.js | REST API server |
| MongoDB Atlas | Cloud database (free tier) |
| Mongoose | ODM with schema validation |
| bcryptjs | Password hashing (salt rounds: 10) |
| jsonwebtoken | JWT auth tokens (7d expiry) |
| multer | PDF file upload handling (10MB limit) |
| pdfjs-dist | Server-side PDF text extraction |
| cors | Cross-origin requests |
| nodemon | Dev auto-restart |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and npm
- **MongoDB Atlas** account (free tier works) or local MongoDB instance

### 1. Clone the repository

```bash
git clone https://github.com/your-username/snapsave.git
cd snapsave
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/snapsave?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
```

> Replace `<username>`, `<password>`, and `<cluster>` with your MongoDB Atlas credentials.
> URL-encode special characters in the password (e.g. `@` → `%40`).

```bash
npm run dev          # Development (with nodemon)
npm start            # Production
```

The backend runs on **http://localhost:5000**.

### 3. Setup Frontend

```bash
# From project root
npm install
```

Create a root `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

The frontend runs on **http://localhost:5500**.

### 4. Build for Production

```bash
npm run build        # Outputs to dist/
npm run preview      # Preview production build
```

---

## 📁 Project Structure

```
snapsave/
├── .env                        # Frontend env (VITE_API_URL)
├── public/                     # Static assets
├── src/                        # Frontend (React)
│   ├── App.jsx                 # Routes: /, /auth, /upload, /dashboard, /insights, /goals
│   ├── main.jsx                # Entry point with AuthProvider
│   ├── index.css               # Tailwind imports + custom styles
│   ├── components/
│   │   ├── charts/             # SpendingPieChart, DailyBarChart, TimeHeatmap, BudgetProgress
│   │   ├── Button.jsx          # Reusable button (primary/secondary/danger variants)
│   │   ├── Card.jsx            # Glass card wrapper
│   │   ├── StatCard.jsx        # Metric card with change indicator (↑/↓ arrows)
│   │   ├── Badge.jsx           # Status badges (success/warning/error)
│   │   ├── ProgressBar.jsx     # Percentage progress bar
│   │   ├── AlertItem.jsx       # Waste alert display
│   │   ├── Navbar.jsx          # Responsive nav (mobile bottom / desktop top)
│   │   ├── ProtectedRoute.jsx  # Auth guard — redirects to /auth if unauthenticated
│   │   └── UploadZone.jsx      # Drag-and-drop PDF upload area
│   ├── context/
│   │   └── AuthContext.jsx     # JWT auth provider (register, login, logout, auto-verify)
│   ├── data/
│   │   └── sampleData.js       # Demo transactions + category color map
│   ├── hooks/
│   │   └── useTransactions.js  # Smart data hook: API → localStorage → sample fallback
│   ├── pages/
│   │   ├── LandingPage.jsx     # Hero with CTA, trust badges, demo link
│   │   ├── AuthPage.jsx        # Login / Register toggle form
│   │   ├── UploadPage.jsx      # PDF upload with refetch() sync
│   │   ├── DashboardPage.jsx   # Overview: stats, pie chart, bar chart, alerts, tips
│   │   ├── InsightsPage.jsx    # Merchants, categories, repeated expenses, heatmap, savings
│   │   └── GoalsPage.jsx       # Savings goals, category budgets (CRUD), achievements
│   └── utils/
│       ├── api.js              # API client (env-based URL, 401 auto-logout, safe JSON)
│       ├── analytics.js        # Full analytics engine (12 functions, all null-safe)
│       ├── categorize.js       # Keyword-based auto-categorization (8 categories)
│       ├── pdfParser.js        # Client-side PhonePe PDF parser (regex-based)
│       └── storage.js          # LocalStorage helpers (get/set/clear transactions)
│
├── backend/                    # Backend (Express + MongoDB)
│   ├── .env                    # Environment variables (not committed)
│   ├── package.json
│   ├── test-complete.rest      # 50+ REST Client tests for all endpoints
│   └── src/
│       ├── server.js           # Express app: CORS, JSON parsing, route mounting, health check
│       ├── config/
│       │   └── database.js     # MongoDB Atlas connection with retry logic
│       ├── controllers/
│       │   ├── authController.js       # Register, Login, GetMe
│       │   ├── transactionController.js # CRUD + summary aggregation pipeline
│       │   ├── goalController.js       # CRUD + monthly progress tracking
│       │   └── uploadController.js     # Multer upload → parse PDF → bulk insert
│       ├── middleware/
│       │   └── auth.js         # JWT verification middleware (Bearer token)
│       ├── models/
│       │   ├── User.js         # { name, email, password (hashed) }
│       │   ├── Transaction.js  # { merchant, amount, category, date, type, user }
│       │   └── Goal.js         # { type, targetAmount, currentAmount, category, month, user }
│       ├── routes/
│       │   ├── auth.js         # POST /register, /login, GET /me
│       │   ├── transactions.js # GET/POST/PUT/DELETE /transactions, /transactions/summary
│       │   ├── goals.js        # GET/POST/PUT/DELETE /goals
│       │   └── upload.js       # POST /upload (multipart PDF)
│       └── utils/
│           ├── pdfParser.js    # Server-side PDF text extraction with pdfjs-dist
│           └── categorize.js   # Keyword → category mapping (same logic as frontend)
│
├── package.json                # Frontend dependencies & scripts
├── vite.config.js              # Vite config (port 5500, SPA fallback)
├── tailwind.config.js          # Custom theme: colors, fonts, spacing
├── postcss.config.js
├── vercel.json                 # SPA rewrite rules for Vercel deployment
└── index.html                  # HTML entry point
```

---

## 🔌 API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>` header.

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server status check |

### Authentication

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | Create account, returns `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | Login, returns `{ token, user }` |
| GET | `/api/auth/me` | — | Get current user profile (🔒) |

### Transactions (🔒 protected)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions` | List transactions (supports `?startDate`, `?endDate`, `?category`, `?type`, `?page`, `?limit`) |
| GET | `/api/transactions/summary` | Aggregated totals & category breakdown |
| POST | `/api/transactions` | Create one or bulk: `{ transactions: [...] }` |
| GET | `/api/transactions/:id` | Get single transaction |
| PUT | `/api/transactions/:id` | Update transaction fields |
| DELETE | `/api/transactions/:id` | Delete single transaction |
| DELETE | `/api/transactions/all` | Delete all user transactions |

### Goals (🔒 protected)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/goals` | List goals (supports `?month=YYYY-MM`) |
| POST | `/api/goals` | Create goal: `{ type, targetAmount, month, category? }` |
| GET | `/api/goals/:id` | Get single goal with progress |
| PUT | `/api/goals/:id` | Update goal fields |
| DELETE | `/api/goals/:id` | Delete goal |

### Upload (🔒 protected)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/upload` | `multipart/form-data` with `pdf` field | Upload PhonePe PDF → auto-parse → store transactions |

---

## 📱 How to Upload a PhonePe Statement

1. Open the PhonePe app → tap your profile icon (top right)
2. Go to **Transaction History** → select a date range (up to 6 months)
3. Tap **Download Statement** → choose **PDF** format → save to device
4. Log in to SnapSave → go to **Upload** page → drag-and-drop or browse for the PDF
5. Transactions are automatically parsed, categorized, and stored

> Don't have a PDF? Click **"Try with sample data"** on the dashboard to explore with demo transactions.

---

## 🧩 How It Works

### Data Flow
```
PhonePe PDF → Upload → Server parses (pdfjs-dist + regex) → Auto-categorize
→ Store in MongoDB → Frontend fetches via API → Analytics engine computes
→ Dashboard / Insights / Goals display real data
```

### Transaction Categories
| Category | Keywords (examples) |
|---|---|
| Food | swiggy, zomato, restaurant, chai, cafe, pizza |
| Transport | uber, ola, rapido, metro, petrol, fuel |
| Shopping | amazon, flipkart, myntra, mall |
| Entertainment | netflix, hotstar, spotify, pvr, movie |
| Health | apollo, pharmacy, hospital, medplus |
| Recharge | jio, airtel, vi, broadband, recharge |
| Transfers | sent to, received from, paid to, neft, imps |
| Other | everything else |

### Authentication Flow
1. **Register/Login** → Server returns JWT (7-day expiry)
2. Token stored in `localStorage` → sent as `Bearer` header on every API call
3. **401 response** → auto-clears token, redirects to `/auth`
4. **Page refresh** → `AuthContext` verifies token via `GET /api/auth/me`

### Analytics Pipeline
```
Raw transactions → useTransactions hook (fetches + caches)
  → useMemo → analytics.js functions:
    ├── calculateTotals()      → spent, received, net, savings rate
    ├── getCategoryBreakdown() → pie chart data with colors
    ├── getDailySpending()     → bar chart (dynamic days in month)
    ├── getTopMerchants()      → top 10 table
    ├── getRepeatedExpenses()  → wasteful patterns
    ├── getTimePatterns()      → heatmap data
    ├── getWasteAlerts()       → flagged merchants
    ├── generateSavingTips()   → personalized tips
    └── calculateFinancialScore() → 0-100 score + grade
```

---

## 🚢 Deployment

### Frontend (Vercel)

The project includes `vercel.json` for SPA rewrites:

```bash
npx vercel
```

Set the environment variable in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.com/api
```

### Backend (Render / Railway)

1. Deploy the `backend/` folder
2. Set environment variables: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `PORT`
3. Start command: `node src/server.js`

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/snapsave` |
| `JWT_SECRET` | Secret for signing JWTs | `my_super_secret_key` |
| `JWT_EXPIRE` | Token expiry duration | `7d` |

### Frontend (root `.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## 📦 Scripts

### Frontend (root `package.json`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server (port 5500) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend (`backend/package.json`)

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start` | Start production server |

---

## 🧪 API Testing

A comprehensive REST Client test file is included at `backend/test-complete.rest` with **50+ requests** covering:
- Health check
- Auth (register, login, profile, error cases)
- Transactions (CRUD, bulk create, filtering, summary, pagination)
- Goals (CRUD, monthly queries)
- Upload (PDF upload)

Open the file in VS Code with the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) and click "Send Request" on any block.

---

## 📊 Project Status

| Area | Status | Notes |
|---|---|---|
| Backend API | ✅ 100% | All 20 endpoints working, tested |
| Frontend Pages | ✅ 100% | All 6 pages fully integrated with backend |
| Auth Flow | ✅ 100% | JWT login/register, protected routes, 401 auto-logout |
| PDF Parsing | ✅ 90% | PhonePe statements supported, edge cases may need tuning |
| Analytics | ✅ 100% | 12 functions, all null-safe, no hardcoded data |
| Goals & Budgets | ✅ 100% | Full CRUD, real spending from transactions |
| Testing | 🔲 10% | REST Client tests only, no unit/integration tests yet |
| Deployment | 🔲 0% | Vercel config ready, not yet deployed |

---

## 📄 License

MIT

---

<p align="center">
  Built with ❤️ for Indian millennials & Gen-Z<br>
  © 2026 SnapSave
</p>
