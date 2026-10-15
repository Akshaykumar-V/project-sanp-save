# SnapSave V1 --- Daily Development Notes

## Days 1--8

These notes document the real development work completed during the
first eight days of SnapSave V1.

The notes are written to explain not only **what was implemented**, but
also:

-   why it was implemented
-   how the architecture works
-   what was tested
-   what problems were found
-   what was learned
-   my own understanding/point from each day
-   how the work connects to the next day
-   Git/GitHub workflow

## Roadmap

  Day     Main Work
  ------- ---------------------------------------------
  Day 1   Universal UPI Parser Foundation
  Day 2   Parser Testing and Automated Validation
  Day 3   Smart Categorization Foundation
  Day 4   Real Transaction Integration
  Day 5   Transaction Intelligence / Entity Knowledge
  Day 6   Personal Spending Intelligence
  Day 7   Financial Insight Foundation
  Day 8   AI Prompt & Recommendation Foundation

## Overall V1 progression

``` text
UPI PDF
   ↓
Universal Parser
   ↓
Automated Validation
   ↓
Smart Categorization
   ↓
Real Upload Integration
   ↓
Entity Intelligence
   ↓
Spending Intelligence
   ↓
Financial Insights
   ↓
Financial Context
   ↓
AI Prompt
   ↓
Structured AI Recommendations
```

## Important project principle

SnapSave should not automatically label a transaction as "waste" based
on one payment.

The intended approach is:

``` text
Transaction
   ↓
Understand entity
   ↓
Build personal spending history
   ↓
Detect patterns
   ↓
Compare with user's own history
   ↓
Generate evidence-based insight
   ↓
Use AI to explain/recommend
```

Unknown does not mean unnecessary.

Known does not automatically mean good.

The system should use evidence and the user's own history before making
stronger observations.
