````

\# SnapSave — Day 12 Development Notes



\## Date

05 October 2026



\## Main Task

\### Period-Based Spending Comparison



Today I worked on improving the spending comparison logic used by the AI recommendation system.



The previous implementation had a limitation. It was sending all available transactions as the current period:



```js

getSpendingChanges(\[], transactions)

````



This meant the system was not actually comparing two different time periods.



For example, if the database contained transactions from June, July, August, September and October, the comparison logic could treat all of them as the current spending data.



That makes the comparison less useful because we cannot properly answer:



> "Did the user spend more this month compared with the previous month?"



So today's goal was to make the comparison actually period-based.



\---



\# 1. Understanding the Problem



The existing `spendingComparisonService` was already able to compare two transaction arrays.



The problem was not inside the comparison calculation itself.



It was the data being passed into it.



The controller needed to provide:

```

Previous Month Transactions

&#x20;         ↓

Comparison Service

&#x20;         ↑

Current Month Transactions

```



Instead of:

```

All Transactions

&#x20;     ↓

Current Period

```



So I decided to create a separate service responsible for identifying the correct spending periods.



\---



\# 2. Created spendingPeriodService



Created:

```

backend/src/services/spendingPeriodService.js

```



The main function is:

```

getSpendingPeriods(transactions)

```



Its responsibility is to find:



\- Current month

\- Previous month

\- Transactions belonging to the current month

\- Transactions belonging to the previous month



\---



\# 3. Finding the Current Period



The service first checks the transaction dates.



The latest transaction date is used to determine the current calendar month.



For example:

```

Latest transaction:

October 5, 2026



Current period:

October 1 → November 1



Previous period:

September 1 → October 1

```



This means the system automatically works with the latest available transaction data instead of using the server's current month.



\---



\# 4. Calendar Month Logic



I added helper functions:

```

getMonthStart()

getNextMonthStart()

getPreviousMonthStart()

```



These functions make the date boundaries easier to understand.



The current period uses:

```

currentStart

currentEnd

```



The previous period uses:

```

previousStart

previousEnd

```



Transactions are then filtered using the date range.



The comparison uses:

```

date >= start

date < end

```



This avoids overlapping transactions between two periods.



\---



\# 5. Handling Empty Data



The service also handles the case where there are no transactions.



Instead of throwing an error, it returns:

```

{

&#x20;   currentStart: null,

&#x20;   currentEnd: null,

&#x20;   previousStart: null,

&#x20;   previousEnd: null,

&#x20;   currentTransactions: \[],

&#x20;   previousTransactions: \[]

}

```



This makes the service safer for API usage.



I also made sure transactions without a valid date do not affect the selection of the latest transaction.



\---



\# 6. Updated AI Recommendation Controller



I updated:

```

backend/src/controllers/aiRecommendationController.js

```



The controller now does:

```

Get user transactions

&#x20;       ↓

Build spending profile

&#x20;       ↓

Detect spending patterns

&#x20;       ↓

Get current + previous periods

&#x20;       ↓

Compare spending

&#x20;       ↓

Build financial context

&#x20;       ↓

Generate AI recommendations

```



The important change is:

```

const {

&#x20;   previousTransactions,

&#x20;   currentTransactions,

} = getSpendingPeriods(transactions);

```



Then:

```

const comparisons = getSpendingChanges(

&#x20;   previousTransactions,

&#x20;   currentTransactions

);

```



So the AI recommendation system now receives an actual period-to-period comparison.



\---



\# 7. Added Tests



Created:

```

backend/tests/spendingPeriod.test.js

```



I added tests for the important cases.



\### Test 1 — Current and Previous Month



Checks that transactions are correctly separated between the two calendar months.



\### Test 2 — Latest Transaction Month



Makes sure the month containing the latest transaction becomes the current period.



\### Test 3 — Different Years



Tested a case such as:

```

December 2025

January 2026

```



This checks that the month calculation works correctly across year boundaries.



\### Test 4 — Empty Transactions



Checks that an empty transaction list returns empty periods without crashing.



\### Test 5 — Transactions Without Dates



Checks that transactions without dates do not incorrectly determine the current period.



All 5 spending-period tests passed.



\---



\# 8. Added Controller Regression Test



I also updated:

```

backend/tests/aiRecommendationController.test.js

```



The regression test uses:

```

September:

Amruth Tea = ₹40 + ₹50

Total = ₹90



October:

Amruth Tea = ₹100

```



The expected comparison is:

```

Previous = ₹90

Current  = ₹100

Change   = ₹10

```



The test verifies that the controller is actually passing period-based comparisons into the AI recommendation service.



This is important because it tests the complete connection between:

```

Transactions

&#x20;   ↓

Period Service

&#x20;   ↓

Comparison Service

&#x20;   ↓

AI Recommendation Service

```



\---



\# 9. One Testing Issue I Found



Initially I used a test where the previous and current amounts were equal.



The comparison result had:

```

changeAmount = 0

```



But `getSpendingChanges()` intentionally filters out comparisons where:

```

changeAmount === 0

```



So the test could not find the comparison.



I changed the test data to:

```

Previous = ₹90

Current = ₹100

```



Now:

```

changeAmount = ₹10

```



and the regression test passed.



This was a useful reminder that tests need to follow the actual behaviour of the existing service instead of assuming every comparison will be returned.



\---



\# 10. Testing Result



First I ran the targeted tests.



\### Spending Period Tests

```

5 tests passed

```



\### AI Recommendation Controller Tests

```

5 tests passed

```



Then I ran the complete backend test suite.



Result:

```

Test Suites: 16 passed, 16 total

Tests:       96 passed, 96 total

Snapshots:   0 total

```



I also checked the staged changes using:

```

git diff --cached --check

```



There were no whitespace errors.



\---



\# 11. Git Workflow



After testing, I staged the four changed files:

```

backend/src/controllers/aiRecommendationController.js

backend/src/services/spendingPeriodService.js

backend/tests/aiRecommendationController.test.js

backend/tests/spendingPeriod.test.js

```



Staged diff:

```

4 files changed

263 insertions

4 deletions

```



Then committed the feature:

```

feat: add period-based spending comparisons

```



The feature was developed on:

```

feature/period-based-spending-comparison

```



Then pushed to GitHub.



After that I created a Pull Request into:

```

develop

```



and merged it.



Finally I updated my local `develop` branch using:

```

git checkout develop

git pull origin develop

```



The feature was successfully pulled into the local branch.



\---



\# 12. What I Learned Today



Today I understood that a comparison system is only useful when the input periods are correct.



The comparison function itself can be correct, but if we pass the wrong transaction ranges, the final result is still wrong.



I also learned the importance of separating responsibilities.



Instead of putting date filtering directly inside the controller, I created:

```

spendingPeriodService

```



So now:

```

Controller

&#x20;   ↓

Period Service

&#x20;   ↓

Comparison Service

&#x20;   ↓

Financial Context

&#x20;   ↓

AI

```



Each part has a clearer responsibility.



\---



\# 13. Current Limitation



The current implementation defines the current period as the calendar month containing the latest transaction.



So if the latest transaction is on:

```

October 5

```



the current period is the whole October calendar range, even though only October 1–5 may have transactions.



This means the current month can be a partial month.



A future improvement could be a more advanced comparison such as:

```

October 1–5

vs

September 1–5

```



This would make partial-month comparisons more fair.



For now, calendar-month comparison is simple and predictable.



\---



\# Day 12 Summary



Today I fixed an important limitation in SnapSave's spending comparison system.



\### Before

```

All transactions

&#x20;     ↓

Current spending

```



\### After

```

Latest transaction

&#x20;       ↓

Current calendar month

&#x20;       +

Previous calendar month

&#x20;       ↓

Spending comparison

&#x20;       ↓

AI recommendation

```



The feature is now implemented, tested, committed, pushed and merged into `develop`.



\### Final Test Result

```

16 / 16 test suites passed

96 / 96 tests passed

```