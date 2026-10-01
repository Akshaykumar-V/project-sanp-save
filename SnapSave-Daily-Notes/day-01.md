# SnapSave V1 --- Day 1 Notes

## Universal UPI Statement Parser Foundation

**Date:** 18/09/2026\
**Day:** 1\
**Work duration:** Approximately 3--4 hours\
**Branch:** `feature/universal-parser`\
**Commit:** `440c5df feat: add universal UPI statement parser`\
**PR:** #1 → merged into `develop`

------------------------------------------------------------------------

## 1. Objective

The main objective of Day 1 was to create the **foundation for a
Universal UPI Statement Parser**.

The problem is that SnapSave should not be designed only for one UPI
application. A user may have statements from PhonePe, Google Pay, Paytm,
BHIM, Amazon Pay, or another UPI source.

So the first goal was to create a modular parsing architecture that can
identify a provider and convert transaction information into one common
structure.

### Basic idea

``` text
UPI Statement
     ↓
Provider Detection
     ↓
PhonePe / Google Pay / Paytm / BHIM / Amazon Pay / Unknown
     ↓
Provider Parser or Generic Fallback
     ↓
Normalization
     ↓
Structured Transactions
```

------------------------------------------------------------------------

## 2. Why a Universal Parser?

A financial application should not depend on one PDF layout.

Different providers can have different:

-   headings
-   transaction descriptions
-   date formats
-   amount formats
-   debit/credit wording
-   transaction identifiers
-   PDF layouts

Therefore, the parser should have a common interface even when the
source formats are different.

### Important point

There is **no single universal UPI statement layout** that every
provider follows exactly.

The idea of our parser is therefore not:

> "Every PDF has the same format."

The idea is:

> "Different formats can be converted into one common transaction
> structure."

------------------------------------------------------------------------

## 3. Modular architecture

The parser was divided into separate responsibilities.

### `detector.js`

Responsible for identifying the provider.

It can identify providers such as:

-   PHONEPE
-   GOOGLE_PAY
-   PAYTM
-   BHIM
-   AMAZON_PAY
-   UNKNOWN

The important idea is that provider detection happens before detailed
parsing.

### `phonepeParser.js`

This contains the dedicated PhonePe parsing logic.

PhonePe was the first provider to receive a dedicated parser.

It extracts information such as:

-   date
-   merchant/person
-   amount
-   transaction type
-   category
-   raw text

### `genericParser.js`

This is the fallback parser.

If a provider does not yet have its own dedicated parser, the generic
parser attempts to extract useful transaction information.

This means unsupported providers do not automatically make the entire
application fail.

### `normalizer.js`

Different parsers may produce information in slightly different ways.

The normalizer converts them into the same structure.

The common structure is conceptually:

``` text
date
merchant
amount
type
category
rawText
```

### `index.js`

This is the central entry point.

It connects the other modules.

``` text
Statement Text
      ↓
index.js
      ↓
detector
      ↓
selected parser
      ↓
normalizer
      ↓
final transactions
```

------------------------------------------------------------------------

## 4. Why modularization matters

Instead of writing one very large parser, each part has one
responsibility.

This makes the project:

-   easier to understand
-   easier to test
-   easier to debug
-   easier to extend
-   easier to maintain

If Google Pay support is improved later, we should be able to add a
Google Pay parser without rewriting the whole system.

------------------------------------------------------------------------

## 5. Provider testing idea

Provider detection should be tested separately from transaction
extraction.

For example:

``` text
PhonePe statement
     ↓
PHONEPE
```

and:

``` text
Google Pay statement
     ↓
GOOGLE_PAY
```

However, Day 1 did **not** create full dedicated parsers for every
provider.

The current architecture supports detection for several providers, while
PhonePe has the dedicated parser and the generic parser acts as a
fallback for other formats.

This distinction is important.

We should say:

> "The architecture is prepared for multiple providers, but dedicated
> provider-specific parsers are not yet implemented for every provider."

------------------------------------------------------------------------

## 6. Example transaction flow

Example:

**Input**

``` text
12/09/2026 Paid to Swiggy ₹450
```

The system conceptually performs:

``` text
Detect provider
      ↓
PhonePe parser
      ↓
Date → 12/09/2026
Merchant → Swiggy
Amount → 450
Type → DEBIT
      ↓
Normalizer
      ↓
Structured transaction
```

The transaction can then be used by the rest of SnapSave.

------------------------------------------------------------------------

## 7. Validation and invalid data

An important part of parsing is rejecting bad data.

For example:

**31/02/2026**

is not a valid date because February does not have 31 days.

The expected parser behavior is to reject that transaction.

This means:

> Invalid input + expected rejection = PASS

A test passing does **not** mean the input was valid.

It means:

> "The program behaved as expected."

This became an important testing principle for Day 2.

------------------------------------------------------------------------

## 8. My understanding / my point

My main understanding from Day 1 is:

> **A parser is not just reading text. It is converting different
> real-world statement formats into one standard structure that the
> application can understand.**

Another important point is modularization.

The parser is already divided into:

``` text
Detector
Parser
Normalizer
Central Interface
```

This means the design is suitable for future extraction into a reusable
library.

### Future library idea

A possible future package could be something like:

`SnapUPI Parser`

with modules for:

``` text
detector
phonepe parser
google pay parser
paytm parser
bhim parser
amazon pay parser
generic parser
normalizer
tests
```

The current project should be described as:

> "Modularized and designed so it can later be extracted into a reusable
> library."

It should not be described as a published NPM library yet.

------------------------------------------------------------------------

## 9. Testing concept

The main things to validate are:

1.  Provider detection
2.  PhonePe extraction
3.  Generic fallback
4.  Normalization
5.  Central parser flow
6.  Invalid input handling

Each test should have a simple reasoning structure:

``` text
Input
 ↓
Expected result
 ↓
Actual result
 ↓
Reason
 ↓
PASS / FAIL
```

------------------------------------------------------------------------

## 10. Git and GitHub work

The work was developed on:

`feature/universal-parser`

After implementation and testing:

``` text
Feature branch
     ↓
Commit
     ↓
Push to GitHub
     ↓
Pull Request #1
     ↓
Review
     ↓
Merge into develop
```

The main commit was:

`440c5df feat: add universal UPI statement parser`

------------------------------------------------------------------------

## 11. Day 1 result

At the end of Day 1, SnapSave had the basic Universal UPI Parser
architecture.

The most important result was not "all UPI providers are fully
supported."

The real result was:

> **A modular foundation was created so provider-specific parsers and a
> common normalized transaction structure can be added without changing
> the whole application.**

### What I should be able to explain

> "Day 1 created the universal parser foundation. The detector
> identifies the provider, the appropriate parser extracts transaction
> data, the normalizer creates a common structure, and the central
> parser connects the complete flow."
