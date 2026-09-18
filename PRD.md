# SnapSave — Product Requirements Document (PRD)

**Version:** 1.0.0  
**Date:** February 27, 2026  
**Author:** Akshay Kumar  
**Status:** Development Complete, Pre-Deployment

---

## 1. Executive Summary

**SnapSave** is an AI-powered personal expense analyzer built for Indian PhonePe UPI users. Users upload their PhonePe PDF transaction statements and instantly receive a rich dashboard with spending analytics, smart savings tips, waste detection, and AI-generated financial advice — all powered by Groq's Llama 3.3 70B model.

**Target Audience:** Indian millennials & Gen-Z who use PhonePe for daily UPI payments and want better visibility into their spending habits.

**Core Value Proposition:** Turn a boring bank statement PDF into actionable financial insights in under 10 seconds.

---

## 2. Problem Statement

- Indian UPI users process 100+ transactions/month but have zero visibility into spending patterns.
- PhonePe provides raw PDF statements, but no analytics, budgeting tools, or savings recommendations.
- Existing expense trackers require manual data entry — painful for 200+ monthly transactions.
- Users don't know where their money "leaks" (repeated small purchases, category overspending).

---

## 3. Solution Overview

SnapSave automates the entire flow:

```
Upload PhonePe PDF → Auto-parse transactions → Smart categorization → 
Dashboard analytics → AI-powered savings tips → Budget tracking
```

**Key Differentiators:**
1. Zero manual entry — PDF parsing handles everything
2. AI financial advisor (Groq/Llama 3.3 70B) gives personalized tips
3. Waste detection identifies "money leak" patterns
4. Financial health score grades spending habits (A–F)
5. Privacy-first: PDF processing works in-browser for guest users

---

## 4. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI framework (hooks, context) |
| Vite | 5.1.0 | Build tool & dev server |
| Tailwind CSS | 3.4.1 | Utility-first styling |
| React Router | 6.22.0 | Client-side routing |
| Recharts | 2.10.0 | Data visualization (pie, bar, heatmap) |
| pdfjs-dist | 4.2.67 | Client-side PDF parsing (demo mode) |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Express.js | 5.2.1 | REST API server |
| MongoDB Atlas + Mongoose | 9.2.2 | Cloud database with ODM |
| bcryptjs | 3.0.3 | Password hashing |
| jsonwebtoken | 9.0.3 | JWT authentication (7-day expiry) |
| multer | 2.0.2 | PDF file upload handling |
| pdfjs-dist | 5.4.624 | Server-side PDF parsing |
| groq-sdk | 0.37.0 | AI tips generation (Llama 3.3 70B) |
| cors | 2.8.6 | Cross-origin request handling |

### Deployment Target
| Component | Platform |
|---|---|
| Frontend | Vercel (SPA, configured) |
| Backend | Render / Railway |
| Database | MongoDB Atlas (cloud) |

---

## 5. Features & Functional Requirements

### 5.1 Authentication System
| ID | Requirement | Priority |
|---|---|---|
| AUTH-01 | User registration with name, email, password | P0 |
| AUTH-02 | Login with email/password → JWT token (7-day expiry) | P0 |
| AUTH-03 | Auto-verify token on app load (with 5s timeout fallback) | P0 |
| AUTH-04 | Protected routes redirect to /auth if not authenticated | P0 |
| AUTH-05 | Logout clears token + user data from localStorage | P0 |
| AUTH-06 | Password hashing with bcrypt (10 salt rounds) | P0 |

### 5.2 PDF Upload & Parsing
| ID | Requirement | Priority |
|---|---|---|
| UPLOAD-01 | Drag-and-drop zone for PhonePe PDF statements | P0 |
| UPLOAD-02 | File validation: PDF only, max 5MB | P0 |
| UPLOAD-03 | Server-side parsing via pdfjs-dist + regex patterns | P0 |
| UPLOAD-04 | Auto-categorization into 8 categories: food, transport, shopping, entertainment, health, recharge, transfers, other | P0 |
| UPLOAD-05 | Bulk insert parsed transactions into MongoDB | P0 |
| UPLOAD-06 | Client-side parsing fallback for guest/demo mode | P1 |
| UPLOAD-07 | Progress indicator during processing | P1 |
| UPLOAD-08 | Sample data option for users without a PDF | P2 |

### 5.3 Dashboard Analytics
| ID | Requirement | Priority |
|---|---|---|
| DASH-01 | Stat cards: Total Spent, Total Income, Net Balance with trend badges | P0 |
| DASH-02 | Spending by Category — donut pie chart with color-coded legend | P0 |
| DASH-03 | Daily Spending — bar chart across the month | P0 |
| DASH-04 | Financial Health Score — letter grade (A–F) with emoji and savings rate | P0 |
| DASH-05 | Waste Alerts — merchants with 3+ visits AND ≥₹150 total, yearly projections | P0 |
| DASH-06 | Smart Saving Tips — 4 dynamic tips based on spending patterns | P1 |
| DASH-07 | AI-Powered Tips — Groq/Llama 3.3 generates 3–5 personalized recommendations | P1 |
| DASH-08 | Clear Data — delete all transactions (server + local) with confirmation modal | P1 |
| DASH-09 | Upload New — quick access to re-upload from dashboard | P1 |

### 5.4 Deep Insights Page
| ID | Requirement | Priority |
|---|---|---|
| INSIGHT-01 | Top 10 Merchants table with total, count, avg per transaction | P0 |
| INSIGHT-02 | Category Breakdown table with amount and percentage share | P0 |
| INSIGHT-03 | Repeated Small Expenses detection (3+ transactions per merchant) | P0 |
| INSIGHT-04 | Spending Time Heatmap — day of week × time of day matrix | P1 |
| INSIGHT-05 | Potential Savings calculator — "IF you reduce X by Y%, save Z" scenarios | P1 |

### 5.5 Goals & Budgets
| ID | Requirement | Priority |
|---|---|---|
| GOAL-01 | Monthly savings goal — set target, track progress with animated bar | P0 |
| GOAL-02 | Category budgets — per-category spending limits (CRUD) | P0 |
| GOAL-03 | Budget progress visualization via progress bars | P0 |
| GOAL-04 | Real spending data merged with budget targets | P0 |
| GOAL-05 | Dynamic achievements system — 4 badges based on real milestones | P1 |
| GOAL-06 | Auto-detect "achieved" status when goal is met | P1 |

### 5.6 AI Financial Advisor
| ID | Requirement | Priority |
|---|---|---|
| AI-01 | Privacy-safe: only aggregated summaries sent to AI (no raw transactions) | P0 |
| AI-02 | Groq Llama 3.3 70B model with JSON response format enforcement | P0 |
| AI-03 | 3–5 personalized tips with title, description, potential savings amount | P0 |
| AI-04 | Indian-context advice (₹, local services, UPI habits) | P1 |
| AI-05 | Graceful fallback: generic tips if no transactions exist | P1 |
| AI-06 | Error handling: API key invalid (401), rate limit (429), generic (500) | P1 |

---

## 6. API Specification (22 Endpoints)

### 6.1 Root & Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | API info & endpoint listing |
| GET | `/health` | No | Server status, DB state, uptime |

### 6.2 Authentication (`/api/auth`)
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/register` | No | `{ name, email, password }` | `{ token, user }` |
| POST | `/login` | No | `{ email, password }` | `{ token, user }` |
| GET | `/me` | Yes | — | `{ user }` |

### 6.3 Transactions (`/api/transactions`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | List with filters: `?startDate`, `?endDate`, `?category`, `?type`, `?page`, `?limit` |
| GET | `/summary` | Yes | Aggregated totals & category breakdown |
| POST | `/` | Yes | Create one or bulk: `{ transactions: [...] }` |
| GET | `/:id` | Yes | Get single transaction |
| PUT | `/:id` | Yes | Update transaction fields |
| DELETE | `/:id` | Yes | Delete single transaction |
| DELETE | `/all` | Yes | Delete all user transactions |

### 6.4 Goals (`/api/goals`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | List goals `?month=YYYY-MM` |
| POST | `/` | Yes | Create: `{ type, targetAmount, month, category? }` |
| GET | `/:id` | Yes | Get single goal with progress |
| PUT | `/:id` | Yes | Update goal |
| DELETE | `/:id` | Yes | Delete goal |

### 6.5 Upload (`/api/upload`)
| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/` | Yes | `multipart/form-data` (field: `pdf`) | Parse PDF → categorize → insert |

### 6.6 AI (`/api/ai`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/tips` | Yes | Generate AI financial tips |

---

## 7. Data Models

### 7.1 User
| Field | Type | Constraints |
|---|---|---|
| name | String | Required, max 50 chars |
| email | String | Required, unique, lowercase, regex validated |
| password | String | Required, min 6 chars, bcrypt hashed, excluded from queries |
| createdAt / updatedAt | Date | Auto-generated |

**Instance Methods:** `comparePassword()`, `generateAuthToken()`

### 7.2 Transaction
| Field | Type | Constraints |
|---|---|---|
| user | ObjectId → User | Required, indexed |
| date | Date | Required |
| merchant | String | Required, trimmed |
| amount | Number | Required, min 0 |
| type | Enum | `DEBIT` or `CREDIT` |
| category | Enum | `food`, `transport`, `shopping`, `entertainment`, `health`, `recharge`, `transfers`, `other` |
| rawText | String | Optional (original PDF line) |
| transactionId | String | Optional |
| utrNumber | String | Optional |

**Compound Index:** `{ user: 1, date: -1 }`  
**Static Methods:** `getByDateRange()`, `getCategoryTotals()`

### 7.3 Goal
| Field | Type | Constraints |
|---|---|---|
| user | ObjectId → User | Required, indexed |
| type | Enum | `monthly_savings` or `category_budget` |
| targetAmount | Number | Required, min 0 |
| currentAmount | Number | Default 0 |
| category | String | Required if type is `category_budget` |
| month | String | Required, format `YYYY-MM` |
| status | Enum | `active`, `achieved`, `failed` (default: active) |

**Compound Index:** `{ user: 1, month: 1 }`  
**Methods:** `getProgress()`, `updateCurrentAmount()`

---

## 8. Analytics Engine (9 Functions)

| Function | Output | Used By |
|---|---|---|
| `calculateTotals()` | Total spent, received, net balance, savings rate % | Dashboard stat cards |
| `getCategoryBreakdown()` | Category-wise amounts with % and color codes | Pie chart, Insights |
| `getDailySpending()` | Day-by-day spending array (dynamic range) | Bar chart |
| `getTopMerchants()` | Top 10 merchants: total, count, avg | Insights table |
| `getRepeatedExpenses()` | Merchants with 3+ transactions, yearly projections | Insights, Waste alerts |
| `getTimePatterns()` | 4×7 heatmap (time-of-day × day-of-week) | Heatmap visualization |
| `getWasteAlerts()` | High-frequency merchants ≥₹150, with reduction tips | Dashboard alerts |
| `generateSavingTips()` | 4 personalized tips from spending patterns | Dashboard tips |
| `calculateFinancialScore()` | Letter grade A–F, emoji, label, savings rate | Dashboard badge |

All functions are null-safe and handle empty/missing data gracefully.

---

## 9. User Flows

### 9.1 New User Flow
```
Landing Page → Sign Up → Upload PhonePe PDF → Dashboard (auto-redirect)
                                                 ├── View spending analytics
                                                 ├── Generate AI tips
                                                 ├── Set savings goals
                                                 └── Explore deep insights
```

### 9.2 Returning User Flow
```
App Load → Auto-verify JWT → Dashboard (server data loaded)
                               ├── Upload new PDF (clears old data)
                               └── Continue with existing data
```

### 9.3 Demo User Flow
```
Landing Page → "Try Demo" link → Dashboard (sample data)
```

---

## 10. UI/UX Design System

| Element | Style |
|---|---|
| **Cards** | `rounded-xl`, `border border-gray-100`, `shadow-sm` |
| **Buttons (primary)** | Gradient (`blue-500` → `blue-600`), `rounded-xl`, shadow |
| **Buttons (danger)** | `bg-red-50`, `text-red-600`, `border-red-200` |
| **Icons** | Emoji-based in colored `rounded-xl` containers |
| **Navigation** | Glassmorphism (`bg-white/80 backdrop-blur-md`), pill-shaped tabs |
| **Landing Page** | Dark theme (`gray-950`), animated gradient blobs |
| **Auth Page** | Dark gradient background, `rounded-2xl` white card |
| **Modals** | `backdrop-blur-sm`, `rounded-2xl`, centered, `slide-up` animation |
| **Tables** | Rounded borders, uppercase tracking-wide headers, hover highlights |
| **Animations** | `float`, `shimmer`, `slide-up`, `fade-in`, stagger delays |
| **Typography** | Inter (body), JetBrains Mono (numbers/currency) |

---

## 11. Security

| Aspect | Implementation |
|---|---|
| Password storage | bcrypt with 10 salt rounds |
| Authentication | JWT with 7-day expiry |
| Route protection | `protect` middleware on all authenticated endpoints |
| Password field | Excluded from all query results (`select: false`) |
| AI privacy | Only aggregated summaries sent to Groq — no raw transaction data |
| File upload | PDF-only validation, 10MB server limit, 5MB client limit |
| CORS | Configured for frontend origin |
| Token timeout | 5-second frontend timeout prevents infinite loading on server downtime |

---

## 12. Environment Configuration

### Backend (`backend/.env`)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<secret>
JWT_EXPIRE=7d
GROQ_API_KEY=gsk_...
```

### Frontend (root `.env`)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 13. Current Status & Metrics

| Area | Status | Completion |
|---|---|---|
| Backend API (22 endpoints) | ✅ Complete | 100% |
| Frontend (6 pages) | ✅ Complete | 100% |
| Authentication | ✅ Complete | 100% |
| PDF Parsing (PhonePe) | ✅ Working | 90% |
| Analytics Engine (9 functions) | ✅ Complete | 100% |
| Goals & Budgets (CRUD) | ✅ Complete | 100% |
| AI Tips (Groq) | ✅ Complete | 100% |
| Clear Data Feature | ✅ Complete | 100% |
| UI/UX Polish | ✅ Complete | 100% |
| Unit/Integration Tests | 🔲 Not started | 10% |
| Deployment | 🔲 Not started | 0% |

---

## 14. Future Roadmap

| Phase | Feature | Priority |
|---|---|---|
| v1.1 | Multi-bank support (GPay, Paytm, HDFC) | P1 |
| v1.1 | Export reports as PDF/Excel | P1 |
| v1.2 | Recurring expense detection & alerts | P1 |
| v1.2 | Monthly email/push notification summaries | P2 |
| v1.3 | Group expense splitting | P2 |
| v1.3 | Investment tracking (MF, stocks) | P2 |
| v2.0 | AI chatbot for expense queries ("How much did I spend on food?") | P1 |
| v2.0 | Mobile app (React Native) | P2 |
| v2.0 | Bill payment reminders | P2 |

---

## 15. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| PhonePe changes PDF format | Parsing breaks | Regex-based parser is modular; add new patterns per format version |
| Groq API rate limits | AI tips unavailable | Generic fallback tips served automatically |
| MongoDB Atlas free tier limits | DB throttling | Monitor usage; upgrade plan at scale |
| PDF parsing edge cases | Incomplete data | Client-side + server-side dual parsing; sample data fallback |
| JWT token theft | Account compromise | 7-day expiry, HTTPS in production, token rotation in v1.1 |

---

*Document generated for SnapSave v1.0.0 — Smart Expense Analyzer for PhonePe UPI Users*
