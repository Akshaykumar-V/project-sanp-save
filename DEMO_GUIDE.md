# SnapSave demo guide — 3 November 2026

## Readiness

**NOT READY for a verified live core demo as of 2 November.** The local `backend/.env` has a placeholder MongoDB URI and JWT secret. Do not show a live login or saved upload until a real demo database is configured and the checklist below passes. The V1 checkout was clean on `main`; this guide and the upload feedback fix are on the local `demo-readiness-2026-11-02` branch and are not on GitHub.

SnapSave is a React/Vite interface with an Express/Mongoose API. It turns a text-based UPI PDF into transactions, then shows spending, insights, goals, and optional AI advice. The current checkout is the `v1.0.0` release code. Separate V2 feature branches exist; the transaction import reliability patch in the IDE is not part of this checkout.

## Setup on the demo laptop

1. Use **Node 20.x**. The installed Node at verification was 25.1.0, while `backend/package.json` declares 20.x. Run `node --version` before starting.
2. Dependencies are currently present in both the root and `backend`. If a fresh checkout is used, run `npm ci` once in each directory.
3. Put real demo-only values in `backend/.env`: `MONGODB_URI`, `JWT_SECRET`, `PORT=5000`, and optionally `GEMINI_API_KEY` and `GROQ_API_KEY`. Never show this file or its values on screen. The present MongoDB URI, JWT secret, and Groq key are examples, not usable credentials.
4. The frontend uses `http://localhost:5000/api` by default. If overriding, set `VITE_API_URL=http://localhost:5000/api` in a root `.env`. Vite serves port **5500**.
5. Use a dedicated fictional account, such as `snapsave-demo-20261103@example.com`. Keep its password privately with the team. Use a fresh account if a prior rehearsal already imported the fixture; do not clear or reuse real financial data.

### Start in two PowerShell terminals

Backend terminal:

```powershell
Set-Location 'C:\Users\AKSHAY KUMAR\OneDrive\Documents\project-sanp-save\backend'
node --version
npm run dev
```

Frontend terminal:

```powershell
Set-Location 'C:\Users\AKSHAY KUMAR\OneDrive\Documents\project-sanp-save'
npm run dev
```

Open `http://localhost:5500`. In another PowerShell window, run:

```powershell
Invoke-RestMethod http://localhost:5000/health
```

Proceed only if the health response says `database: Connected`. The API health route is `/health`, not `/api/health`. The backend can start in offline mode after failed database retries; a running HTTP port alone does not prove persistence.

## Synthetic data and expected results

Use [the synthetic PhonePe-style PDF](output/pdf/synthetic-phonepe-statement.pdf). It is labeled **SYNTHETIC DEMONSTRATION STATEMENT** and contains only fictional entries. To regenerate it, run `node scripts/generate-demo-statement.cjs` from the project root.

The real backend PDF extractor and PhonePe parser returned **7 transactions**:

| Type | Merchant | Amount | Category |
|---|---|---:|---|
| Credit | Demo Salary | ₹5,000 | transfers |
| Debit | Swiggy | ₹250 | food |
| Debit | Uber | ₹180 | transport |
| Debit | Swiggy | ₹150 | food |
| Debit | Amazon | ₹600 | shopping |
| Debit | Airtel | ₹299 | recharge |
| Debit | Swiggy | ₹120 | food |

Expected spending: **₹1,599** (250 + 180 + 150 + 600 + 299 + 120). Received: **₹5,000**. Net balance: **₹3,401**. Category debits: food ₹520, transport ₹180, shopping ₹600, recharge ₹299. Swiggy appears 3 times and totals ₹520. A November monthly savings goal of ₹4,000 should show ₹3,401, about 85% progress, after the database stores these transactions. A food budget of ₹600 should show ₹520 spent.

**Upload once per fresh demo account.** V1 uses `insertMany` with no deduplication constraint; reupload is expected to add another copy and inflate totals. This is a code-level finding, not a live database test. The V2 import fix has not been applied here.

## Preflight checklist

Record the result on the demo laptop before presenting:

1. `node --version` shows 20.x; both terminals start without fatal errors; `/health` says `Connected`.
2. Register the fictional account, sign out, enter a wrong password and confirm the error, then log in correctly. Refresh `/dashboard`; it should remain protected and authenticated.
3. Open **Upload**, select the synthetic PDF, and wait for **Successfully uploaded**. If upload fails, the page now shows the backend error and stays on Upload.
4. Confirm the dashboard shows 7 transactions and the exact totals above, with category and daily charts. Open **Insights** and check Swiggy and the category figures.
5. Open **Goals**; create the November ₹4,000 savings goal and ₹600 food budget. Refresh and confirm they persist and show the expected progress.
6. Open **Insights** for Gemini recommendations. The dashboard's separate **Generate AI Tips** button uses legacy Groq. Confirm each provider's result only if it actually returns; otherwise show the error state and describe AI as unavailable. Local computed saving tips are available without AI and must be described as rule-based.
7. Check browser console and backend logs for critical errors. Do not show credentials, personal statements, or a real account.

## Seven-minute presenter script

| Time | Click / show | Expected result and what to say | If it fails |
|---|---|---|---|
| 0–1 | Landing page | “SnapSave turns UPI statements into readable spending and goal tracking.” | Explain from the README and fixture. |
| 1–2 | **Login**, then dashboard refresh | Fictional account remains signed in. “JWT protects account data.” | State that database-backed login is unavailable; show the auth route and stop claiming live persistence. |
| 2–3 | **Upload** → select synthetic PDF | Success appears after server save. “The API extracts text, parses transactions, categorizes, then stores them.” | Show the labeled fixture and the parser verification figures; do not call it a successful upload. |
| 3–4 | **Dashboard** | ₹1,599 spent, ₹5,000 received, ₹3,401 balance; charts populate. “These match the seven entries.” | Use the table above as an independent calculation; label dashboard unavailable. |
| 4–5 | **Insights** → **Goals** → AI section | Swiggy ₹520, category analysis, goals at 85% and ₹520/₹600; optional Gemini result. | Skip AI if service fails. Explain local computed tips separately. If goals fail, do not claim they persisted. |
| 5–6 | GitHub **Code** → README → `src` → `backend/src` → `backend/tests` → branches | “React pages and charts are in src; Express routes/controllers and Mongoose models are in backend/src; Jest tests are in backend/tests.” | Use local file tree if GitHub is unavailable; say local changes are not online. |
| 6–7 | GitHub branch selector and `v1.0.0` tag | “main is the stable V1 release, develop is integration, feature branches hold individual tasks. V2 transaction import work is still separate.” | End with verified parser/tests and the remaining database/AI limits. |

## GitHub walkthrough and actual branch state

Show the [repository](https://github.com/Akshaykumar-V/project-sanp-save), its README, `src/pages`, `src/components`, `src/utils`, `backend/src/routes`, `backend/src/controllers`, `backend/src/models`, and `backend/tests`. Authentication, transaction, upload, goals, and AI routes are mounted under `/api`. `User`, `Transaction`, and `Goal` are the main persisted models. Explain: “`main` holds the stable release; `develop` is the integration branch; feature branches isolate work until reviewed.”

An online ref check on 2 November found `main`, `develop`, and feature branches including `feature/ai-recommendation-api`, `feature/frontend-ai-recommendations`, and `feature/spending-profile`. It did **not** list a transaction-import branch. Do not imply this local guide, upload change, or the IDE's V2 patch is visible on GitHub. The README's health endpoint was corrected locally to `/health`.

## Verification and limits (2 November)

| Check | Result | Evidence |
|---|---|---|
| Frontend lint | Passed | `npm run lint`, exit 0 |
| Frontend build | Passed | `npm run build`, exit 0 outside filesystem sandbox; first sandbox run was denied access to Vite config |
| Frontend startup | Passed on Node 20; failed on installed Node 25 | Temporary Node 20.20.2 Vite probe returned HTTP 200 for the page and React entry module twice; a Node 25 run reported an unknown file-read error and exited |
| Existing backend unit tests | Passed before fixture test was added | `npm test -- --runInBand` in `backend`: 17 suites, 101 tests, exit 0 |
| New demo PDF regression test | Not completed in Jest | `node --check tests/demoStatement.test.js` passed; full Jest rerun stalled on intermittent OneDrive file reads and was stopped. The same extraction and totals passed in a direct Node probe. |
| PDF extraction and parser | Passed | Actual `pdf-parse` + PhonePe parser: 7 entries, ₹1,599 / ₹5,000 / ₹3,401, exit 0 |
| MongoDB | Blocked by configuration | Local URI equals example placeholder; connection probe failed |
| Backend live startup | Failed to verify | Controlled startup probe did not reach `/health`; a Node 20 controller load later failed with `UNKNOWN` while reading a dependency in this OneDrive checkout |
| Registration, login, saved upload, dashboard, insights, goals | Not tested live | No working demo database |
| Gemini and Groq | Not tested live | Requires working authenticated account and provider service; Groq key is an example |
| Browser console | Not tested | UI session with an authenticated account unavailable |
| Reupload duplicates | Not tested live | V1 code has no unique import index; assume risk and upload once |

The frontend reads up to **500 transactions** for client-side dashboard and insights calculations. Do not claim full-history totals for a larger account. This 7-row fixture avoids that limit. The backend declares Node 20.x; Node 25.1.0 was used for the local checks, so repeat preflight on Node 20. The frontend upload feedback fix was checked by lint/build, but live failure feedback still needs browser confirmation.

## Troubleshooting

- **Database says “Not connected”:** check the demo-only MongoDB URI, credentials, network access, and Atlas IP allowlist without displaying values. Restart backend; retest `/health`. Do not proceed to login/upload.
- **Vite exits with a file-read error:** use the declared Node 20.x runtime, restart the frontend, and verify that it remains open while loading several pages. If it persists, try a local path outside OneDrive for the demo checkout; do not move or overwrite the current repository as part of rehearsal.
- **Wrong frontend API target or CORS error:** ensure frontend is at `localhost:5500`, backend at `localhost:5000`, and `VITE_API_URL` is unset or `http://localhost:5000/api`; restart Vite after changing env.
- **Upload error:** check PDF is the supplied text-based fixture, under 5 MB, and the account is logged in. Verify `/health` first. Do not substitute a personal statement.
- **Unexpected totals:** check transaction count. If it exceeds 7, suspect reupload; use a new fictional demo account. Do not delete a real user's transactions.
- **AI error:** show the error state and continue with rule-based dashboard tips. A cached example may be shown only if previously verified and clearly labeled as an example; none was verified in this pass.
- **No live database in time:** give a code-and-fixture walkthrough, explicitly describing parser/test results and saying that end-to-end storage was not verified.
