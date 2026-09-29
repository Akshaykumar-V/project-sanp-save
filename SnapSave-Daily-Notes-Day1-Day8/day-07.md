# SnapSave V1 --- Day 7 Notes

## AI Financial Insight Foundation

**Date:** 27/09/2026\
**Day:** 7\
**Work duration:** Approximately 3--4 hours\
**Branch:** `feature/ai-financial-insights`\
**Commits:**\
- `d98927e feat: add financial insight foundation` -
`b095557 feat: add financial context builder` **PR:** #7 → merged into
`develop`

------------------------------------------------------------------------

## 1. Objective

Day 7 was about converting the calculations from Day 6 into **structured
financial observations**.

Day 6 could calculate:

``` text
Previous → ₹300
Current → ₹700
Change → ₹400
```

Day 7 turns that into an insight:

> "Spending increased for this entity by ₹400."

The important distinction is:

> **Calculation → Observation**

------------------------------------------------------------------------

# 2. What is a financial insight?

A financial insight is a useful observation based on existing data.

Examples:

-   new spending detected
-   spending increased
-   repeated spending
-   small-payment pattern
-   overall spending profile

The system should base these insights on actual calculated values.

------------------------------------------------------------------------

# 3. Financial insight service

A new `financialInsightService.js` was created.

It receives:

-   profile
-   patterns
-   comparisons

and generates structured insights.

Conceptually:

``` text
Profile
Patterns
Comparisons
     ↓
Financial Insight Service
     ↓
Insights
```

------------------------------------------------------------------------

# 4. Spending increase insight

The service checks spending comparisons.

For an existing entity, the increase should be meaningful before an
insight is generated.

The current logic considers an increase meaningful when:

-   amount change is at least ₹100, OR
-   percentage change is at least 25%

Small insignificant changes can therefore be ignored.

Example:

``` text
₹500 → ₹505
```

would generally not generate a spending-increase insight.

But:

``` text
₹500 → ₹700
```

can generate one.

------------------------------------------------------------------------

# 5. New spending insight

If there was no previous spending:

``` text
Previous → ₹0
Current → ₹500
```

the service creates a:

`NEW_SPENDING`

insight.

This is different from a normal percentage increase.

------------------------------------------------------------------------

# 6. Repeated spending insight

The service can identify repeated entities.

When an entity appears at least three times, it can produce:

`REPEATED_SPENDING`

For example:

> Amruth Tea appears 5 times in your spending history.

Again, this is an observation.

It does not automatically mean that the spending is unnecessary.

------------------------------------------------------------------------

# 7. Small-payment insight

If the small-payment pattern contains at least five payments, the system
can create:

`SMALL_PAYMENT_PATTERN`

Example:

> 8 small payments added up to ₹420.

This can be useful for showing the user where many small transactions
accumulate.

------------------------------------------------------------------------

# 8. Overall spending profile insight

If there is spending data, the system can include a:

`SPENDING_PROFILE`

insight containing information such as:

-   total spent
-   expense count
-   average expense
-   largest expense

This gives later components a summarized view.

------------------------------------------------------------------------

# 9. Why we avoid automatically saying "waste"

This is a major project design principle.

Suppose:

``` text
Zomato → ₹500
```

We don't know why the user made the payment.

It could be:

-   regular food
-   family food
-   food for friends
-   a special occasion
-   another valid reason

Therefore, the system should report:

> "Spending increased."

rather than:

> "You wasted ₹500."

The first is directly supported by the data.

The second requires assumptions.

------------------------------------------------------------------------

# 10. Financial context builder

A second service was created:

`financialContextService.js`

Its purpose is to combine:

-   profile
-   patterns
-   comparisons
-   generated insights

into one structured context.

Conceptually:

``` text
Profile
   +
Patterns
   +
Comparisons
   +
Insights
   ↓
Financial Context
```

This gives the next AI layer one clean input.

------------------------------------------------------------------------

# 11. Why structured context is useful

Instead of making every future service independently calculate financial
information, the context builder provides a common structure.

The flow becomes:

``` text
Transactions
 ↓
Spending services
 ↓
Insights
 ↓
Financial Context
 ↓
Future AI
```

This also reduces the need to send raw transactions everywhere.

------------------------------------------------------------------------

# 12. Testing

Day 7 added tests for the financial insight service.

The tests cover:

-   spending increase
-   new spending
-   repeated spending
-   small-payment pattern
-   spending profile
-   insignificant increase
-   default/empty situations

The financial context builder also received tests to ensure it correctly
combines the different data sections.

------------------------------------------------------------------------

# 13. Test result

At the end of Day 7:

**12 test suites**\
**74 tests**

were passing.

The work was merged through PR #7 into `develop`.

------------------------------------------------------------------------

# 14. My understanding / my point

My main understanding is:

> **Day 6 calculated financial behavior. Day 7 turned those calculations
> into useful observations.**

For example:

``` text
Day 6:
Previous = ₹300
Current = ₹700
Change = ₹400

Day 7:
SPENDING_INCREASE
```

Another important point:

> **The system should report evidence instead of making accusations.**

This will make future AI recommendations more trustworthy.

------------------------------------------------------------------------

# 15. Connection with previous days

``` text
Day 5
Entity Intelligence
       ↓
Day 6
Spending Intelligence
       ↓
Day 7
Financial Insights
```

Day 5 tells us who/what.

Day 6 tells us how much/how often.

Day 7 tells us what changed or what pattern is worth showing.

------------------------------------------------------------------------

## 16. Day 7 result

The main result was:

> **SnapSave gained a structured financial insight layer and a financial
> context builder that prepare analyzed data for the future AI
> recommendation system.**

### What I should be able to explain

> "Day 7 converted spending calculations into structured insights such
> as new spending, spending increases, repeated spending and
> small-payment patterns. I also created a financial context builder
> that combines profile, patterns, comparisons and insights into one
> structure for the next AI layer. The complete suite had 12 test suites
> and 74 passing tests."
