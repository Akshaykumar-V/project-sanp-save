# SnapSave V1 – Day 10 Development Notes

## Date
01/10/2026

## Day 10 – Gemini Financial Recommendations API

### 1. Objective

The main goal of Day 10 was to expose the Gemini recommendation system through a proper backend API.

On Day 9, SnapSave was able to communicate with Gemini and generate structured financial recommendations.

However, the AI recommendation functionality was still inside the backend service layer.

The frontend needed a clean and authenticated API endpoint that could request personalized recommendations.

The Day 10 flow became:

User
→ Authenticated API Request
→ AI Recommendation Controller
→ User Transactions
→ Spending Profile
→ Spending Patterns
→ Spending Comparison
→ Financial Context
→ Gemini Recommendation Service
→ Structured Recommendations
→ API Response

---

## 2. Why an API Endpoint Was Needed

The frontend should not directly communicate with Gemini.

The Gemini API key must remain on the backend.

The backend already has access to the user's stored transactions and can prepare the financial context before sending information to the AI provider.

Therefore, the frontend only needs to call one protected endpoint.

The endpoint created for Day 10 was:

`POST /api/ai/recommendations`

This keeps the AI integration behind the backend API.

---

## 3. Recommendation Controller

A new controller was created:

`backend/src/controllers/aiRecommendationController.js`

The controller handles the complete recommendation request.

The main steps are:

- Get the authenticated user's ID
- Load the user's transactions
- Check whether transactions are available
- Build the spending profile
- Detect spending patterns
- Calculate spending comparisons
- Build the financial context
- Send the context to the AI recommendation service
- Return the recommendations to the frontend

This keeps the route simple while the business logic stays inside services.

---

## 4. Getting User Transactions

The controller loads transactions belonging only to the authenticated user.

The transactions are sorted by date before being processed.

This is important because financial recommendations must be based on the user's own transaction history.

---

## 5. Building Financial Information

Day 10 reused the existing financial intelligence services.

The main pieces are:

`buildSpendingProfile()`

This provides the overall spending profile.

`detectSpendingPatterns()`

This identifies patterns such as repeated expenses and other spending behavior.

`getSpendingChanges()`

This provides the spending comparison information used by the existing intelligence pipeline.

Finally, the information is combined into the structured financial context.

This means Day 10 did not create a separate financial analysis system.

Instead, it reused the intelligence pipeline developed during previous days.

---

## 6. Current Period Comparison Limitation

One important limitation was documented during Day 10.

The first version of the API uses the complete available transaction history.

The current controller passes an empty previous-period array when calling the spending comparison service.

Because of this, the current comparison should not be treated as a true previous-period versus current-period comparison.

In some cases, existing spending can therefore appear as new spending.

This is a known limitation.

Proper date-range intelligence can be added later by defining current and previous periods before generating comparisons.

---

## 7. Gemini Recommendation Service

The controller does not directly call the Gemini SDK.

Instead, it uses:

`generateFinancialRecommendations()`

from the AI recommendation service.

The service receives the structured financial context.

The context is converted into the AI prompt and sent through the Gemini provider.

The returned response is parsed and validated.

The expected recommendation structure contains:

- type
- title
- message
- evidence
- action

This keeps the AI provider details separate from the HTTP controller.

---

## 8. Authentication

The new endpoint was added to the existing AI route:

`backend/src/routes/ai.js`

The AI router uses the authentication middleware.

Therefore:

`POST /api/ai/recommendations`

is protected.

Only an authenticated user can request recommendations.

The existing legacy endpoint:

`POST /api/ai/tips`

was kept and was not deleted.

---

## 9. Empty Transaction Handling

The controller handles users who do not have any transactions.

Instead of sending an empty dataset to Gemini, the API returns a successful response with an empty recommendation list.

The response also explains that personalized recommendations are not available because there are no transactions.

This avoids unnecessary AI requests.

---

## 10. Error Handling

Different failure cases were handled separately.

If the Gemini API key is missing, the API returns a `503` response.

If Gemini is temporarily unavailable or returns a high-demand/503 condition, the API also returns a temporary service-unavailable response.

If Gemini returns an invalid recommendation response, the API returns a `502` response.

Other unexpected failures return a general `500` server error.

This gives the frontend predictable responses for different failure situations.

---

## 11. Controller Tests

Day 10 added controller-level tests for the new endpoint.

The tests covered four important situations.

### Test 1 – No Transactions

The API should return:

- HTTP 200
- Empty recommendations
- Gemini should not be called

### Test 2 – Normal Recommendation Generation

The controller should:

- Read the user's transactions
- Build the financial context
- Call the recommendation service
- Return the generated recommendations

### Test 3 – Missing Gemini API Key

The test verifies that a missing Gemini configuration is converted into a `503` response.

### Test 4 – Temporary Gemini Failure

The test verifies that a Gemini `503` / unavailable condition is converted into a temporary service-unavailable response.

---

## 12. Full Test Suite

After the Day 10 changes, the complete project test suite was executed.

The result was:

- 15 test suites passed
- 90 tests passed
- 0 test failures
- 0 snapshots

The Day 10 controller tests passed together with the existing parser, entity, spending intelligence, financial context, prompt, and AI recommendation tests.

This confirmed that the new API did not break the existing backend functionality.

---

## 13. Git Workflow

Day 10 was developed on a separate feature branch:

`feature/ai-recommendation-api`

The main implementation commit was:

`005f4c4 feat: expose Gemini financial recommendations API`

The feature was pushed to GitHub and reviewed through a pull request.

The pull request was merged into:

`develop`

The merge commit was:

`4b63baa`

This kept the development history organized instead of committing the feature directly to `develop`.

---

## 14. What Day 10 Added

By the end of Day 10, SnapSave had a complete backend path for requesting AI financial recommendations.

The backend could now:

- Authenticate the user
- Load the user's transactions
- Build financial intelligence
- Prepare financial context
- Call the Gemini recommendation service
- Validate the AI output
- Handle important API failures
- Return structured recommendations through an API endpoint

The frontend could now use:

`POST /api/ai/recommendations`

to access this functionality.

---

## 15. Day 10 Result

Day 10 converted the AI recommendation system from an internal backend capability into an accessible authenticated API.

The architecture at this point was:

Transactions
→ Financial Intelligence
→ AI Context
→ Gemini
→ Recommendation Service
→ Backend API
→ Frontend

The main remaining limitation was period-based comparison intelligence.

The next frontend work could focus on consuming this API and displaying the recommendations inside the existing SnapSave Insights experience.

---

## 16. Day 10 Summary

Day 10 was mainly about backend API integration.

The important achievement was connecting the existing financial intelligence pipeline to a secure API boundary that the frontend could use.

The implementation also included error handling and controller tests, which made the new endpoint safer to integrate into the application.

Day 10 completed the backend side of the Gemini recommendation feature.
