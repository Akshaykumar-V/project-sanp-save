# SnapSave V1 --- Day 5 Notes

## Transaction Intelligence --- Entity Knowledge Foundation

**Date:** 25/09/2026\
**Day:** 5\
**Work duration:** Approximately 3--4 hours\
**Branch:** `feature/transaction-intelligence`\
**Main work:** Transaction intelligence fields, `UserEntity`, entity
normalization and entity identification\
**PR:** merged into `develop`

------------------------------------------------------------------------

## 1. Objective

Day 5 moved SnapSave beyond basic categorization.

Until Day 4, the system could answer:

> "What category is this transaction?"

Day 5 started answering:

> **"Who or what is involved in this transaction?"**

This is called **entity intelligence**.

An entity can be:

-   a person
-   a merchant
-   a self-transfer
-   an unknown entity

------------------------------------------------------------------------

# 2. Why entities are needed

Consider:

``` text
Paid to Rahul ₹500
Paid to Amruth Tea ₹50
Paid to Zomato ₹118
```

The category alone is not enough.

SnapSave should also understand:

``` text
Rahul → PERSON
Amruth Tea → MERCHANT
Zomato → MERCHANT
```

This allows the application to build a history for each entity.

------------------------------------------------------------------------

# 3. Transaction model changes

The transaction model was extended with intelligence-related
information.

### Provider

Records the UPI source:

-   PHONEPE
-   GOOGLE_PAY
-   PAYTM
-   BHIM
-   AMAZON_PAY
-   UNKNOWN

### Entity key

Provides an internal identifier for the entity.

### Entity type

The current types include:

-   PERSON
-   MERCHANT
-   SELF_TRANSFER
-   UNKNOWN

### Transaction role

The transaction can be treated as:

-   EXPENSE
-   INCOME
-   SELF_TRANSFER

These fields create the foundation for later financial analysis.

------------------------------------------------------------------------

# 4. `UserEntity` model

A new `UserEntity` model was created.

Its purpose is to store user-specific knowledge about entities.

Important information includes:

-   user
-   entity key
-   display name
-   entity type
-   category
-   relationship
-   known status
-   monitoring setting
-   aliases

The important architecture is:

``` text
User
 ↓
UserEntity
 ↓
Entity knowledge
```

This is important for privacy and correctness.

If two users both have an entity called "Rahul," SnapSave should not
automatically assume it is the same person.

------------------------------------------------------------------------

# 5. Known vs unknown entities

Suppose a transaction contains:

> Amruth Tea

The application may eventually learn:

``` text
Amruth Tea
 ↓
Known merchant
 ↓
Food
```

But if a completely unfamiliar name appears:

``` text
XYZ
 ↓
Unknown entity
```

The system should not immediately assume that XYZ is unnecessary or
suspicious.

Unknown does not mean bad.

------------------------------------------------------------------------

# 6. Entity normalization

Names can appear in different forms.

For example:

``` text
Amruth Tea
AMRUTH TEA
amruth tea
```

Without normalization, these could appear to be different entities.

Normalization creates a consistent internal form.

Conceptually:

``` text
"Amruth Tea"
      ↓
"amruth_tea"
```

The display name can still remain human-friendly.

The normalized value is mainly useful for matching.

------------------------------------------------------------------------

# 7. Entity identification

Another utility attempts to determine the type of entity.

Examples:

``` text
Paid to Rahul
     ↓
PERSON
```

``` text
Amruth Tea
     ↓
MERCHANT
```

``` text
Self Transfer
     ↓
SELF_TRANSFER
```

If there isn't enough information:

``` text
UNKNOWN
```

The UNKNOWN state is important because the system should not pretend to
know something that the data does not support.

------------------------------------------------------------------------

# 8. Why people can be both incoming and outgoing

A person can appear in both directions.

For example:

``` text
Paid to Rahul ₹500
Received from Rahul ₹500
```

This does not automatically mean they are two different entities.

The same person may have both outgoing and incoming transactions.

This is one reason entity knowledge should be separate from simple
debit/credit classification.

------------------------------------------------------------------------

# 9. Self-transfers

Self-transfers are another important case.

If the user moves money between their own accounts, that should not
automatically be treated as normal spending.

For example:

``` text
Account A
   ↓
Self transfer
   ↓
Account B
```

The money moved, but it may not represent consumption.

This distinction becomes important for future spending analysis.

------------------------------------------------------------------------

# 10. Tests

Tests were added for entity normalization and entity identification.

Examples included:

-   paid to a person
-   received from a person
-   merchant detection
-   self-transfer detection
-   unknown entity
-   null input
-   undefined input

The goal was to make the intelligence utilities safe and predictable.

------------------------------------------------------------------------

# 11. My understanding / my point

My main understanding from Day 5 is:

> **Categorization tells us the type of spending, while entity
> intelligence tells us who or what the transaction is connected to.**

For example:

``` text
Amruth Tea
 ↓
Entity = Amruth Tea
 ↓
Type = MERCHANT
 ↓
Category = Food
```

This gives SnapSave more context.

Another important point is:

> **Unknown does not mean unnecessary.**

The system should learn before making stronger conclusions.

------------------------------------------------------------------------

# 12. Why this is important for future waste detection

A single transaction cannot tell us whether something is wasteful.

For example:

> ₹500 at a restaurant

could have many valid reasons.

Instead, SnapSave should eventually look at:

``` text
Entity
 ↓
User history
 ↓
Frequency
 ↓
Amount
 ↓
Trend
 ↓
Personal baseline
 ↓
Possible unusual pattern
```

Day 5 creates the entity foundation needed for that.

------------------------------------------------------------------------

# 13. Git and GitHub

The feature was developed on:

`feature/transaction-intelligence`

The branch was pushed and a Pull Request was created to `develop`.

After review and testing, it was merged.

The working tree was kept clean and the test suite was verified after
the merge.

------------------------------------------------------------------------

## 14. Day 5 result

The main result was:

> **SnapSave gained a foundation for understanding entities connected to
> transactions, including people, merchants, self-transfers and unknown
> entities, while keeping entity knowledge user-specific.**

### What I should be able to explain

> "Day 5 introduced transaction intelligence. I extended transactions
> with provider, entity and transaction-role information, created a
> UserEntity model for user-specific entity knowledge, added
> normalization for consistent entity matching, and added entity
> identification for people, merchants, self-transfers and unknown
> cases."
