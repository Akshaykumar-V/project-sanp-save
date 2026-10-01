# SnapSave V1 --- Day 6 Notes

## Personal Spending Intelligence

**Date:** 26/09/2026\
**Day:** 6\
**Work duration:** Approximately 3--4 hours\
**Branch:** `feature/spending-profile`\
**Main commit:** `3913997 feat: add spending pattern intelligence`\
**PR:** merged into `develop`

------------------------------------------------------------------------

## 1. Objective

Day 6 focused on understanding the user's **spending behavior**.

The application already had:

-   parsed transactions
-   categories
-   entities

Now it needed to analyze those transactions together.

The main questions were:

-   How much did the user spend?
-   How much did they receive?
-   How many expenses were made?
-   What is the average expense?
-   What categories receive the most money?
-   Which entities repeat?
-   How many small payments occur?
-   How has spending changed between periods?

------------------------------------------------------------------------

# 2. Spending profile

A spending profile is a summary of the user's transactions.

The profile includes information such as:

-   total spent
-   total received
-   transaction count
-   expense count
-   income count
-   average expense
-   largest expense
-   category totals
-   entity totals
-   small payment count
-   small payment total

Conceptually:

``` text
Transactions
     ↓
Spending Profile
     ↓
Overall financial behavior
```

------------------------------------------------------------------------

# 3. Why a profile is necessary

A single transaction doesn't provide enough context.

Example:

``` text
Zomato → ₹500
```

We cannot conclude anything strong from this transaction alone.

But if we compare history:

``` text
Previous Zomato spending → ₹200
Current Zomato spending → ₹600
```

then there is an observable change.

The profile gives SnapSave the baseline information needed for later
comparisons.

------------------------------------------------------------------------

# 4. Spending patterns

The second part of Day 6 was pattern detection.

The system looks at three major patterns.

### Entity patterns

It counts how often an entity appears and the total amount spent on it.

Example:

``` text
Amruth Tea
10 transactions
₹500 total
₹50 average
```

This is a repeated spending pattern.

------------------------------------------------------------------------

### Small payment pattern

The current implementation uses a threshold of:

**₹100 or below**

It counts small debit transactions and calculates their total.

Example:

``` text
₹20
₹30
₹50
₹40
₹25
```

The result could be:

``` text
5 small payments
₹165 total
```

Important:

> Small payment does not mean waste.

It is only a measurable pattern.

------------------------------------------------------------------------

### Category patterns

Debit transactions are grouped by category.

For example:

``` text
Food
₹3,000

Shopping
₹5,000

Recharge
₹500
```

This gives an overview of where money is going.

------------------------------------------------------------------------

# 5. Spending comparison

The third part compares two transaction sets.

Conceptually:

``` text
Previous period
       +
Current period
       ↓
Comparison
```

Example:

``` text
Previous → ₹300
Current → ₹700
Change → +₹400
```

The system can also calculate percentage change when a previous amount
exists.

------------------------------------------------------------------------

# 6. New spending

If:

``` text
Previous → ₹0
Current → ₹500
```

there is no meaningful percentage calculation based on zero.

Instead, the system treats it as new spending.

This distinction prevents misleading calculations.

------------------------------------------------------------------------

# 7. Why this matters for personal finance

SnapSave should compare the user against **their own history**, rather
than using one universal rule for everyone.

For example:

> ₹500 may be normal for one user but unusual for another.

Therefore, personal history is more useful than arbitrary assumptions.

------------------------------------------------------------------------

# 8. Tests

Day 6 added automated tests for:

### Spending profile

Testing:

-   totals
-   counts
-   averages
-   largest expense
-   category totals
-   entity totals
-   small payments

### Spending patterns

Testing:

-   repeated entities
-   small payments
-   category patterns
-   empty inputs

### Spending comparison

Testing:

-   increase
-   decrease
-   new spending
-   no change
-   percentage changes
-   multiple entities

------------------------------------------------------------------------

# 9. Test result

After Day 6:

**10 test suites**\
**65 tests**

were passing.

This showed that the new calculations were working together with the
existing parser, categorization and intelligence tests.

------------------------------------------------------------------------

# 10. My understanding / my point

My main point from Day 6 is:

> **Before calling something wasteful, SnapSave needs to understand the
> user's normal behavior.**

The system should work like:

``` text
Transaction history
       ↓
Personal baseline
       ↓
Current behavior
       ↓
Comparison
       ↓
Unusual pattern
```

not:

``` text
One transaction
       ↓
Waste
```

This is an important design principle for the whole project.

------------------------------------------------------------------------

# 11. Connection with Day 5

Day 5 answered:

> **Who or what is involved?**

Day 6 answers:

> **How much and how often?**

Example:

``` text
Day 5:
Amruth Tea → MERCHANT

Day 6:
Amruth Tea
10 transactions
₹500 total
₹50 average
```

Entity intelligence therefore becomes useful for spending intelligence.

------------------------------------------------------------------------

# 12. Git and GitHub

The feature branch was:

`feature/spending-profile`

The work was committed and pushed.

The main commit was:

`3913997 feat: add spending pattern intelligence`

A Pull Request was created and merged into `develop`.

After merging, `develop` was updated and the full test suite was run
again.

------------------------------------------------------------------------

## 13. Day 6 result

The main result was:

> **SnapSave gained a personal spending intelligence layer that can
> summarize spending, detect repeated patterns and compare spending
> between periods.**

### What I should be able to explain

> "Day 6 created the spending profile, spending pattern and spending
> comparison services. The profile summarizes financial behavior, the
> pattern service identifies repeated entities, small payments and
> category patterns, and the comparison service detects changes between
> periods. We finished with 10 test suites and 65 passing tests."
