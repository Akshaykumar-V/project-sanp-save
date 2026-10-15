# SnapSave V1 --- Day 2 Notes

## Parser Testing and Automated Validation

**Date:** 19/09/2026\
**Day:** 2\
**Work duration:** Approximately 3--4 hours\
**Branch:** parser testing work\
**Commits:**\
- `0f59c79 chore: configure Jest for parser tests` -
`5a08326 test: add UPI parser test coverage` **PR:** #2 → merged into
`develop`

------------------------------------------------------------------------

## 1. Objective

Day 2 focused on answering an important question:

> **How do we know the parser created on Day 1 actually works
> correctly?**

The solution was to introduce automated tests using **Jest**.

The goal was not just to test one successful transaction.

We wanted to test:

-   correct provider detection
-   correct PhonePe parsing
-   generic fallback behavior
-   central parser integration
-   invalid inputs
-   edge cases

------------------------------------------------------------------------

## 2. Why automated testing?

If the parser is changed later, one small change could break another
provider or transaction type.

Manually checking PDFs every time would be slow and unreliable.

Automated tests allow us to run the same checks again whenever the
parser changes.

The basic idea is:

``` text
Code change
    ↓
Run tests
    ↓
Expected behavior?
    ↓
PASS / FAIL
```

------------------------------------------------------------------------

## 3. Jest setup

Jest was configured at the project root.

The project test command was configured to run Jest in a controlled way.

The purpose of the test setup was to allow one command to execute all
parser tests.

This created a repeatable validation process.

------------------------------------------------------------------------

# 4. Test file structure

Four parser test files were created.

``` text
backend/tests/parsers/
│
├── detector.test.js
├── phonepeParser.test.js
├── genericParser.test.js
└── index.test.js
```

There were:

-   7 detector tests
-   5 PhonePe parser tests
-   5 generic parser tests
-   4 central parser tests

Total:

**21 tests**

------------------------------------------------------------------------

# 5. `detector.test.js`

This file tests the provider detection responsibility.

The detector receives statement text and tries to identify its provider.

Examples of expected behavior:

``` text
PhonePe statement → PHONEPE
Google Pay statement → GOOGLE_PAY
Paytm statement → PAYTM
BHIM statement → BHIM
Amazon Pay statement → AMAZON_PAY
Unknown statement → UNKNOWN
```

### Why test this separately?

Because provider detection is the first decision in the parsing
pipeline.

If the provider is detected incorrectly, the wrong parser may be
selected.

So:

> "This test checks whether the system can correctly identify where the
> statement came from before parsing the transaction."

------------------------------------------------------------------------

# 6. `phonepeParser.test.js`

This file tests the dedicated PhonePe parser.

It checks whether the parser can extract information from PhonePe-style
transaction text.

Important information includes:

-   date
-   merchant/person
-   amount
-   debit/credit type
-   category
-   raw information

Example:

``` text
Paid to Swiggy ₹450
```

Expected interpretation:

``` text
Merchant → Swiggy
Amount → ₹450
Type → DEBIT
```

The tests also cover invalid or incomplete input.

### Why?

Because a parser must not only work for perfect input.

Real statement data can contain unexpected or incomplete text.

------------------------------------------------------------------------

# 7. `genericParser.test.js`

This file tests the fallback parser.

Not every provider has a dedicated parser yet.

Therefore, the generic parser tries to extract basic transaction
information from a more general statement format.

Example:

``` text
Paid to Amazon ₹999
```

can be interpreted as:

``` text
Amazon
₹999
DEBIT
```

### Why test the fallback?

Because unsupported or partially supported providers should still have a
chance to produce useful transaction data.

The generic parser provides a safer fallback instead of immediately
failing.

------------------------------------------------------------------------

# 8. `index.test.js`

This tests the complete parser flow.

The central parser is responsible for connecting:

``` text
Input text
 ↓
Provider detector
 ↓
Selected parser
 ↓
Normalizer
 ↓
Final transactions
```

Testing only individual functions is not enough.

Each component could work independently while the overall connection
between them could still be wrong.

Therefore this file tests the complete pipeline.

------------------------------------------------------------------------

# 9. Important concept --- PASS does not always mean valid input

This was one of the most important things I learned.

Suppose the input contains:

> 31/02/2026

This date is invalid.

If the expected behavior is:

> reject the transaction

and the parser actually rejects it, then:

**PASS ✅**

Why?

Because the test checks the **expected behavior**, not whether the input
itself is valid.

So:

``` text
Invalid input
     ↓
Expected rejection
     ↓
Actual rejection
     ↓
PASS
```

This is important when explaining testing to the coordinator.

------------------------------------------------------------------------

# 10. Test reasoning

For each test, I should understand:

### Input

What data did we give the function?

### Expected

What result did we expect?

### Actual

What did the function actually return?

### Reason

Why is that result correct?

### Result

PASS or FAIL?

This makes testing more meaningful than simply saying:

> "All tests passed."

------------------------------------------------------------------------

# 11. Final test result

Day 2 finished with:

**4 test suites**\
**21 tests**\
**All passed**

This gave the parser a repeatable automated validation system.

------------------------------------------------------------------------

# 12. My understanding / my point

My main understanding from Day 2 is:

> **Testing is not just checking whether the program works with correct
> input. It also checks whether the program behaves correctly when the
> input is wrong, missing or unusual.**

I also understood why we use separate test files.

Because the parser is modular:

``` text
Detector
PhonePe parser
Generic parser
Central parser
```

each responsibility can be tested independently.

Then the central parser test checks whether they work together.

------------------------------------------------------------------------

# 13. Git and GitHub

The Jest configuration was committed first:

`0f59c79 chore: configure Jest for parser tests`

Then parser test coverage was added:

`5a08326 test: add UPI parser test coverage`

The work was pushed and submitted through PR #2.

After review, it was merged into `develop`.

------------------------------------------------------------------------

## 14. Day 2 result

The main result was:

> **SnapSave's parser was no longer only manually tested. It now had
> automated tests covering provider detection, PhonePe parsing, generic
> fallback parsing and the complete parser flow.**

### What I should be able to explain

> "Day 2 introduced Jest-based automated testing. We created separate
> tests for provider detection, PhonePe parsing, generic parsing and the
> complete parser pipeline. We had 21 tests passing, including valid and
> invalid cases."
