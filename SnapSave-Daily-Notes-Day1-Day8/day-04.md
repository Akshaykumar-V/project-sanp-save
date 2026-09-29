# SnapSave V1 --- Day 4 Notes

## Smart Categorization --- Real Transaction Integration

**Date:** 21/09/2026\
**Day:** 4\
**Work duration:** Approximately 3--4 hours\
**Branch:** `feature/categorization-integration`\
**Commit:** `6b66d73 refactor: route uploads through universal parser`\
**PR:** merged into `develop`

------------------------------------------------------------------------

## 1. Objective

Day 4 was about connecting the work from Days 1--3 to the **real PDF
upload flow**.

The parser and categorization system existed, but the actual upload
controller was still using an older PhonePe-specific parsing function.

The goal was to make the actual application use the new universal
parser.

------------------------------------------------------------------------

# 2. The problem before Day 4

There were effectively two parsing paths.

### Old upload flow

``` text
PDF
 ↓
uploadController
 ↓
Old PhonePe parser
 ↓
Categorization
 ↓
MongoDB
```

### New parser architecture

``` text
PDF text
 ↓
Universal parser
 ↓
Provider detection
 ↓
PhonePe / Generic parser
 ↓
Normalizer
 ↓
Categorization
 ↓
MongoDB
```

The problem was that the real upload process was not yet using the new
universal architecture.

------------------------------------------------------------------------

# 3. The target architecture

Day 4 connected everything:

``` text
UPI PDF
    ↓
PDF text extraction
    ↓
Universal Parser
    ↓
Provider Detection
    ↓
Provider Parser / Generic Parser
    ↓
Normalization
    ↓
Categorization
    ↓
MongoDB
```

This is the first point where the parser architecture became part of the
actual upload pipeline.

------------------------------------------------------------------------

# 4. Upload controller responsibility

The upload controller still handles things such as:

-   receiving the uploaded PDF
-   validating the file
-   extracting PDF text
-   calling the parser
-   checking whether transactions were found
-   attaching the authenticated user
-   saving transactions
-   returning API responses

But it no longer needs to contain all of the detailed PhonePe parsing
rules.

This makes the controller cleaner.

------------------------------------------------------------------------

# 5. Removing the old PhonePe parser

The old `parsePhonePeTransactions()` function inside the upload
controller was removed.

This was important because keeping both systems would create unnecessary
duplication.

The new flow uses:

> `parseUPIStatement()`

The universal parser decides which parsing logic to use.

------------------------------------------------------------------------

# 6. Provider information

The universal parser returns:

-   detected provider
-   parsed transactions

If no transactions are found, the API can report that no transactions
were found and also show the detected provider.

This helps when debugging unsupported or unexpected statement formats.

------------------------------------------------------------------------

# 7. Why this architecture is better

The controller does not need to know how every UPI provider formats its
statement.

Instead:

``` text
Controller
    ↓
Universal parser
    ↓
Provider-specific logic
```

If another provider parser is added later, the upload controller should
not need a major rewrite.

This is one of the main benefits of modular architecture.

------------------------------------------------------------------------

# 8. Example real flow

Suppose the user uploads a PhonePe PDF.

The flow is:

``` text
PhonePe PDF
    ↓
Extract text
    ↓
Detect PHONEPE
    ↓
PhonePe parser
    ↓
Extract transactions
    ↓
Normalize
    ↓
Categorize
    ↓
Save to MongoDB
```

If the provider does not have a dedicated parser, the generic fallback
can be used where appropriate.

------------------------------------------------------------------------

# 9. Preserving existing upload behavior

The integration did not remove the existing upload responsibilities.

The following behavior remained:

-   PDF validation
-   file size restriction
-   text extraction
-   authenticated user ID
-   MongoDB insertion
-   API responses

The major change was the source of the parsed transactions.

Before:

> old parser inside controller

After:

> universal parser architecture

------------------------------------------------------------------------

# 10. Testing

After integration, the automated test suite was run again.

Result:

**5 test suites**\
**31 tests**\
**All passed**

This was important because refactoring an upload path can easily break
existing behavior.

The tests helped confirm that the parser and categorization components
still worked after integration.

------------------------------------------------------------------------

# 11. My understanding / my point

My main point from Day 4 is:

> **Building a feature and actually integrating it into the application
> are two different things.**

Days 1--3 created the parser, tests and categorization.

Day 4 connected those components to the real upload process.

So:

``` text
Build
 ↓
Test
 ↓
Integrate
 ↓
Test again
```

This is a useful software development cycle.

------------------------------------------------------------------------

# 12. Architecture learning

Day 4 also reinforced separation of responsibilities.

``` text
Upload Controller
→ file/upload responsibility

Parser
→ statement interpretation

Normalizer
→ common structure

Categorizer
→ category decision

Database
→ storage
```

Each component has a clearer role.

------------------------------------------------------------------------

# 13. Git and GitHub

The feature branch was:

`feature/categorization-integration`

The main commit was:

`6b66d73 refactor: route uploads through universal parser`

The branch was pushed to GitHub.

A Pull Request was created and merged into `develop`.

------------------------------------------------------------------------

## 14. Day 4 result

The main result was:

> **The real PDF upload flow was moved from the old PhonePe-specific
> parser to the universal parser architecture, connecting provider
> detection, parsing, normalization and categorization to the actual
> application.**

### What I should be able to explain

> "Day 4 integrated the universal parser into the real upload flow.
> Earlier the upload controller had an old PhonePe parser. I replaced
> that with the universal parser so the application can detect the
> provider, parse and normalize transactions, categorize them and then
> save them to MongoDB. The existing upload behavior was preserved and
> all 31 tests were passing."
