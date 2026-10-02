\# SnapSave V1 – Day 11 Development Notes



\## Date: 02/10/2026



\## Day 11 – Frontend Integration of AI Financial Recommendations



\---



\## 1. Objective of Day 11



The main objective of Day 11 was to connect the AI financial recommendation system developed on the backend with the SnapSave frontend.



In the previous days, the backend AI recommendation flow was completed using Gemini. The backend could collect the user's transaction data, generate financial context, send the context to Gemini, and return structured financial recommendations.



However, the recommendations were not yet visible inside the SnapSave application.



Therefore, Day 11 focused on frontend integration.



The main tasks were:



\- Connect the frontend with the AI recommendation API.

\- Add an API helper for recommendations.

\- Fetch recommendations from the authenticated backend.

\- Display AI recommendations inside the Insights page.

\- Handle loading, error, and empty states.

\- Keep the existing analytics sections working.

\- Build and test the complete application after the changes.



The goal was to make the AI recommendation feature part of the existing SnapSave Insights experience instead of keeping it only as a backend feature.



\---



\## 2. Existing Insights Page



Before starting the changes, the SnapSave frontend already had an Insights page.



The page was responsible for displaying different spending analytics generated from the user's transactions.



Existing sections included:



\- Top Merchants

\- Category Breakdown

\- Repeated Expenses

\- Time Heatmap

\- Potential Savings



The page already used the transaction data available through the frontend transaction hook.



Because these analytics were already working, the Day 11 implementation was designed to extend the existing page instead of creating a completely separate AI page.



This was important because the AI recommendations should be connected with the financial information that the user is already viewing.



The existing analytics were therefore preserved.



\---



\## 3. Connecting the Frontend API



The first implementation step was updating the frontend API helper.



The existing API utility already contained the authenticated request system and an API object for AI-related operations.



An additional method was added for AI recommendations.



The frontend now has a method that sends an authenticated POST request to:



`/ai/recommendations`



The request is handled through the existing authenticated request function.



This means the frontend does not directly communicate with Gemini.



Instead, the flow is:



Frontend → SnapSave Backend → Gemini → Backend → Frontend



This keeps the Gemini API key on the backend and prevents the frontend from exposing the AI service credentials.



The new API method was named:



`generateRecommendations`



This keeps the API structure consistent with the existing `generateTips` method.



\---



\## 4. Integrating Recommendations into InsightsPage



After adding the API helper, the next step was modifying the existing `InsightsPage.jsx`.



The page was updated to import the AI recommendation API.



React state was added to manage:



\- AI recommendations

\- Loading state

\- Error state



The page also uses `useEffect` so that recommendations can be requested when transaction data is available.



The basic flow became:



1\. Load transactions.

2\. Check whether transactions are available.

3\. Call the recommendation API.

4\. Receive the recommendation response.

5\. Store the recommendations in frontend state.

6\. Display the recommendations on the Insights page.



This connects the frontend analytics page with the backend AI recommendation service.



\---



\## 5. AI Recommendation Section



A new AI recommendation section was added near the top of the Insights page.



The purpose of this section is to show personalized financial recommendations generated from the user's transaction information.



Each recommendation can contain information such as:



\- Recommendation type

\- Title

\- Message

\- Evidence

\- Suggested action



For example, the backend can return structured information explaining a spending pattern and an action that the user can consider.



The frontend does not generate these recommendations itself.



It only receives the structured recommendation data from the backend and presents it to the user.



This keeps the responsibilities separated:



Frontend:

\- Display recommendations.



Backend:

\- Collect transaction data.

\- Build financial context.

\- Generate recommendations.

\- Validate the AI response.



Gemini:

\- Generate the recommendation content based on the supplied financial context.



\---



\## 6. Recommendation Types



The frontend also includes different visual variants for different recommendation types.



The recommendation type is used to decide which badge style should be displayed.



The implemented types include:



\- `SPENDING\_INCREASE`

\- `NEW\_SPENDING`

\- `REPEATED\_EXPENSE`

\- `SPENDING\_PROFILE`



A default style is also available for unknown recommendation types.



This makes the recommendations easier to understand visually.



For example, a spending increase can be displayed differently from a general spending profile observation.



The frontend therefore uses the structured type returned by the backend instead of trying to guess the type from the recommendation message.



\---



\## 7. Loading State



AI generation can take more time than normal frontend calculations because the request has to reach the backend and then communicate with the Gemini service.



Therefore, a loading state was added.



While recommendations are being generated, the Insights page can show that the AI recommendations are still loading.



This prevents the page from looking broken or empty while the API request is running.



The user can continue to see the rest of the Insights page while the recommendation request is being processed.



\---



\## 8. Error Handling



An error state was also added for the AI recommendation section.



If the recommendation request fails, the frontend does not crash the entire Insights page.



Instead, the AI section can display an error message.



This is important because the AI service can temporarily be unavailable.



During earlier backend testing, Gemini could return temporary `503` or `UNAVAILABLE` responses because of service availability.



The backend already handles these situations and returns an appropriate response.



The frontend now has a place to handle such failures without affecting the existing spending analytics.



\---



\## 9. Empty Recommendation State



Another state was handled when there are no recommendations.



This can happen when there are not enough transaction data or when the backend returns an empty recommendation list.



Instead of displaying an empty card, the frontend can show an appropriate message.



This makes the UI more predictable.



The page therefore has three important AI states:



1\. Loading

2\. Error

3\. Recommendations / Empty result



Handling these states makes the integration more complete.



\---



\## 10. Existing Analytics Were Preserved



One important requirement of Day 11 was not to break the existing Insights page.



The existing analytics sections were kept.



The page continues to display:



\- Top Merchants

\- Category Breakdown

\- Repeated Expenses

\- Time Heatmap

\- Potential Savings



The AI recommendation section was added on top of the existing analytics rather than replacing them.



This means the Insights page now combines traditional analytics with AI-generated financial recommendations.



The user can therefore see both:



\- What the transaction data shows.

\- What recommendations can be generated from those observations.



\---



\## 11. Build Verification



After completing the frontend integration, the application build was tested.



The command used was:



`npm run build`



The build completed successfully.



The Vite build reported:



\- Vite version: 5.4.21

\- Modules transformed: 861

\- Build completed successfully

\- Build time: approximately 14 seconds



There were warnings about the old Browserslist `caniuse-lite` database.



There was also a warning that some generated JavaScript chunks were larger than 500 kB.



These warnings did not stop the build.



The important result was that the production build completed successfully.



\---



\## 12. Code Quality Check



A Git diff whitespace check was also performed using:



`git diff --check`



Initially, there was a blank line issue at the end of the modified file.



It was fixed before committing the changes.



After fixing it, the diff check completed without errors.



This helped ensure that the final changes did not contain unnecessary whitespace problems.



\---



\## 13. Full Test Suite



After the frontend integration was completed, the complete test suite was executed.



The result was:



\- 15 test suites passed

\- 90 tests passed

\- 0 test failures



The existing backend tests continued to pass after the frontend AI integration.



Some expected console error messages appeared during AI controller tests because the tests intentionally simulate situations such as:



\- Missing Gemini API key

\- Temporary Gemini service unavailability



These were expected test scenarios and did not represent test failures.



The complete test suite therefore remained stable after the Day 11 changes.



\---



\## 14. Git Commit



After testing and checking the changes, the Day 11 frontend integration was committed.



Commit:



`b9a94b8 feat: integrate AI recommendations into insights`



The main files changed during this feature were:



\- `src/pages/InsightsPage.jsx`

\- `src/utils/api.js`



The feature branch was then pushed to GitHub.



\---



\## 15. Pull Request



The Day 11 feature was developed using a separate feature branch:



`feature/frontend-ai-recommendations`



A pull request was created from the feature branch into:



`develop`



The pull request was:



`PR #11`



The pull request was reviewed and merged successfully.



The merge commit was:



`b53845a Merge pull request #11 from Akshaykumar-V/feature/frontend-ai-recommendations`



This keeps the SnapSave development history organized and shows that the feature was developed separately before being merged into the main V1 development branch.



\---



\## 16. Day 11 Result



Day 11 completed the frontend connection for the AI recommendation feature.



Before Day 11:



Transaction data → Backend → Gemini → Recommendations



But the recommendations were mainly available through the backend API.



After Day 11:



Transaction data

→ Backend financial analysis

→ Gemini recommendation generation

→ AI recommendation API

→ SnapSave Insights Page



The AI recommendation system is now connected to the user-facing Insights page.



The existing financial analytics were preserved, and the new AI section supports loading, error, empty, and recommendation states.



The complete test suite passed with 15 suites and 90 tests.



The production build also completed successfully.



\---



\## 17. What I Learned on Day 11



Today I learned how to connect a backend AI feature with an existing frontend application.



Important things I understood:



\- How frontend API helpers connect UI components with backend routes.

\- How authenticated API requests are made from the frontend.

\- How React state can manage asynchronous AI responses.

\- How `useEffect` can trigger data fetching when transaction data becomes available.

\- Why loading and error states are important for AI-powered features.

\- How structured AI responses can be displayed in reusable UI cards.

\- Why the Gemini API key should remain on the backend.

\- How to preserve existing analytics while adding a new feature.

\- How to verify the frontend integration using production builds and the full test suite.

\- How to maintain a clean feature-branch and pull-request workflow.



\---



\## 18. Day 11 Summary



Day 11 was focused mainly on completing the user-facing side of the AI recommendation system.



The backend recommendation API created during the previous development stage was connected to the SnapSave Insights page.



The frontend now requests personalized recommendations through the authenticated backend API and displays them along with the existing financial analytics.



The feature was tested through the complete project test suite and the production build.



Result:



\*\*15 test suites passed\*\*  

\*\*90 tests passed\*\*  

\*\*Production build passed\*\*  

\*\*PR #11 merged successfully\*\*



This completes the frontend integration stage of the AI recommendation feature for SnapSave V1.

