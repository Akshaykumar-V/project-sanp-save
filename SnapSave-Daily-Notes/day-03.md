# SnapSave V1 --- Day 3 Notes

## Smart Categorization Foundation

**Date:** 20/09/2026\
**Day:** 3\
**Work duration:** Approximately 3--4 hours\
**Branch:** `feature/smart-categorization`\
**Main commit:** `feat: improve transaction categorization`\
**PR:** #3 → merged into `develop`

------------------------------------------------------------------------

## 1. Objective

Day 3 focused on making SnapSave understand **what a transaction is
about**.

The parser from Days 1--2 could extract a transaction, but extraction
alone is not enough for a financial application.

We need to classify transactions into useful categories.

Examples:

``` text
Swiggy → Food
Uber → Transport
Amazon → Shopping
Jio → Recharge
Apollo Pharmacy → Health
```

The goal was to create a reusable categorization system.

------------------------------------------------------------------------

# 2. The categorization problem

A transaction contains a merchant or description.

The application needs to convert that description into a category.

Conceptually:

``` text
Transaction
     ↓
Merchant / Description
     ↓
Keyword matching
     ↓
Category
```

The initial categories included:

-   food
-   transport
-   shopping
-   entertainment
-   health
-   recharge
-   transfers
-   other

------------------------------------------------------------------------

# 3. Problem found in the upload controller

There was categorization logic inside the upload controller.

At the same time, there was already a shared categorization utility.

This meant the same responsibility was present in two places.

That creates a maintenance problem.

For example, if the food keyword list changes in one place but not the
other, the application could classify the same transaction differently
depending on where it is processed.

------------------------------------------------------------------------

# 4. Refactoring the categorization logic

The duplicate categorization logic was removed from the upload
controller.

The controller now uses the shared backend categorizer.

The idea is:

``` text
Before:

Upload Controller → categorization logic
Shared utility    → categorization logic

After:

Upload Controller
       ↓
Shared categorizer
```

This is an example of **separation of responsibility**.

The controller handles upload processing.

The categorizer handles category decisions.

------------------------------------------------------------------------

# 5. Improving keyword matching

The categorizer was also improved.

The important change was giving priority to **more specific keywords**.

Example:

``` text
Amazon
Amazon Prime
```

If the generic keyword `Amazon` is checked first, `Amazon Prime` could
incorrectly become Shopping.

The improved approach prefers the more specific match.

Conceptually:

``` text
Amazon Prime
     ↓
Possible matches:
Amazon
Amazon Prime
     ↓
Choose more specific match
     ↓
Entertainment
```

This prevents generic keywords from incorrectly overriding more specific
descriptions.

------------------------------------------------------------------------

# 6. Case-insensitive matching

The categorizer also needs to work regardless of capitalization.

For example:

``` text
SWIGGY
Swiggy
swiggy
```

should not become three different categories.

The system should treat them consistently.

------------------------------------------------------------------------

# 7. Safe fallback

If the categorizer doesn't recognize a merchant, it should not crash.

It returns:

> `other`

Similarly, empty, null or undefined input should be handled safely.

This is important because real transaction data is not always perfect.

------------------------------------------------------------------------

# 8. Categorization tests

A new test file was created:

`backend/tests/categorize.test.js`

The tests covered:

-   food
-   transport
-   shopping
-   health
-   recharge/bills
-   transfers
-   specific keyword priority
-   unknown merchant
-   empty input
-   null/undefined input
-   case-insensitive behavior

The purpose was to test both normal and edge cases.

------------------------------------------------------------------------

# 9. Development issue and lesson

During development, the categorization test initially imported the wrong
categorizer.

There are two similarly named files:

``` text
Frontend:
src/utils/categorize.js

Backend:
backend/src/utils/categorize.js
```

The backend test must use the backend utility.

The wrong import caused the test to fail.

After correcting the path, the tests passed.

### My learning

This showed why project structure and import paths matter.

Having similarly named utilities in frontend and backend can cause
confusion, so tests help identify these mistakes early.

------------------------------------------------------------------------

# 10. Day 3 test result

After the categorization work:

**5 test suites**\
**31 tests**

were passing.

This meant the previous parser tests continued to work and the new
categorization tests were also passing.

------------------------------------------------------------------------

# 11. My understanding / my point

My main understanding is:

> **Day 3 changed SnapSave from simply extracting transaction data to
> starting to understand the meaning of that transaction.**

For example:

``` text
Day 1
"Paid to Swiggy ₹450"
        ↓
Extract transaction

Day 3
"Swiggy"
        ↓
Food
```

Another important point is that categorization should be
**centralized**.

If multiple parts of the application contain their own category rules,
maintaining the system becomes difficult.

------------------------------------------------------------------------

# 12. Why categorization matters later

Categorization is needed for later financial analysis.

For example:

``` text
Food
  ₹3,000

Shopping
  ₹5,000

Transport
  ₹2,000
```

Now SnapSave can analyze spending by category.

Therefore:

``` text
Parser
 ↓
Categorizer
 ↓
Financial analysis
```

------------------------------------------------------------------------

# 13. Git and GitHub

The work was developed on the feature branch:

`feature/smart-categorization`

After implementation and testing, the changes were committed and pushed.

A Pull Request was created:

> PR #3

It was reviewed and merged into `develop`.

------------------------------------------------------------------------

## 14. Day 3 result

The main result was:

> **Categorization became a shared backend service instead of duplicated
> upload-controller logic, and the matching system was improved to
> handle specific keywords and edge cases.**

### What I should be able to explain

> "Day 3 focused on smart categorization. I centralized the backend
> categorization logic, removed duplicate logic from the upload
> controller, improved keyword priority and added tests for categories
> and edge cases. After the changes, 31 tests were passing."
