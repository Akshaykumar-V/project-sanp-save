# 📊 SnapSave — Project Documentation

**Version:** 1.0.0  
**Last Updated:** May 15, 2026  
**Status:** Development Complete, Pre-Deployment  
**Author:** Akshay Kumar

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Directory Structure](#directory-structure)
5. [Features](#features)
6. [Getting Started](#getting-started)
7. [API Documentation](#api-documentation)
8. [Database Schema](#database-schema)
9. [Development Workflow](#development-workflow)
10. [Deployment Guide](#deployment-guide)
11. [Configuration](#configuration)
12. [Contributing Guidelines](#contributing-guidelines)

---

## 1. Project Overview

### What is SnapSave?

**SnapSave** is an AI-powered personal expense analyzer designed specifically for Indian PhonePe UPI users. The platform enables users to upload their PhonePe PDF transaction statements and receive intelligent financial insights through a modern dashboard.

### Core Value Proposition

Transform boring bank statements into actionable financial insights in under 10 seconds.

- **Upload** → PhonePe PDF statements
- **Parse** → Automated transaction extraction & categorization
- **Analyze** → Smart spending analytics & patterns
- **Advise** → AI-generated financial recommendations (powered by Groq's Llama 3.3 70B)

### Target Audience

Indian millennials & Gen-Z who use PhonePe for daily UPI payments and want better visibility into their spending habits.

### Problem Solved

- ❌ Raw PDF statements with no analytics
- ❌ Zero visibility into spending patterns
- ❌ Manual data entry is painful for 200+ monthly transactions
- ❌ Don't know where money "leaks" (repeated small purchases, category overspending)

✅ SnapSave automates everything with intelligent categorization and AI insights.

---

## 2. Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vite + React)                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Dashboard │ Insights │ Goals │ Upload │ Auth         │  │
│  │  (Charts, Stats, Waste Alerts, Health Score, Tips)    │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                   REST API Calls (JWT)                        │
│                          │                                    │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│              Backend (Express.js REST API)                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Authentication │ Upload │ Transactions │ Goals │ AI   │  │
│  │  (JWT + bcrypt) │ Parser │ CRUD Ops     │ API  │ Tips │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                    │
│                    Database Queries                           │
│                          │                                    │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│           Database (MongoDB Atlas Cloud)                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Users │ Transactions │ Goals │ Upload Records        │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Uploads PDF** → Frontend validates file (PDF, <5MB)
2. **Server Receives File** → Backend processes with pdfjs-dist
3. **Text Extraction** → Regex patterns extract transactions
4. **Auto-Categorization** → Intelligent classification into 8 categories
5. **Database Storage** → Transactions saved to MongoDB
6. **Analytics Computation** → Dashboard metrics calculated
7. **AI Generation** → Groq API generates personalized tips
8. **Frontend Display** → Charts, stats, and recommendations rendered

---

## 3. Tech Stack

### Frontend Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.2.0 | UI framework with hooks & context API |
| **Vite** | 5.1.0 | Build tool & dev server (fast HMR) |
| **Tailwind CSS** | 3.4.1 | Utility-first styling |
| **React Router** | 6.22.0 | Client-side routing & protected routes |
| **Recharts** | 2.10.0 | Interactive charts (pie, bar, heatmap) |
| **pdfjs-dist** | 4.2.67 | Client-side PDF parsing (demo mode) |

### Backend Stack

| Technology | Version | Purpose |
|---|---|---|
| **Express.js** | 5.2.1 | REST API server |
| **MongoDB Atlas** | (Cloud) | NoSQL database (free tier) |
| **Mongoose** | 9.2.2 | ODM with schema validation |
| **bcryptjs** | 3.0.3 | Password hashing (10 salt rounds) |
| **jsonwebtoken** | 9.0.3 | JWT authentication (7-day expiry) |
| **multer** | 2.0.2 | File upload middleware (10MB limit) |
| **pdfjs-dist** | 2.16.105 | Server-side PDF text extraction |
| **groq-sdk** | 0.37.0 | AI tips generation (Llama 3.3 70B) |
| **cors** | 2.8.6 | Cross-origin request handling |
| **dotenv** | 17.3.1 | Environment variable management |

### Deployment Stack

| Component | Platform | Purpose |
|---|---|---|
| **Frontend** | Vercel | SPA hosting (configured) |
| **Backend** | Render / Railway | Node.js server hosting |
| **Database** | MongoDB Atlas | Cloud database (free tier) |
| **AI API** | Groq Cloud | LLM inference (Llama 3.3 70B) |

---

## 4. Directory Structure

```
snapsave/
├── 📄 index.html                 # Frontend entry point
├── 📄 package.json               # Frontend dependencies
├── 📄 vite.config.js             # Vite configuration
├── 📄 tailwind.config.js         # Tailwind theme config
├── 📄 postcss.config.js          # PostCSS setup
├── 📄 vercel.json                # Vercel deployment config
├── 📄 PRD.md                     # Product Requirements Document
├── 📄 README.md                  # Quick start guide
├── 📄 PROJECT_DOCUMENT.md        # This file
│
├── 📁 public/                    # Static assets
│
├── 📁 src/                       # Frontend source code
│   ├── 📄 main.jsx               # React entry point
│   ├── 📄 App.jsx                # Root component
│   ├── 📄 index.css              # Global styles
│   │
│   ├── 📁 components/            # Reusable React components
│   │   ├── 📄 Navbar.jsx         # Top/mobile navigation
│   │   ├── 📄 AlertItem.jsx      # Waste alerts component
│   │   ├── 📄 Badge.jsx          # Tag/label component
│   │   ├── 📄 Button.jsx         # Reusable button
│   │   ├── 📄 Card.jsx           # Card container
│   │   ├── 📄 ProgressBar.jsx    # Progress indicator
│   │   ├── 📄 StatCard.jsx       # Stats display card
│   │   ├── 📄 UploadZone.jsx     # Drag-drop PDF upload
│   │   ├── 📄 ProtectedRoute.jsx # Route protection wrapper
│   │   │
│   │   └── 📁 charts/            # Chart components
│   │       ├── 📄 BudgetProgress.jsx    # Budget tracking chart
│   │       ├── 📄 DailyBarChart.jsx     # Daily spending bar chart
│   │       ├── 📄 SpendingPieChart.jsx  # Category pie chart
│   │       └── 📄 TimeHeatmap.jsx       # Time-of-day heatmap
│   │
│   ├── 📁 pages/                 # Page components
│   │   ├── 📄 LandingPage.jsx    # Marketing landing page
│   │   ├── 📄 AuthPage.jsx       # Login / Register
│   │   ├── 📄 DashboardPage.jsx  # Main dashboard
│   │   ├── 📄 InsightsPage.jsx   # Deep analytics
│   │   ├── 📄 GoalsPage.jsx      # Savings goals & budgets
│   │   └── 📄 UploadPage.jsx     # PDF upload page
│   │
│   ├── 📁 context/               # React Context API
│   │   └── 📄 AuthContext.jsx    # Auth state management
│   │
│   ├── 📁 hooks/                 # Custom React hooks
│   │   └── 📄 useTransactions.js # Transaction data fetching
│   │
│   ├── 📁 utils/                 # Frontend utilities
│   │   ├── 📄 api.js             # API client (axios-like)
│   │   ├── 📄 analytics.js       # Analytics calculations
│   │   ├── 📄 categorize.js      # Transaction categorization
│   │   ├── 📄 pdfParser.js       # Client-side PDF parsing
│   │   └── 📄 storage.js         # localStorage helpers
│   │
│   └── 📁 data/                  # Static data
│       └── 📄 sampleData.js      # Demo transaction data
│
├── 📁 backend/                   # Backend source code
│   ├── 📄 package.json           # Backend dependencies
│   ├── 📄 render.yaml            # Render deployment config
│   ├── 📄 RENDER_DEPLOYMENT.md   # Render setup guide
│   ├── 📄 api-tests.rest         # REST Client tests
│   ├── 📄 test-api.rest          # API endpoint tests
│   ├── 📄 test-ai.rest           # AI endpoint tests
│   ├── 📄 test-complete.rest     # All 20 endpoints tested
│   │
│   └── 📁 src/                   # Backend source
│       ├── 📄 server.js          # Express app setup
│       │
│       ├── 📁 config/            # Configuration
│       │   └── 📄 database.js    # MongoDB connection
│       │
│       ├── 📁 models/            # Mongoose schemas
│       │   ├── 📄 User.js        # User schema with auth
│       │   ├── 📄 Transaction.js # Transaction schema
│       │   └── 📄 Goal.js        # Goals/budgets schema
│       │
│       ├── 📁 routes/            # Express route handlers
│       │   ├── 📄 auth.js        # Registration & login routes
│       │   ├── 📄 upload.js      # PDF upload & parsing routes
│       │   ├── 📄 transactions.js # Transaction CRUD routes
│       │   ├── 📄 goals.js       # Goals API routes
│       │   └── 📄 ai.js          # AI tips generation routes
│       │
│       ├── 📁 controllers/       # Route logic
│       │   ├── 📄 authController.js      # Auth business logic
│       │   ├── 📄 uploadController.js    # Upload processing
│       │   ├── 📄 transactionController.js # Transaction CRUD
│       │   ├── 📄 goalController.js      # Goal management
│       │   └── 📄 aiController.js        # AI tips generation
│       │
│       ├── 📁 middleware/        # Express middleware
│       │   └── 📄 auth.js        # JWT verification
│       │
│       └── 📁 utils/             # Backend utilities
│           ├── 📄 pdfParser.js   # Server-side PDF extraction
│           └── 📄 categorize.js  # Transaction categorization
```

---

## 5. Features

### 5.1 Authentication System

| Feature | Description |
|---|---|
| **Registration** | Create account with name, email, password |
| **Login** | Email/password authentication with JWT token |
| **Token Management** | 7-day expiry, auto-refresh, secure storage |
| **Protected Routes** | Redirect to /auth if not authenticated |
| **Logout** | Clear tokens and user session |
| **Password Security** | bcrypt hashing with 10 salt rounds |
| **Timeout Handling** | 5s fallback if token validation fails |

### 5.2 Dashboard

| Feature | Description |
|---|---|
| **Key Metrics** | Total spent, total received, net balance, savings rate |
| **Category Breakdown** | Pie chart with spending by category & percentages |
| **Daily Spending** | Bar chart showing spending trends over time |
| **Financial Health Score** | A-F grade based on savings rate & spending patterns |
| **Waste Alerts** | Flags repeated merchant visits (3+ with ≥₹150 total) |
| **AI Tips** | Personalized saving recommendations from Groq LLM |
| **Responsive Design** | Mobile bottom nav, desktop top nav |

### 5.3 Deep Insights

| Feature | Description |
|---|---|
| **Top 10 Merchants** | Ranked by total spend with transaction count |
| **Category Analysis** | Breakdown with percentages and visualizations |
| **Repeated Expenses** | Detect money leaks (merchants with 3+ small transactions) |
| **Time Heatmap** | Spending patterns by hour of day |
| **Potential Savings** | Calculated based on category analysis |
| **Date Filtering** | Filter transactions by custom date range |

### 5.4 Goals & Budgets

| Feature | Description |
|---|---|
| **Savings Goal** | Set and track monthly savings target |
| **Category Budgets** | Create per-category spending limits |
| **Progress Tracking** | Real-time budget vs. actual spending |
| **Achievements** | Badges (First Upload, 100+ Transactions, etc.) |
| **Visual Progress** | Progress bars for goals and budgets |

### 5.5 PDF Upload & Parsing

| Feature | Description |
|---|---|
| **Drag-and-Drop** | Easy file selection interface |
| **File Validation** | PDF only, maximum 5MB |
| **Auto-Categorization** | 8 intelligent categories (food, transport, shopping, etc.) |
| **Server Parsing** | pdfjs-dist text extraction with regex patterns |
| **Bulk Import** | Insert all transactions at once |
| **Error Handling** | Validation & user-friendly error messages |

---

## 6. Getting Started

### Prerequisites

- **Node.js** v18+ (v20 recommended)
- **npm** or **yarn**
- **MongoDB Atlas** account (free tier)
- **Groq API Key** (for AI features)

### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/snapsave.git
cd snapsave
```

### Step 2: Setup Frontend

```bash
# Install dependencies
npm install

# Create .env file (if needed)
# Add any API base URL if not using default

# Start development server
npm run dev

# Build for production
npm run build
```

The frontend will run on `http://localhost:5173` (Vite default)

### Step 3: Setup Backend

```bash
cd backend
npm install
```

Create `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/snapsave?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=development
```

Start backend server:

```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

Backend runs on `http://localhost:5000`

### Step 4: Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **API Health:** http://localhost:5000/api/health

---

## 7. API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Endpoints Overview

#### Auth Routes (`/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| GET | `/auth/verify` | Verify JWT token | ✅ |

**Register Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

#### Upload Routes (`/upload`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/upload` | Upload & parse PhonePe PDF | ✅ |

**Request:**
- Form-data with `file` key containing PDF
- Content-Type: multipart/form-data

**Response:**
```json
{
  "message": "PDF processed successfully",
  "transactionCount": 125,
  "transactions": [
    {
      "date": "2024-01-15T10:30:00Z",
      "merchant": "Swiggy",
      "amount": 450,
      "type": "debit",
      "category": "food"
    }
  ]
}
```

---

#### Transaction Routes (`/transactions`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/transactions` | Get all user transactions | ✅ |
| POST | `/transactions` | Create transaction | ✅ |
| PUT | `/transactions/:id` | Update transaction | ✅ |
| DELETE | `/transactions/:id` | Delete transaction | ✅ |
| GET | `/transactions/stats/summary` | Get aggregated stats | ✅ |

**Query Parameters (GET):**
```
?startDate=2024-01-01&endDate=2024-01-31&category=food&type=debit&page=1&limit=20
```

**Response (Stats Summary):**
```json
{
  "totalSpent": 15000,
  "totalReceived": 5000,
  "netBalance": -10000,
  "savingsRate": 25,
  "transactionCount": 125,
  "categoryBreakdown": {
    "food": { "amount": 3000, "percentage": 20 },
    "transport": { "amount": 2500, "percentage": 16.7 }
  }
}
```

---

#### Goals Routes (`/goals`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/goals` | Get all goals for user | ✅ |
| POST | `/goals` | Create new goal | ✅ |
| PUT | `/goals/:id` | Update goal | ✅ |
| DELETE | `/goals/:id` | Delete goal | ✅ |

**Create Goal Request:**
```json
{
  "type": "monthly_savings",
  "targetAmount": 10000,
  "month": "2024-01"
}
```

or

```json
{
  "type": "category_budget",
  "category": "food",
  "budgetAmount": 2000,
  "month": "2024-01"
}
```

---

#### AI Routes (`/ai`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/ai/tips` | Generate AI savings tips | ✅ |

**Request:**
```json
{
  "categoryBreakdown": {
    "food": 3000,
    "transport": 2500
  },
  "savingsRate": 25,
  "totalSpent": 15000,
  "transactions": []
}
```

**Response:**
```json
{
  "tips": [
    "You spent ₹3000 on food this month. Try meal prepping or using grocery delivery apps.",
    "Consider carpooling or public transport to reduce transport costs."
  ]
}
```

---

#### Health Check (`/health`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/health` | Server health status | ❌ |

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 8. Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Transaction Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  date: Date (required),
  merchant: String (required),
  amount: Number (required),
  type: String (enum: ["debit", "credit"]),
  category: String (enum: ["food", "transport", "shopping", "entertainment", "health", "recharge", "transfers", "other"]),
  description: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
- userId
- userId + date (for range queries)
- userId + category
```

### Goal Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String (enum: ["monthly_savings", "category_budget"]),
  targetAmount: Number (required),
  category: String (for category_budget type),
  month: String (format: "YYYY-MM"),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
- userId + month
- userId + type
```

---

## 9. Development Workflow

### Running in Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Starts on http://localhost:5000 with nodemon auto-reload
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Starts on http://localhost:5173 with Vite HMR
```

### Testing API Endpoints

Use REST Client files in `backend/`:

```bash
# Open in VS Code with REST Client extension
backend/test-complete.rest
```

Or use cURL:
```bash
# Test health
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'
```

### Code Quality

```bash
# Lint frontend code
npm run lint

# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

## 10. Deployment Guide

### Frontend Deployment (Vercel)

1. **Connect GitHub Repository**
   - Go to vercel.com → New Project
   - Import your GitHub repository

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Set `VITE_API_BASE_URL`

3. **Deploy**
   - Vercel automatically deploys on push to main branch
   - Preview URLs generated for each PR

### Backend Deployment (Render)

1. **Create Render Service**
   - Go to render.com → New + Web Service
   - Connect GitHub repository
   - Choose backend folder root

2. **Configure Environment**
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables from `.env`

3. **Deploy**
   ```bash
   # Or use render.yaml
   cd backend
   cat render.yaml
   ```

4. **MongoDB Connection**
   - Use MongoDB Atlas for cloud database
   - Get connection string from Atlas dashboard
   - Add to Render environment variables

### Database Deployment (MongoDB Atlas)

1. **Create Account** at mongodb.com/cloud/atlas
2. **Create Cluster** (free tier available)
3. **Get Connection String**
4. **Add IP Whitelist** (or allow all IPs)
5. **Set Database User** credentials

---

## 11. Configuration

### Frontend Environment Variables

Create `src/.env` or configure in Vite:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_JWT_STORAGE_KEY=snapsave_token
```

### Backend Environment Variables

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/snapsave

# Authentication
JWT_SECRET=your-secret-key-min-32-chars-long
JWT_EXPIRE=7d

# AI/Groq
GROQ_API_KEY=your-groq-api-key

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes

# Deployment
FRONTEND_URL=http://localhost:5173
```

---

## 12. Contributing Guidelines

### Code Style

- **Frontend:** React hooks, functional components, Tailwind CSS
- **Backend:** Express middleware patterns, Mongoose schemas
- **Naming:** camelCase for variables/functions, PascalCase for components

### Commit Messages

```
feat: Add new feature description
fix: Bug fix description
docs: Documentation update
refactor: Code refactoring
test: Add or update tests
chore: Maintenance tasks
```

### Pull Request Process

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit
3. Push to GitHub: `git push origin feature/your-feature`
4. Create Pull Request with description
5. Request review from team
6. Merge after approval

### Testing

- Test all 20 API endpoints before deployment
- Use `test-complete.rest` for comprehensive API testing
- Test frontend pages in mobile & desktop views
- Clear browser localStorage and test fresh auth flow

---

## Troubleshooting

### Common Issues

**Issue:** Frontend can't connect to backend
- **Solution:** Check CORS is enabled in `backend/src/server.js`
- Verify backend running on correct port (5000)
- Check network tab in DevTools for actual error

**Issue:** PDF upload fails
- **Solution:** Verify file is valid PDF < 5MB
- Check backend logs for parsing errors
- Ensure MongoDB has space for new transactions

**Issue:** JWT token expired
- **Solution:** Clear localStorage and login again
- Check JWT_SECRET matches in .env
- Verify token expiry is set correctly (7d)

**Issue:** MongoDB connection error
- **Solution:** Check connection string in `.env`
- Verify MongoDB Atlas IP whitelist
- Test with `mongo shell` or `mongosh`

---

## Support & Resources

- **Documentation:** See README.md and PRD.md
- **API Tests:** Run `backend/test-complete.rest`
- **Database:** mongodb.com/docs
- **Frontend:** react.dev, tailwindcss.com
- **Backend:** expressjs.com, mongoose.org

---

**End of Project Documentation**

---

*For questions or improvements, please refer to the PRD.md and README.md files.*
