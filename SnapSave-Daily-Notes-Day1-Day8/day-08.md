# SnapSave V1 --- Day 8 Notes

## AI Prompt and Recommendation Foundation

**Date:** 28/09/2026\
**Day:** 8\
**Work duration:** Approximately 3--4 hours\
**Branch:** `feature/ai-recommendation-engine`\
**Commits:**\
- `feat: add AI financial prompt builder` -
`feat: define structured AI recommendation output` **PR:** merged into
`develop`

------------------------------------------------------------------------

## 1. Objective

Day 8 started preparing SnapSave for the actual **AI financial
recommendation layer**.

By Day 7, the application could create structured financial context.

Day 8 asks:

> **How should we give that information to an AI model?**

The important point is:

> **Day 8 did not yet connect Groq, Llama or another external AI API.**

It created the prompt and output structure needed for that future
integration.

------------------------------------------------------------------------

# 2. Overall flow

The architecture became:

``` text
Transactions
     ↓
Spending Profile
     ↓
Spending Patterns
     ↓
Comparisons
     ↓
Financial Insights
     ↓
Financial Context
     ↓
AI Prompt Builder
     ↓
Future AI Model
     ↓
Structured Recommendations
```

------------------------------------------------------------------------

# 3. What is a prompt?

A prompt is the instruction and information provided to an AI model.

Instead of simply saying:

> "Analyze my spending."

SnapSave can provide clear instructions about:

-   what information the AI can use
-   what assumptions it should avoid
-   what format it should return
-   how recommendations should be written

This makes the AI behavior more controlled.

------------------------------------------------------------------------

# 4. `aiPromptService.js`

A new service called:

`aiPromptService.js`

was created.

Its job is to build the AI request structure.

It produces two main parts:

### System prompt

Contains rules and behavior instructions.

### User prompt

Contains the structured financial context.

Conceptually:

``` text
Financial Context
       ↓
AI Prompt Builder
       ↓
System Instructions + Financial Data
       ↓
Future AI Model
```

------------------------------------------------------------------------

# 5. Important AI rules

The system prompt tells the future AI to:

### Use only supplied financial information

The AI should not invent numbers or facts.

### Do not assume why a transaction happened

For example:

``` text
Zomato → ₹500
```

does not tell us why the user made that payment.

The AI should not invent a reason.

### Do not automatically call a transaction wasteful

The AI should describe observations based on evidence.

### Give practical recommendations

Recommendations should be realistic and connected to the user's own
spending history.

------------------------------------------------------------------------

# 6. Why these rules matter

AI can sometimes generate plausible-sounding information that is not
actually present in the data.

For a financial application, this is especially dangerous.

Therefore:

``` text
Financial Data
      ↓
Evidence
      ↓
AI
      ↓
Recommendation
```

The AI should not create evidence that does not exist.

------------------------------------------------------------------------

# 7. Structured recommendation output

Day 8 also defined a structured recommendation format.

Instead of returning completely free-form text, the future AI should
return a JSON array.

Each recommendation should contain:

-   type
-   title
-   message
-   evidence
-   action

Conceptually:

``` text
Recommendation
 ├── Type
 ├── Title
 ├── Message
 ├── Evidence
 └── Action
```

------------------------------------------------------------------------

# 8. Why structured output?

Suppose an AI says:

> "Your spending at Amruth Tea increased. You may want to review it."

The frontend would have to understand which part is the title, evidence
and action.

With structured output, the application already knows where each piece
belongs.

For example:

``` text
Title
→ Spending increase detected

Evidence
→ Previous ₹300, current ₹700

Action
→ Review recent spending
```

The frontend can then display these fields separately.

------------------------------------------------------------------------

# 9. What financial context is given to AI?

The AI prompt builder can receive:

### Profile

-   total spent
-   average expense
-   largest expense
-   counts

### Patterns

-   repeated entities
-   small payments
-   category patterns

### Comparisons

-   previous spending
-   current spending
-   amount change
-   percentage change

### Insights

-   new spending
-   spending increase
-   repeated spending
-   small-payment pattern

The AI therefore receives structured analysis instead of having to
understand an entire raw PDF.

------------------------------------------------------------------------

# 10. Why not directly send the PDF to AI?

SnapSave already has a parser and financial analysis layer.

So the architecture is:

``` text
PDF
 ↓
Parser
 ↓
Structured transactions
 ↓
Financial analysis
 ↓
Financial context
 ↓
AI
```

This gives the AI cleaner and more controlled information.

It also separates responsibilities:

> Parser understands the statement.

> Financial services analyze the data.

> AI explains the patterns and provides recommendations.

------------------------------------------------------------------------

# 11. Testing

The AI prompt builder had five tests.

### Test 1 --- Basic financial context

Checks whether the prompt correctly includes structured financial
information.

### Test 2 --- Financial insights

Checks whether insights such as spending increases are included.

### Test 3 --- Empty context

Checks that the prompt still works when financial data is empty.

### Test 4 --- No invented information

Checks that the system instructions explicitly tell the AI not to invent
missing financial information and not to label transactions wasteful
without sufficient evidence.

### Test 5 --- Structured recommendation format

Checks that the prompt instructs the AI to return a JSON array
containing:

-   type
-   title
-   message
-   evidence
-   action

------------------------------------------------------------------------

# 12. Test result

At the end of Day 8:

**13 test suites**\
**79 tests**

were passing.

The feature branch was:

`feature/ai-recommendation-engine`

The changes were pushed and merged into `develop`.

------------------------------------------------------------------------

# 13. What Day 8 did NOT complete

This should be clearly mentioned in the notes.

Day 8 did **not** yet implement:

-   Groq API integration
-   Llama API integration
-   live AI calls
-   chatbot functionality
-   final AI-generated recommendations from a real model

The work created the foundation for that next stage.

------------------------------------------------------------------------

# 14. My understanding / my point

My main understanding from Day 8 is:

> **We should not simply give raw financial data to an AI and ask it to
> make random recommendations. We first prepare structured financial
> context and then give the AI clear rules about what it can and cannot
> say.**

The important design principle is:

``` text
Evidence
   ↓
Structured Context
   ↓
AI
   ↓
Recommendation
```

Another important point:

> **AI should explain patterns, not invent reasons behind
> transactions.**

------------------------------------------------------------------------

# 15. Complete Days 1--8 progression

The whole V1 foundation now looks like:

``` text
DAY 1
Universal Parser
       ↓
DAY 2
Automated Testing
       ↓
DAY 3
Smart Categorization
       ↓
DAY 4
Real Upload Integration
       ↓
DAY 5
Entity Intelligence
       ↓
DAY 6
Spending Intelligence
       ↓
DAY 7
Financial Insights
       ↓
DAY 8
AI Prompt + Recommendation Structure
```

Or as one technical pipeline:

``` text
UPI PDF
   ↓
PDF Text Extraction
   ↓
Provider Detection
   ↓
Provider Parser / Generic Parser
   ↓
Normalization
   ↓
Categorization
   ↓
Entity Identification
   ↓
Transaction Storage
   ↓
Spending Profile
   ↓
Pattern Detection
   ↓
Spending Comparison
   ↓
Financial Insights
   ↓
Financial Context
   ↓
AI Prompt
   ↓
Future AI Model
   ↓
Structured Recommendation
```

------------------------------------------------------------------------

# 16. Day 8 result

The main result was:

> **SnapSave now has an AI-ready financial analysis pipeline. The system
> first processes and analyzes financial data, then prepares controlled
> structured context for an AI recommendation layer.**

### What I should be able to explain

> "Day 8 focused on the AI foundation. I created an AI prompt builder
> that takes the financial context from the previous stages and gives
> the future AI clear instructions to use only the supplied data, avoid
> inventing transaction reasons, and avoid unsupported waste judgments.
> I also defined a structured recommendation format with type, title,
> message, evidence and action. After the changes, 13 test suites with
> 79 tests were passing."
