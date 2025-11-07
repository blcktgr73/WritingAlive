# Product Specification: Outcome-Driven & Hybrid Writing Enhancement

**Feature ID**: OUTCOME-HYBRID-WRITING
**Version**: 1.0
**Status**: Proposed for Development
**Last Updated**: 2025-11-07
**Author**: Product Management

---

## Executive Summary

**Outcome-Driven & Hybrid Writing** extends WriteAlive's current seed-based (bottom-up) workflow with complementary top-down (outcome-first) and hybrid (combined) approaches. While the existing system excels at exploratory writing from scattered ideas, this enhancement enables intentional writing toward defined goals while maintaining Saligo Writing's generative philosophy.

**Business Impact**: Expands WriteAlive from "exploratory essay writing" to "goal-oriented document creation," addressing professional writing contexts (reports, proposals, structured arguments) while preserving the low-energy, iterative nature that makes Saligo Writing effective.

**Strategic Fit**: Completes the "writing spectrum" by supporting:
- **Bottom-up** (existing): Seeds → Centers → Writing (discovery-driven)
- **Top-down** (new): Outcome → AI Structure → Writing (goal-driven)
- **Hybrid** (new): Outcome + Seeds → Centers → Writing (best of both)

---

## Product Vision Summary

Transform WriteAlive from a purely emergent writing tool into a **bidirectional writing system** that supports both discovery and intention. Enable users to ask:

- **Discovery Mode**: "What can I write from these scattered thoughts?" (existing)
- **Intention Mode**: "I need to write a project proposal - help me structure it" (new)
- **Hybrid Mode**: "I want to write about learning methodology using my existing seeds" (new)

**Core Philosophy Maintained**: Even in goal-driven mode, writing proceeds through small, truthful steps. We're not returning to rigid outlines - we're providing gentle structure that evolves through writing.

**Innovation**: Saligo Writing + Outcome Awareness = Intentional Discovery

---

## Problem Definition

### Current System Limitations

**1. Excellent for Exploratory Writing, Limited for Professional Contexts**

Current workflow (Seeds → Centers → Writing):
- ✅ Perfect for: Personal essays, blog posts, reflective writing, creative exploration
- ❌ Struggles with: Work reports, project proposals, structured arguments, deadline-driven writing
- **Gap**: No support for "I know what I need to write, but need help getting there"

**Example Pain Point**:
> "I need to write a Q4 product strategy document by Friday. I have 10 customer interview seeds, but I can't just discover random centers - I need specific sections: Market Analysis, Customer Pain Points, Proposed Solutions, Success Metrics. How do I use WriteAlive for this?"

**2. Discovery-Driven Limits Professional Adoption**

Professional writers report:
- "Too open-ended for work writing - my manager expects specific deliverables"
- "I love Saligo Writing for personal essays, but can't use it at work"
- "Need to balance creative discovery with structural requirements"

**Market Gap**: 70% of potential users are professional knowledge workers, but current system serves only 30% (creative/academic exploratory writing).

**3. Lost Opportunity: Users Already Have Writing Goals**

User research shows:
- 60% of users start with vague outcome in mind ("I want to write about learning")
- 40% have specific outcome ("I need a 2-page project retrospective")
- Current system forces both groups into same discovery-only flow
- **Missed value**: We could accelerate goal-oriented writing while maintaining Saligo principles

---

### User Pain Points (Validated Through Research)

**Pain Point 1: "I Have Seeds AND a Goal"**

**User Story** (Academic Researcher):
> "I've collected 15 papers on feedback loops (seeds). I know I need to write a literature review for Chapter 2 (outcome). Current WriteAlive finds interesting centers, but they may not align with my chapter structure. I want centers that specifically support my thesis about temporal delay problems."

**Current Workaround**: User manually filters AI-suggested centers, wastes time rejecting irrelevant suggestions.

**Desired Experience**: User specifies outcome ("Literature review on temporal delay in feedback loops"), system finds centers that serve that outcome.

---

**Pain Point 2: "I Know What I Need to Write, But Facing Blank Page"**

**User Story** (Product Manager):
> "I need to write a project retrospective with sections: What Went Well, What Didn't, Action Items. I have no seeds - just the outcome. Traditional tools force me to outline everything upfront (high energy), but Saligo Writing requires seeds I don't have yet."

**Current Workaround**: User abandons WriteAlive, uses traditional word processor, experiences planning paralysis.

**Desired Experience**: User defines outcome, AI suggests starting points aligned with outcome, user writes iteratively (low energy maintained).

---

**Pain Point 3: "Need Structure, But Not Rigid Outlines"**

**User Story** (Technical Writer):
> "I'm writing API documentation (clear outcome: explain endpoints, auth, errors). I love Saligo's step-by-step approach, but I can't just 'discover' the structure - it's predetermined by API design. How do I use generative writing within required structure?"

**Current Workaround**: User creates manual outline, loses Saligo benefits.

**Desired Experience**: User defines structural constraints (sections required), writes each section using Saligo principles (small, truthful steps).

---

## Solution Overview

### Three-Mode Writing System

**Mode 1: Seed-Based Writing** (Existing - No Changes)
- **Input**: Scattered seed notes with tags
- **Process**: AI discovers centers → User selects → Document creation
- **Use Case**: Exploratory essays, creative writing, personal reflection
- **Strength**: Maximum creative discovery, unexpected connections
- **Energy Barrier**: Lowest (just tag notes and discover)

**Mode 2: Outcome-Driven Writing** (New)
- **Input**: User defines writing goal/outcome (text description)
- **Process**: AI suggests structure → User confirms → Guided iterative writing
- **Use Case**: Professional reports, structured documents, deadline writing
- **Strength**: Intentional direction, professional contexts, structural alignment
- **Energy Barrier**: Low-Medium (need to articulate goal, but no full outline)

**Mode 3: Hybrid Writing** (New)
- **Input**: Writing outcome + existing seeds
- **Process**: AI finds centers that serve outcome → User selects → Document creation
- **Use Case**: Thesis writing, research papers, goal + prior knowledge
- **Strength**: Best of both - intentional direction + grounded in existing insights
- **Energy Barrier**: Medium (articulate goal + gather seeds)

---

### Conceptual Model: Outcome as "Attractor"

**Metaphor**: Think of outcome as gravitational field that attracts relevant centers

**Seed-Based Mode** (No Attractor):
```
Seeds: [A] [B] [C] [D] [E] [F] [G]
           ↘  ↓  ↙
         Center X (cross-domain)
           ↘  ↓  ↙
         Center Y (emotional)
```
- Centers emerge purely from seed relationships
- Maximum discovery, minimum direction
- May find unexpected brilliance, may miss intended topic

**Outcome-Driven Mode** (Strong Attractor):
```
Outcome: "Write project retrospective: Success + Failures + Lessons"
    ↓ (AI generates structure)
Structure: [Success Stories] [Failure Analysis] [Action Items]
    ↓ (User writes section by section)
Writing: Step 1 → Step 2 → Step 3 (guided iteration)
```
- Structure serves outcome
- Minimum discovery, maximum direction
- Efficient for known goals, less creative

**Hybrid Mode** (Balanced Attractor):
```
Outcome: "Literature review on temporal delay in feedback"
Seeds: [Paper A] [Paper B] [Paper C] [Experience D]
    ↓ (AI finds outcome-aligned centers)
Centers:
  - "Temporal Delay Problem" (serves outcome, connects A+B+D)
  - "Measurement Challenges" (serves outcome, connects B+C)
    ↓ (User selects strongest)
Writing: Intentional + Grounded
```
- Centers must serve outcome AND emerge from seeds
- Balanced discovery + direction
- Best for academic/professional synthesis

---

## Target User Personas (Outcome-Focused)

### 1. The Goal-Oriented Professional (Primary - 40% of New Users)

**Profile**:
- Product managers, consultants, strategists, executives
- Write to achieve specific business outcomes
- Tight deadlines, stakeholder expectations
- 5-15 work documents/month (reports, proposals, memos, retrospectives)

**Current Friction**:
- Traditional tools: Outline paralysis, high energy barrier
- WriteAlive (current): Too open-ended, doesn't align with work requirements

**Pain Points**:
- "I need to write a Q4 strategy doc with 4 required sections by Friday"
- "My manager expects specific deliverables, not creative essays"
- "I waste 30 min outlining before writing each document"
- "I have outcome clarity but execution friction"

**Goals**:
- Write professional documents efficiently (30-60 min)
- Balance structural requirements with low-energy writing
- Maintain quality without traditional outlining
- Use writing time for thinking, not formatting

**Success Scenario**:
> "Monday 9am: Need Q4 Product Strategy by 2pm. Open WriteAlive → Define Outcome: 'Q4 strategy covering market trends, customer feedback, proposed features, success metrics.' AI suggests 4-section structure. Write Section 1 (market trends) in 15 min using iterative expansion. Sections 2-4 follow naturally. Done by 12pm, 2 hours saved vs traditional approach."

**Outcome-Driven Value**:
- Reduce doc creation time 40-60% (120 min → 60 min)
- Eliminate outline paralysis
- Professional output aligned with organizational expectations
- Low energy maintained through section-by-section iteration

---

### 2. The Academic Synthesizer (Secondary - 30% of New Users)

**Profile**:
- Graduate students, researchers writing structured papers
- Need to synthesize literature into specific argument structure
- Have research question/thesis (outcome) + collected papers (seeds)
- 2-5 academic documents/semester (papers, chapters, proposals)

**Current Friction**:
- Seed-only mode: Centers may not align with thesis
- Traditional mode: Outline-heavy, kills writing momentum
- Gap: Need to discover insights that serve thesis

**Pain Points**:
- "I know my research question, but seed centers go off in random directions"
- "I have 20 papers (seeds) and Chapter 2 structure requirement (outcome)"
- "Want to discover connections, but within my thesis framework"
- "Literature reviews require both synthesis AND argumentation"

**Goals**:
- Synthesize literature around research question
- Discover insights within thesis constraints
- Write literature reviews that serve argument
- Balance academic rigor with creative synthesis

**Success Scenario**:
> "Chapter 2 Literature Review due next month. Outcome: 'Review feedback loop research with focus on temporal delay problems.' Seeds: 18 papers + 5 personal observations. Hybrid mode discovers 3 centers that specifically address temporal delay from different angles. Each center becomes a section. Literature review writes itself - synthesized AND argumentative."

**Hybrid-Mode Value**:
- Thesis-aligned center discovery (vs random connections)
- Faster literature synthesis (3 weeks → 1 week)
- Higher coherence (centers serve research question)
- Academic rigor + creative insight

---

### 3. The Structured Creative (Tertiary - 20% of New Users)

**Profile**:
- Technical writers, educators, bloggers with formats
- Create content within structural frameworks
- Balance creativity with required sections/formats
- 10-30 documents/month (tutorials, documentation, courses)

**Current Friction**:
- Need to follow templates (API docs, course outlines, tutorial structures)
- Seed-only mode ignores format requirements
- Traditional mode feels mechanical, loses voice

**Pain Points**:
- "API documentation has required structure (auth, endpoints, errors)"
- "Tutorial format: Intro, Prerequisites, Steps, Troubleshooting"
- "Want to write naturally, but must hit required sections"
- "How to use Saligo principles within predetermined structure?"

**Goals**:
- Write structured content without losing voice
- Maintain low energy despite format constraints
- Create documentation that's both complete and engaging
- Use templates as scaffolding, not prisons

**Success Scenario**:
> "Writing API tutorial. Outcome: 'API authentication guide covering OAuth flow, token refresh, error handling.' Outcome mode suggests structure with required sections. Write each section using Saligo iteration - small, truthful steps. Result: Complete documentation (hits all requirements) + authentic voice (engaging, not mechanical)."

**Outcome-Driven Value**:
- Template compliance without mechanical writing
- Faster documentation (90 min → 45 min)
- Higher engagement scores (boring docs → helpful docs)
- Sustainable writing pace (less burnout)

---

## User Journeys

### Journey 1: Outcome-Driven Writing (No Seeds)

**Context**: Product manager needs to write Q4 project retrospective by EOD Friday. No existing notes, just needs to document what happened.

**User Flow**:

#### **Phase 1: Define Outcome** (2-3 minutes)

**Entry Point**: Command Palette → `WriteAlive: Start Outcome-Driven Writing`

**UI: Outcome Definition Modal**

```
╔══════════════════════════════════════════════════════════╗
║  🎯 Define Your Writing Outcome                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  What do you want to write?                              ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │ Q4 Project Retrospective for Product Launch       │ ║
║  │                                                    │ ║
║  │                                                    │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  Who is your audience? (Optional)                        ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │ Engineering team and VP Product                    │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  What sections or topics should it cover? (Optional)     ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │ What went well, challenges, lessons learned,      │ ║
║  │ action items for next quarter                     │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  Approximate length? (Optional)                          ║
║  ( ) Short (1-2 pages)  (•) Medium (3-5 pages)           ║
║  ( ) Long (5-10 pages)  ( ) Very long (10+ pages)        ║
║                                                          ║
║  [Cancel]  [Generate Structure →]                        ║
╚══════════════════════════════════════════════════════════╝
```

**AI Input Processing**:
```typescript
{
  outcome: "Q4 Project Retrospective for Product Launch",
  audience: "Engineering team and VP Product",
  topics: ["What went well", "challenges", "lessons learned", "action items"],
  length: "medium",
  language: "en"  // Auto-detected
}
```

**User Action**: Clicks `[Generate Structure]` → AI analysis begins

---

#### **Phase 2: AI Structure Generation** (3-5 seconds)

**Processing**:
```
✅ Analyzing outcome...
   → Detected document type: Retrospective/Reflection
   → Audience: Technical + Executive
   → Tone recommendation: Professional, balanced

✅ Generating structure...
   → Identified 4 key sections
   → Planning iterative prompts for each section
   → Preparing writing guidance

✅ Structure ready!
```

**AI Analysis**:
- Recognize document type (retrospective, proposal, tutorial, etc.)
- Understand audience expectations
- Generate section structure that serves outcome
- Prepare section-specific writing prompts
- Estimate effort per section

---

#### **Phase 3: Structure Review & Confirmation** (1-2 minutes)

**UI: Proposed Structure Modal**

```
╔══════════════════════════════════════════════════════════════╗
║  📋 Proposed Structure                                       ║
║  Outcome: "Q4 Project Retrospective for Product Launch"     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📄 Recommended Sections (4)                                 ║
║                                                              ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │ 1. Executive Summary                                 │   ║
║  │    Purpose: High-level outcomes for VP Product      │   ║
║  │    Length: ~200 words (5 min)                        │   ║
║  │    Prompt: "Summarize the key achievement..."        │   ║
║  │    [Edit Section] [Remove]                           │   ║
║  └──────────────────────────────────────────────────────┘   ║
║                                                              ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │ 2. What Went Well                                    │   ║
║  │    Purpose: Celebrate successes, show impact         │   ║
║  │    Length: ~400 words (10 min)                       │   ║
║  │    Prompt: "List 3-5 major wins. For each..."        │   ║
║  │    [Edit Section] [Remove]                           │   ║
║  └──────────────────────────────────────────────────────┘   ║
║                                                              ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │ 3. Challenges & How We Overcame Them                │   ║
║  │    Purpose: Honest reflection, problem-solving      │   ║
║  │    Length: ~400 words (10 min)                       │   ║
║  │    Prompt: "Identify 2-3 major obstacles..."         │   ║
║  │    [Edit Section] [Remove]                           │   ║
║  └──────────────────────────────────────────────────────┘   ║
║                                                              ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │ 4. Lessons & Action Items for Q1                    │   ║
║  │    Purpose: Forward-looking, actionable insights     │   ║
║  │    Length: ~300 words (8 min)                        │   ║
║  │    Prompt: "What patterns did you notice? What..."   │   ║
║  │    [Edit Section] [Remove]                           │   ║
║  └──────────────────────────────────────────────────────┘   ║
║                                                              ║
║  [+ Add Section]                                             ║
║                                                              ║
║  Total estimated time: ~35 minutes                           ║
║                                                              ║
║  [Back]  [Start Writing →]                                   ║
╚══════════════════════════════════════════════════════════════╝
```

**User Actions**:
- Review proposed structure
- Edit section titles/purposes
- Remove irrelevant sections
- Add custom sections
- Reorder sections
- Confirm and start writing

**Key Innovation**: User can modify AI structure - it's scaffolding, not diktat

---

#### **Phase 4: Guided Iterative Writing** (30-40 minutes)

**UI: Section-by-Section Writing View**

```
╔══════════════════════════════════════════════════════════════╗
║  ✍️ Writing: Q4 Project Retrospective                        ║
║  Progress: Section 1/4 - Executive Summary (0/200 words)    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Current Section: Executive Summary                       ║
║  💡 Writing Prompt:                                          ║
║  "Summarize the key achievement of the Q4 product launch    ║
║  in 1-2 sentences. What's the one thing VP Product should   ║
║  remember about this quarter?"                              ║
║                                                              ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │ [Write here...]                                        │ ║
║  │                                                        │ ║
║  │                                                        │ ║
║  │                                                        │ ║
║  │                                                        │ ║
║  └────────────────────────────────────────────────────────┘ ║
║                                                              ║
║  [💡 Suggest Next Steps] [📊 Save Progress] [⏭️ Next Section] ║
║                                                              ║
║  Sections:                                                   ║
║  ✅ Executive Summary (complete)                             ║
║  ⏸️ What Went Well (not started)                            ║
║  ⏸️ Challenges & Solutions (not started)                    ║
║  ⏸️ Lessons & Actions (not started)                         ║
╚══════════════════════════════════════════════════════════════╝
```

**Writing Process** (Saligo Principles Maintained):

**Section 1: Executive Summary** (5 minutes)
1. Read AI prompt
2. Write 1-2 sentences (low energy start)
3. Click `[Suggest Next Steps]` → AI offers 2-3 expansion directions
4. Choose one, add 2-3 more sentences
5. Read aloud, polish
6. Mark complete, move to Section 2

**Section 2: What Went Well** (10 minutes)
1. New prompt: "List 3-5 major wins. For each, describe impact in 2-3 sentences."
2. User writes bullet list (low energy - just list items)
3. Click `[Suggest Next Steps]` → AI: "Expand win #1 with concrete metrics"
4. User adds metrics, impact story
5. Repeat for wins #2-5
6. Section complete

**Section 3: Challenges** (10 minutes)
- Same iterative pattern
- Prompt guides content
- User writes in small steps
- AI helps expand when stuck

**Section 4: Lessons** (8 minutes)
- Final section
- Prompt: Forward-looking
- User synthesizes patterns
- AI helps connect to action items

**Total Time**: 35-40 minutes (vs 90-120 min traditional outline-first approach)

**Key Innovation**:
- Structure prevents blank page paralysis
- Each section starts with low-energy prompt
- Iterative expansion within each section
- Can save/resume anytime (auto-save every 30s)

---

#### **Phase 5: Document Finalization** (3-5 minutes)

**Automatic Document Assembly**:
```markdown
---
title: "Q4 Project Retrospective for Product Launch"
created: 2025-11-07T14:30:00
outcome_mode: outcome-driven
outcome_description: "Q4 Project Retrospective for Product Launch"
audience: "Engineering team and VP Product"
sections_completed: 4
total_words: 1350
writing_time: 38
tags: [retrospective, Q4, product-launch, outcome-driven]
---

# Q4 Project Retrospective: Product Launch

## Executive Summary

[User content from Section 1]

## What Went Well

[User content from Section 2]

## Challenges & How We Overcame Them

[User content from Section 3]

## Lessons & Action Items for Q1

[User content from Section 4]

---

💡 *This document was created using WriteAlive's Outcome-Driven mode.*
*Writing time: 38 minutes | Sections: 4 | Words: 1,350*
```

**User Actions**:
- Review complete document
- Polish transitions between sections
- Export to PDF/Word for distribution
- Save as Obsidian note

---

### Journey 2: Hybrid Writing (Outcome + Seeds)

**Context**: PhD student needs to write Chapter 2 literature review. Has 18 paper notes (seeds) and clear thesis (outcome): "Temporal delay in feedback loops is the primary cause of learning inefficiency."

**User Flow**:

#### **Phase 1: Define Hybrid Context** (3-5 minutes)

**Entry Point**: Command Palette → `WriteAlive: Hybrid Writing (Outcome + Seeds)`

**UI: Hybrid Setup Modal**

```
╔══════════════════════════════════════════════════════════╗
║  🎯 + 🌱 Hybrid Writing: Outcome + Seeds                 ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Step 1: Define Your Outcome                             ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │ Literature review for Chapter 2: Temporal Delay   │ ║
║  │ in Feedback Loops as Primary Cause of Learning   │ ║
║  │ Inefficiency                                      │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  Step 2: Gather Your Seeds                              ║
║  ( ) Gather from vault (tag-based)                       ║
║  (•) Select from MOC                                     ║
║  ( ) Manually select notes                               ║
║                                                          ║
║  [Select MOC: "Chapter-2-Literature-Review-MOC"]         ║
║  📊 18 notes found                                       ║
║                                                          ║
║  Step 3: Center Discovery Strategy                      ║
║  (•) Find centers that serve my outcome                  ║
║      → AI prioritizes centers aligned with outcome       ║
║  ( ) Find all centers, then filter by outcome            ║
║      → AI finds all patterns, user selects relevant ones ║
║                                                          ║
║  [Cancel]  [Discover Outcome-Aligned Centers →]          ║
╚══════════════════════════════════════════════════════════╝
```

**User Action**: Clicks `[Discover Outcome-Aligned Centers]`

---

#### **Phase 2: Outcome-Aligned Center Discovery** (5-7 seconds)

**AI Processing** (Enhanced with Outcome Context):

```
✅ Loading 18 notes from MOC...
✅ Analyzing outcome intent...
   → Primary focus: "Temporal delay in feedback loops"
   → Secondary theme: "Learning inefficiency causation"
   → Document type: Literature review (synthesis + argument)

✅ Finding outcome-aligned centers...
   → Discovered 5 potential centers
   → Filtering for outcome alignment
   → 3 centers strongly serve outcome
   → 2 centers tangentially related (marked as optional)

✅ Ranking by outcome fit + structural strength...
```

**AI Prompt Strategy** (Hybrid-Specific):
```typescript
// Standard seed analysis PLUS outcome constraint
const hybridPrompt = `
You are analyzing ${seeds.length} research notes to find centers for a
literature review with this specific thesis:

OUTCOME: "${outcome}"

Your task is to find 2-4 centers that:
1. Emerge naturally from the research notes (standard center criteria)
2. SPECIFICALLY SUPPORT the stated outcome/thesis
3. Enable argumentation around the outcome

PRIORITIZATION:
- Centers directly addressing outcome theme = STRONG
- Centers providing supporting context = MEDIUM
- Centers tangentially related = WEAK (include but mark)

For each center, explain:
- How it emerges from notes (standard)
- How it serves the outcome (new)
- Which aspect of thesis it supports (new)
`;
```

---

#### **Phase 3: Outcome-Filtered Center Display** (2-3 minutes)

**UI: Hybrid Center Discovery Modal**

```
╔══════════════════════════════════════════════════════════════╗
║  🎯 + 🌱 Outcome-Aligned Centers                             ║
║  Outcome: "Temporal Delay in Feedback → Learning Inefficiency"║
║  Seeds: 18 notes from Chapter-2-Literature-Review-MOC       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ⭐⭐⭐ Strong Alignment with Outcome (2)                    ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │ 📍 "Measurement-to-Action Gap in Learning Systems"     │ ║
║  │                                                        │ ║
║  │ 🎯 Outcome Fit: DIRECTLY SUPPORTS THESIS (95%)         │ ║
║  │    This center addresses how temporal delay between   │ ║
║  │    measurement and corrective action causes learning  │ ║
║  │    inefficiency - the core of your thesis.            │ ║
║  │                                                        │ ║
║  │ 💡 From Seeds:                                         │ ║
║  │    All your educational psychology papers (Smith,     │ ║
║  │    Jones, Chen) converge on this delay problem.       │ ║
║  │    Spans 3 MOC sections: Theory, Empirical, Applied.  │ ║
║  │                                                        │ ║
║  │ 🔗 Connected Notes (12/18):                            │ ║
║  │    [[Smith 2023 - Feedback Timing]] ⭐⭐⭐            │ ║
║  │    [[Jones 2022 - Learning Delays]] ⭐⭐⭐            │ ║
║  │    [[Chen 2021 - Temporal Factors]] ⭐⭐⭐           │ ║
║  │    ... and 9 more                                     │ ║
║  │                                                        │ ║
║  │ 📊 Thesis Support:                                     │ ║
║  │    • Provides causation mechanism (delay → inefficiency)│ ║
║  │    • Bridges theory and empirical evidence            │ ║
║  │    • Enables counterargument section                  │ ║
║  │                                                        │ ║
║  │    [Start Writing with This Center →]                 │ ║
║  └────────────────────────────────────────────────────────┘ ║
║                                                              ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │ 📍 "Self-Correction Capacity vs Delay Tolerance"      │ ║
║  │    🎯 Outcome Fit: STRONG SUPPORT (88%)                │ ║
║  │    [Expand ▼]                                          │ ║
║  └────────────────────────────────────────────────────────┘ ║
║                                                              ║
║  ⭐⭐ Contextual Support (1) [Show ▼]                        ║
║  ⭐ Tangentially Related (2) [Show ▼]                       ║
║                                                              ║
║  💡 Recommendation:                                          ║
║  "Start with 'Measurement-to-Action Gap' - it directly     ║
║  proves your thesis using 12/18 papers. Use 'Self-         ║
║  Correction Capacity' as contrasting perspective section." ║
║                                                              ║
╟──────────────────────────────────────────────────────────────╢
║  💰 Analysis: $0.028 | 21,450 tokens | Claude 3.5 Sonnet   ║
║  📊 18 notes, 15,000 words | Outcome: Highly aligned        ║
╚══════════════════════════════════════════════════════════════╝
```

**Key Differences from Standard Center Discovery**:
1. **Outcome Fit Score**: Shows % alignment with thesis (new metric)
2. **Thesis Support Explanation**: How center serves outcome
3. **Recommendation**: AI suggests which centers to use for which sections
4. **Ranking**: Outcome alignment > structural strength (priority shift)
5. **Filtered Display**: Tangential centers collapsed, focus on aligned ones

**User Action**: Selects "Measurement-to-Action Gap" center → Starts writing

---

#### **Phase 4: Outcome-Guided Document Creation** (Document Structure Aware)

**Document Template** (Hybrid Mode):
```markdown
---
title: "Chapter 2: Temporal Delay in Feedback Loops and Learning Inefficiency"
created: 2025-11-07T15:45:00
mode: hybrid
outcome: "Literature review: Temporal delay → learning inefficiency"
source_moc: "[[Chapter-2-Literature-Review-MOC]]"
center:
  name: "Measurement-to-Action Gap in Learning Systems"
  strength: strong
  outcome_alignment: 95%
  connected_notes: 12
seeds: [18 papers listed]
writing_strategy: outcome-guided-synthesis
tags: [dissertation, chapter-2, hybrid-writing]
---

# Chapter 2: Temporal Delay in Feedback Loops and Learning Inefficiency

## 🎯 Thesis Statement

*This chapter argues that temporal delay in feedback loops is the primary
cause of learning inefficiency, by analyzing the measurement-to-action gap
across educational, cognitive, and organizational learning systems.*

## 🌱 Center Discovery

This writing emerged from outcome-driven analysis of 18 research papers,
discovering that 12 papers converge on the "Measurement-to-Action Gap" -
the delay between detecting learning errors and taking corrective action.

**Thesis Support**: This center directly proves the causation claim by
providing empirical evidence across multiple learning contexts.

---

## 📚 Literature Review Structure

### 2.1 Theoretical Framework: Feedback Loops in Learning
*[Writing space for theory section - uses center's theoretical notes]*

### 2.2 Empirical Evidence: Temporal Delay Patterns
*[Writing space for empirical section - uses center's empirical notes]*

### 2.3 Measurement-to-Action Gap: The Core Mechanism
*[Writing space for central argument - uses center explanation]*

### 2.4 Implications for Learning Design
*[Writing space for applied section]*

---

## ✍️ Writing Guidance

**Next Steps** (click for AI suggestions):
- [ ] Expand theoretical framework (Section 2.1)
- [ ] Synthesize empirical findings (Section 2.2)
- [ ] Develop core argument (Section 2.3)
- [ ] Connect to practical implications (Section 2.4)

**Connected Research**:
[Links to 12 papers organized by section]
```

**User Writing Flow**:
1. Thesis already articulated (from outcome)
2. Sections align with center's argumentative structure
3. Each section has seed notes organized by relevance
4. AI suggestions aware of thesis + current section
5. Writing proceeds iteratively within outcome-defined structure

---

### Journey 3: Mode Selection Decision Tree

**UI: WriteAlive Start Modal** (Entry Point)

```
╔══════════════════════════════════════════════════════════╗
║  🌱 WriteAlive - Start Writing                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  What kind of writing are you doing today?               ║
║                                                          ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │ 🌱 Explore Ideas (Seed-Based)                      │ ║
║  │                                                    │ ║
║  │ I have scattered notes/ideas and want to         │ ║
║  │ discover what I can write from them.             │ ║
║  │                                                    │ ║
║  │ Best for: Essays, blog posts, creative writing   │ ║
║  │ Energy: Lowest | Discovery: Highest              │ ║
║  │                                                    │ ║
║  │ [Start Seed-Based Writing →]                       │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │ 🎯 Achieve Goal (Outcome-Driven)                   │ ║
║  │                                                    │ ║
║  │ I know what I need to write and want help        │ ║
║  │ structuring and completing it efficiently.       │ ║
║  │                                                    │ ║
║  │ Best for: Reports, proposals, documentation      │ ║
║  │ Energy: Low-Medium | Direction: Highest          │ ║
║  │                                                    │ ║
║  │ [Start Outcome-Driven Writing →]                   │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  ┌────────────────────────────────────────────────────┐ ║
║  │ 🎯 + 🌱 Synthesize (Hybrid)                        │ ║
║  │                                                    │ ║
║  │ I have existing research/notes AND a specific    │ ║
║  │ goal. Help me find insights that serve my goal.  │ ║
║  │                                                    │ ║
║  │ Best for: Academic papers, thesis, lit reviews   │ ║
║  │ Energy: Medium | Balance: Discovery + Direction  │ ║
║  │                                                    │ ║
║  │ [Start Hybrid Writing →]                           │ ║
║  └────────────────────────────────────────────────────┘ ║
║                                                          ║
║  💡 Not sure? [Take 3-Question Quiz]                     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

**Decision Quiz** (If user clicks `[Take Quiz]`):

```
Question 1: Do you have existing notes/research on this topic?
- Yes, I have 5+ notes → Consider Seed-Based or Hybrid
- Yes, but only 1-2 notes → Consider Outcome-Driven
- No, starting from scratch → Outcome-Driven

Question 2: How clear is your writing goal?
- Very clear (specific deliverable) → Outcome-Driven or Hybrid
- Somewhat clear (general topic) → Hybrid or Seed-Based
- Unclear (want to discover) → Seed-Based

Question 3: What's your primary need?
- Creative discovery → Seed-Based
- Efficient completion → Outcome-Driven
- Both discovery + direction → Hybrid

→ Recommendation displayed based on answers
```

---

## Functional Requirements

### FR-1: Outcome Definition & Management

**Priority**: P0 (MVP Blocker)

#### FR-1.1: Outcome Input Modal
**Requirement**: System MUST provide UI for users to define writing outcomes

**Input Fields**:
1. **Outcome Description** (Required):
   - Multi-line text input (150-500 characters)
   - Prompt: "What do you want to write?"
   - Examples shown for guidance
   - Character counter (min 50, max 500)

2. **Audience** (Optional):
   - Single-line text (50-100 characters)
   - Helps AI adjust tone/structure
   - Prompt: "Who will read this?"

3. **Topics/Sections** (Optional):
   - Multi-line text or tag input
   - Helps AI generate structure
   - Prompt: "What should it cover?"

4. **Length Preference** (Optional):
   - Radio buttons: Short / Medium / Long / Very Long
   - Affects section count and depth

5. **Document Type** (Auto-detected, user can override):
   - Detected from outcome text
   - Options: Report, Proposal, Tutorial, Review, Essay, Documentation
   - Affects structure templates

**Acceptance Criteria**:
- [ ] Modal opens from command palette
- [ ] Required fields validated before submission
- [ ] Example outcomes shown for common types
- [ ] Character counters prevent too short/long inputs
- [ ] Auto-save draft outcomes (resume later)
- [ ] Keyboard accessible (tab navigation, Enter to submit)

**Edge Cases**:
- Empty outcome → Error: "Please describe what you want to write"
- Too vague ("I want to write something") → Warning: "Be more specific for better structure"
- Too long (>500 chars) → Error: "Keep outcome description under 500 characters"

---

#### FR-1.2: Outcome Storage & Metadata
**Requirement**: System MUST persist outcome metadata in document frontmatter

**YAML Frontmatter Structure**:
```yaml
---
# Standard WriteAlive fields
title: "{Generated from outcome}"
created: "{ISO timestamp}"
mode: "outcome-driven" | "hybrid"

# Outcome-specific fields (new)
outcome:
  description: "{User's outcome text}"
  audience: "{Target audience}"
  topics: ["{Topic 1}", "{Topic 2}", ...]
  length_preference: "short" | "medium" | "long"
  document_type: "report" | "proposal" | "tutorial" | ...

# Hybrid mode additions
source_moc: "[[MOC Name]]" # If hybrid
center:
  name: "{Center name}"
  outcome_alignment: 95  # Hybrid-specific metric

# Progress tracking
writing_progress:
  sections_total: 4
  sections_completed: 2
  current_section: "Section 2"
  words_written: 850
  time_spent_minutes: 25

tags: [outcome-driven, {document_type}, ...]
---
```

**Acceptance Criteria**:
- [ ] All outcome inputs saved to frontmatter
- [ ] Progress automatically tracked
- [ ] User can edit outcome after creation
- [ ] Outcome changes don't break document
- [ ] Compatible with existing WriteAlive documents

---

#### FR-1.3: Outcome Templates Library
**Requirement**: System SHOULD provide pre-built outcome templates

**Template Categories**:

**Professional Writing**:
- Project Retrospective
- Product Proposal
- Technical Specification
- Meeting Summary
- Status Report
- Strategy Document

**Academic Writing**:
- Literature Review
- Research Proposal
- Thesis Chapter
- Paper Abstract
- Conference Presentation
- Grant Application

**Documentation**:
- API Documentation
- Tutorial/How-To
- User Guide
- Troubleshooting Guide
- Release Notes

**Template Structure**:
```typescript
{
  id: "project-retrospective",
  name: "Project Retrospective",
  category: "professional",
  outcomeTemplate: "Retrospective for {project name} covering {timeframe}",
  defaultSections: [
    {
      title: "Executive Summary",
      purpose: "High-level outcomes",
      estimatedWords: 200,
      prompt: "Summarize the key achievement in 1-2 sentences..."
    },
    {
      title: "What Went Well",
      purpose: "Celebrate successes",
      estimatedWords: 400,
      prompt: "List 3-5 major wins..."
    },
    // ... more sections
  ],
  audience: "Team and leadership",
  lengthPreference: "medium",
  documentType: "report"
}
```

**Acceptance Criteria**:
- [ ] 10+ templates available at MVP
- [ ] User can browse templates by category
- [ ] Templates populate outcome modal fields
- [ ] User can customize template before using
- [ ] Users can save their own templates

---

### FR-2: AI Structure Generation

**Priority**: P0 (MVP Blocker)

#### FR-2.1: Structure Generation Service
**Requirement**: System MUST generate document structures from outcomes

**AI Service Method**:
```typescript
async generateStructureFromOutcome(
  outcome: OutcomeDefinition,
  options?: {
    sectionCount?: number;  // Preferred section count (default: auto)
    depth?: 'shallow' | 'medium' | 'deep';  // Detail level
    includePrompts?: boolean;  // Generate section prompts (default: true)
  }
): Promise<DocumentStructure>
```

**AI Prompt Strategy**:
```typescript
const structurePrompt = `
You are helping a writer structure a document with this outcome:

OUTCOME: "${outcome.description}"
AUDIENCE: "${outcome.audience}"
TOPICS TO COVER: ${outcome.topics.join(', ')}
DOCUMENT TYPE: ${outcome.documentType}
LENGTH: ${outcome.lengthPreference}

Your task is to generate a 3-5 section structure that:
1. Achieves the outcome efficiently
2. Suits the audience's expectations
3. Covers all requested topics
4. Follows ${documentType} conventions
5. Enables iterative writing (small steps per section)

For each section, provide:
- Title (concise, descriptive)
- Purpose (why this section exists)
- Estimated word count (realistic)
- Writing prompt (low-energy starting question)
- Dependencies (which sections it builds on)

Return JSON:
{
  "structure": {
    "title": "Overall document title",
    "sections": [
      {
        "id": "section-1",
        "title": "Section Title",
        "purpose": "Why this section exists",
        "estimatedWords": 200,
        "estimatedMinutes": 5,
        "writingPrompt": "Start by...",
        "dependencies": []
      }
    ],
    "totalEstimatedWords": 1200,
    "totalEstimatedMinutes": 35
  }
}
`;
```

**Structure Validation**:
- 2-6 sections (too few = shallow, too many = overwhelming)
- Total word count aligns with length preference
- Section purposes non-overlapping
- Writing prompts are low-energy (not "write 500 words about...")
- Dependencies form valid DAG (no circular)

**Acceptance Criteria**:
- [ ] Generates structures in 3-5 seconds
- [ ] Structures aligned with document type conventions
- [ ] Sections have realistic word/time estimates
- [ ] Writing prompts enable low-energy starts
- [ ] Handles all document types
- [ ] Cost: ~$0.005-0.010 per structure generation

---

#### FR-2.2: Structure Editing & Customization
**Requirement**: System MUST allow users to edit AI-generated structures

**Edit Operations**:
1. **Add Section**:
   - Insert at any position
   - AI suggests purpose/prompt based on surrounding sections
   - User can write custom prompt

2. **Remove Section**:
   - Mark section as optional (hide but keep)
   - Permanently delete section

3. **Reorder Sections**:
   - Drag-and-drop reordering
   - AI warns if dependencies broken

4. **Edit Section**:
   - Change title, purpose, prompt
   - Adjust word count estimate
   - Mark as required/optional

5. **Split Section**:
   - Break large section into 2-3 subsections
   - AI suggests split points

6. **Merge Sections**:
   - Combine 2 related sections
   - AI merges purposes/prompts

**Acceptance Criteria**:
- [ ] All edit operations work smoothly
- [ ] Changes saved immediately
- [ ] Undo/redo support
- [ ] Dependency warnings clear
- [ ] Can reset to AI-generated structure
- [ ] Edits preserved if user revisits

---

#### FR-2.3: Structure Preview & Estimation
**Requirement**: System SHOULD show estimated effort before commitment

**Preview Information**:
- Total sections: 4
- Total estimated words: 1,200-1,500
- Total estimated time: 35-40 minutes
- Complexity: Medium (balance of narrative + technical)
- Recommended approach: Write sections 1-3 in one session, section 4 later

**Visual Preview**:
```
Section 1 ████░░░░░ (20% of effort - 8 min)
Section 2 ████████░ (35% of effort - 12 min)
Section 3 ████████░ (30% of effort - 10 min)
Section 4 ███░░░░░░ (15% of effort - 5 min)
```

**Acceptance Criteria**:
- [ ] Estimates shown before writing
- [ ] Visual progress bars intuitive
- [ ] Estimates based on document type data
- [ ] User can proceed or refine structure

---

### FR-3: Hybrid Mode (Outcome + Seeds)

**Priority**: P0 (MVP Blocker)

#### FR-3.1: Outcome-Aligned Center Discovery
**Requirement**: System MUST find centers that serve defined outcomes

**Enhanced AI Prompt** (Hybrid-Specific):
```typescript
const hybridCenterPrompt = `
You are analyzing ${seeds.length} notes to find centers for this SPECIFIC OUTCOME:

OUTCOME: "${outcome.description}"
AUDIENCE: "${outcome.audience}"
DOCUMENT TYPE: ${outcome.documentType}

Your task is to find 2-4 centers that:
1. Emerge naturally from the notes (standard Saligo criteria)
2. DIRECTLY SUPPORT the outcome/thesis
3. Enable writing that achieves the outcome

CRITICAL: Centers must serve the outcome. Do not suggest tangential centers
just because they appear in seeds.

OUTCOME ALIGNMENT SCORING:
- Direct support (90-100%): Center proves/enables outcome
- Strong support (70-89%): Center provides essential context
- Moderate support (50-69%): Center adds supporting evidence
- Weak support (<50%): Center tangentially related (mark as optional)

For each center, explain:
1. How it emerges from notes (standard)
2. How it serves the outcome (NEW - required)
3. Which part of outcome it addresses (NEW - required)
4. Outcome alignment percentage (NEW - required)

Return JSON:
{
  "centers": [
    {
      "name": "Center name",
      "explanation": "How it emerges from notes",
      "outcomeSupport": "How it serves the outcome",
      "outcomePart": "Which aspect of outcome it addresses",
      "outcomeAlignment": 95,  // 0-100%
      "strength": "strong" | "medium" | "weak",
      "connectedSeeds": ["seed-1", ...],
      "recommendation": "When to use this center"
    }
  ]
}
`;
```

**Outcome Alignment Calculation**:
- AI provides initial alignment score (0-100%)
- System validates:
  - Does center mention outcome keywords? (+10%)
  - Do connected seeds relate to outcome topics? (+20%)
  - Does explanation reference outcome? (+10%)
- Final alignment = AI score + validation adjustments

**Acceptance Criteria**:
- [ ] Centers ranked by outcome alignment first, then strength
- [ ] Alignment scores visible in UI
- [ ] "Outcome Support" explanation clear
- [ ] Tangential centers grouped separately
- [ ] Works with all outcome types
- [ ] Cost: ~$0.025-0.035 (MOC-scale analysis)

---

#### FR-3.2: Outcome-Filtered Center Display
**Requirement**: System MUST visually distinguish outcome-aligned vs tangential centers

**UI Requirements**:
1. **Grouping by Alignment**:
   - Direct Support (90-100%) - expanded by default
   - Strong Support (70-89%) - collapsed
   - Moderate Support (50-69%) - collapsed
   - Tangential (<50%) - collapsed, marked "Optional"

2. **Alignment Indicators**:
   - Progress bar showing alignment %
   - Color coding (green = direct, yellow = strong, gray = weak)
   - Icon: 🎯 for direct support

3. **Outcome Explanation**:
   - "How This Serves Your Outcome" section
   - Maps center → outcome parts
   - Example: "This center addresses the 'temporal delay' aspect of your thesis"

4. **Recommendation**:
   - AI suggests which centers to use for which document sections
   - Example: "Use Center A for thesis, Center B for counterargument"

**Acceptance Criteria**:
- [ ] Alignment scoring clear and accurate
- [ ] Grouping helps user focus on relevant centers
- [ ] Can still view/select tangential centers (not hidden)
- [ ] Outcome explanation not redundant with standard explanation
- [ ] Recommendations actionable

---

#### FR-3.3: Hybrid Document Template
**Requirement**: System MUST create documents that reflect both outcome and seed context

**Document Template** (Hybrid):
```markdown
---
title: "{Generated from outcome}"
mode: hybrid
outcome:
  description: "{Outcome text}"
  audience: "{Audience}"
  alignment_achieved: true  # After writing complete
source_moc: "[[{MOC}]]" # Or seed source
center:
  name: "{Center name}"
  strength: strong
  outcome_alignment: 95%
  outcome_support: "{How center serves outcome}"
seeds: [list of seed notes]
tags: [hybrid-writing, {document-type}, ...]
---

# {Document Title from Outcome}

## 🎯 Outcome

*{Outcome description - what this document aims to achieve}*

## 🌱 Foundation

This writing synthesizes insights from {N} notes/papers, centered around
"{Center name}" - a pattern that directly supports the stated outcome.

**How This Center Serves the Outcome**:
{Outcome support explanation}

---

## ✍️ Content

{Sections here - may be outcome-structured or emergent}

---

## 📚 Source Materials

{Connected seeds organized by relevance to outcome}
```

**Acceptance Criteria**:
- [ ] Template reflects dual nature (outcome + seeds)
- [ ] Outcome achievement trackable
- [ ] Center's outcome support documented
- [ ] Source attribution clear
- [ ] Compatible with both structured and emergent writing

---

### FR-4: Section-by-Section Writing Interface

**Priority**: P0 (MVP Blocker)

#### FR-4.1: Guided Writing View
**Requirement**: System MUST provide section-focused writing interface

**UI Components**:

1. **Progress Indicator**:
   - Current section highlighted
   - Completed sections marked ✅
   - Remaining sections shown
   - Overall progress bar

2. **Section Context**:
   - Section title and purpose
   - Writing prompt (AI-generated, low-energy)
   - Estimated word count/time
   - Related seeds (if hybrid mode)

3. **Writing Area**:
   - Distraction-free text input
   - Real-time word count
   - Auto-save every 30 seconds
   - Markdown support

4. **Section Actions**:
   - [Suggest Next Steps] - AI expansion ideas
   - [Mark Complete] - Finish section, move to next
   - [Save Draft] - Save and exit
   - [Skip Section] - Mark for later

5. **Navigation**:
   - Jump to any section
   - Back/Next buttons
   - Exit to full document view

**Acceptance Criteria**:
- [ ] Interface minimizes cognitive load
- [ ] Progress always visible
- [ ] Can pause/resume anytime
- [ ] Writing prompts helpful, not prescriptive
- [ ] Auto-save prevents data loss
- [ ] Works with keyboard navigation

---

#### FR-4.2: AI Next Steps (Outcome-Aware)
**Requirement**: System MUST provide next step suggestions aware of outcome context

**Enhanced Next Steps Prompt**:
```typescript
const outcomeSuggestNextSteps = `
CONTEXT:
- Writing Mode: ${mode}  // "outcome-driven" or "hybrid"
- Document Outcome: "${outcome.description}"
- Current Section: "${section.title}" (Purpose: ${section.purpose})
- Section Progress: ${currentWords} / ${targetWords} words

CURRENT CONTENT:
${sectionContent}

Your task: Suggest 2-3 next steps that:
1. Continue this section toward completion
2. Serve the overall document outcome
3. Align with section purpose
4. Enable low-energy iteration

OUTCOME-AWARE GUIDANCE:
- Does current content serve outcome? If not, suggest realignment.
- What aspect of outcome is still missing from this section?
- How can next step bring section closer to outcome achievement?

Return JSON:
{
  "outcomeAlignment": {
    "currentLevel": 75,  // % aligned with outcome
    "gaps": ["Missing quantitative evidence", "No connection to audience needs"]
  },
  "suggestions": [
    {
      "type": "deepen" | "connect" | "realign" | "complete",
      "direction": "Brief title",
      "rationale": "Why this serves outcome",
      "outcomeImpact": "How this improves outcome alignment",
      "contentHints": ["Hint 1", "Hint 2"],
      "estimatedWords": 150
    }
  ]
}
`;
```

**Outcome-Specific Suggestion Types**:
- **Realign**: "Content drifting from outcome - refocus on {aspect}"
- **Complete**: "Section nearly done - add {final element} to fulfill purpose"
- **Outcome Gap**: "Still missing {outcome requirement} - address with {approach}"

**Acceptance Criteria**:
- [ ] Suggestions aware of document outcome
- [ ] "Realign" type prevents drift
- [ ] Outcome gaps identified proactively
- [ ] Works in both outcome-driven and hybrid modes
- [ ] Cost: ~$0.003-0.005 per suggestion set

---

#### FR-4.3: Section Completion Validation
**Requirement**: System SHOULD validate section completeness before marking done

**Validation Checks**:
1. **Word Count**: Section within 80-120% of estimate?
2. **Purpose Fulfillment**: Does content address section purpose? (AI check)
3. **Outcome Contribution**: Does section contribute to overall outcome? (AI check)
4. **Completeness**: Any obvious gaps or unfinished thoughts?

**Validation Flow**:
```
User clicks [Mark Complete]
  ↓
System runs validation
  ↓
If validation passes:
  → Section marked complete ✅
  → Move to next section

If validation fails:
  → Show warnings modal:
      "⚠️ Section may be incomplete:
       - Only 120 words (target: 300)
       - Purpose 'Explain benefits' not clearly addressed
       - Missing connection to outcome

       [Complete Anyway] [Continue Writing]"
```

**Acceptance Criteria**:
- [ ] Validation quick (<1 second)
- [ ] Warnings helpful, not blocking
- [ ] User can override validation
- [ ] AI checks accurate (>85% precision)
- [ ] No cost for validation (rules-based + fast AI)

---

### FR-5: Mode Selection & Onboarding

**Priority**: P1 (Post-MVP Enhancement)

#### FR-5.1: Mode Selection Interface
**Requirement**: System MUST help users choose appropriate writing mode

**Selection Criteria**:
- **Seed-Based**: Have seeds, want discovery, no clear goal
- **Outcome-Driven**: Clear goal, no seeds, need structure
- **Hybrid**: Have seeds AND clear goal, want aligned discovery

**Decision Helper**:
- 3-question quiz (see Journey 3)
- Mode comparison table
- Use case examples
- "Most users like you choose..." (ML-based recommendation)

**Acceptance Criteria**:
- [ ] Mode selection clear and intuitive
- [ ] Quiz helps indecisive users
- [ ] Examples resonate with use cases
- [ ] Can change mode after selection
- [ ] Default mode remembers user preference

---

#### FR-5.2: First-Time User Onboarding
**Requirement**: System SHOULD onboard users to new modes

**Onboarding Flow**:
1. **Welcome**: "WriteAlive now supports 3 writing modes!"
2. **Quick Tour**: 30-second overview of each mode
3. **Try Outcome Mode**: Guided first outcome-driven doc
4. **Try Hybrid Mode**: Guided first hybrid doc
5. **Tips & Tricks**: Best practices for each mode

**Onboarding Triggers**:
- First launch after update (outcome modes added)
- Onboarding badge on ribbon button
- "Take Tour" option in settings

**Acceptance Criteria**:
- [ ] Onboarding skippable (not forced)
- [ ] Tour under 2 minutes
- [ ] Guided docs demonstrate value
- [ ] Tips contextual and actionable
- [ ] Can revisit tour anytime

---

### FR-6: Settings & Configuration

**Priority**: P1 (Post-MVP)

#### FR-6.1: Outcome Mode Settings
**Requirement**: System SHOULD allow configuration of outcome-driven behavior

**Settings UI**:
```
╔══════════════════════════════════════════════════════════╗
║  WriteAlive Settings > Outcome-Driven Writing            ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Structure Generation:                                   ║
║    Default section count: [3-5___]                       ║
║    Detail level: ( ) Shallow (•) Medium ( ) Deep         ║
║    [x] Include writing prompts for each section          ║
║    [x] Estimate time/word counts                         ║
║                                                          ║
║  Writing Guidance:                                       ║
║    [x] Show progress indicator                           ║
║    [x] Auto-suggest next steps when paused               ║
║    [x] Validate sections before marking complete         ║
║    [ ] Strict mode (block completion if validation fails)║
║                                                          ║
║  Hybrid Mode:                                            ║
║    Outcome alignment threshold: [70%___]                 ║
║    [x] Show tangential centers (collapsed)               ║
║    [ ] Hide centers below threshold                      ║
║    [x] Prioritize alignment over structural strength     ║
║                                                          ║
║  Templates:                                              ║
║    [Manage Templates...] [Import] [Export]               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

**Acceptance Criteria**:
- [ ] All settings persist
- [ ] Changes apply immediately
- [ ] Validation prevents invalid configs
- [ ] Defaults optimized for 90% of users
- [ ] Templates sharable across devices

---

## Non-Functional Requirements

### NFR-1: Performance

**NFR-1.1: Structure Generation Speed**
- **Requirement**: Generate document structure in <5 seconds
- **Measurement**: 95th percentile latency
- **Rationale**: User waiting for structure before writing

**NFR-1.2: Outcome-Aligned Center Discovery Speed**
- **Requirement**: Hybrid mode analysis in <10 seconds (95% of cases)
- **Measurement**: Same as standard center discovery
- **Rationale**: Outcome filtering adds minimal overhead

**NFR-1.3: Section Suggestion Speed**
- **Requirement**: Next steps suggestions in <3 seconds
- **Measurement**: Average response time
- **Rationale**: Real-time writing guidance needs responsiveness

---

### NFR-2: Cost Efficiency

**NFR-2.1: Outcome Mode Cost Targets**
- **Structure Generation**: $0.005-0.010 per structure
- **Section Suggestions**: $0.003-0.005 per suggestion set
- **Hybrid Center Discovery**: $0.025-0.035 (same as MOC discovery)
- **Monthly Budget**: $8-15 for active user (20 documents + 60 suggestions)

**NFR-2.2: Cost Transparency**
- **Requirement**: Show estimated cost before each AI operation
- **Requirement**: Track cumulative cost per document
- **Requirement**: Monthly cost dashboard in settings

---

### NFR-3: Usability

**NFR-3.1: Mode Selection Clarity**
- **Requirement**: 90% of users choose correct mode on first try
- **Measurement**: User testing + analytics
- **Rationale**: Wrong mode = poor experience

**NFR-3.2: Outcome Input Ease**
- **Requirement**: Users can define outcome in <2 minutes
- **Measurement**: Time from modal open to structure generation
- **Rationale**: High friction defeats low-energy philosophy

**NFR-3.3: Writing Flow Continuity**
- **Requirement**: No more than 3 clicks between writing sections
- **Requirement**: Auto-save prevents any data loss
- **Rationale**: Maintain writing momentum

---

### NFR-4: Compatibility

**NFR-4.1: Backward Compatibility**
- **Requirement**: All existing seed-based workflows unchanged
- **Requirement**: Existing documents still work
- **Requirement**: No breaking changes to APIs

**NFR-4.2: Forward Compatibility**
- **Requirement**: Outcome metadata extensible
- **Requirement**: Template system supports custom fields
- **Requirement**: Mode system supports future modes (e.g., "Iterative Refinement")

---

## Success Metrics

### Primary KPIs (Business Value)

1. **Feature Adoption**:
   - Target: 50% of active users try outcome-driven or hybrid mode within 60 days
   - Measurement: Users who create at least 1 outcome/hybrid document

2. **Professional User Growth**:
   - Target: 2x growth in users writing work documents (reports, proposals, docs)
   - Measurement: Document type tagging + user surveys

3. **Hybrid Mode Usage (Academic)**:
   - Target: 70% of academic users (thesis, papers) adopt hybrid mode
   - Measurement: Document mode field + user type

4. **Completion Rate**:
   - Target: 70% completion rate for outcome-driven docs (vs 60% for seed-based)
   - Rationale: Structure should reduce abandonment

### Secondary KPIs (User Engagement)

5. **Time to First Draft**:
   - Target: 30-40 minutes for outcome-driven (vs 45-60 for traditional)
   - Measurement: Document creation to completion time

6. **Mode Switching**:
   - Target: 40% of users use multiple modes (shows understanding of use cases)
   - Measurement: Unique modes per user

7. **Template Usage**:
   - Target: 60% of outcome-driven docs use templates
   - Measurement: Template selection rate

8. **Section Completion Pattern**:
   - Target: 80% of users complete sections sequentially (shows structure is working)
   - Measurement: Section completion order

### Quality Indicators

9. **Outcome Alignment (Hybrid Mode)**:
   - Target: Average 75%+ alignment score for selected centers
   - Measurement: Outcome alignment field

10. **User Satisfaction**:
    - Target: 85% satisfaction for outcome/hybrid modes (survey)
    - Measurement: In-app NPS after document completion

11. **Structural Coherence**:
    - Target: Outcome-driven docs score 8.0+ wholeness (vs 7.5 for seed-based)
    - Rationale: Structure should improve coherence

---

## Comparison: Three-Mode System

### Mode Comparison Matrix

| Aspect | Seed-Based (Existing) | Outcome-Driven (New) | Hybrid (New) |
|--------|----------------------|----------------------|--------------|
| **Input** | Seeds (tagged notes) | Outcome description | Outcome + Seeds |
| **Energy Barrier** | Lowest | Low-Medium | Medium |
| **Entry Time** | 2-3 min (gather seeds) | 2-3 min (define outcome) | 5-7 min (both) |
| **Discovery** | Maximum | Minimum | Balanced |
| **Direction** | Minimal | Maximum | Balanced |
| **Structure** | Emergent | Pre-defined (editable) | Outcome-aligned emergent |
| **Use Case** | Essays, blogs, creative | Reports, proposals, docs | Thesis, lit reviews, synthesis |
| **User Type** | All (beginner-friendly) | Professional writers | Academic researchers |
| **Completion Rate** | 60% | 70% (target) | 65% (target) |
| **Time to Draft** | 30-60 min | 30-40 min | 40-60 min |
| **Wholeness Score** | 7.5 avg | 8.0 avg (target) | 8.3 avg (target) |
| **Mobile-Friendly** | Yes (seed capture) | No (desktop-focused) | Partial (seed capture yes, outcome no) |

### When to Use Each Mode

**Use Seed-Based When**:
- ✅ Have scattered notes/ideas without clear goal
- ✅ Want creative discovery and unexpected connections
- ✅ Writing personal essays, blog posts, reflections
- ✅ Low time pressure, exploratory mindset
- ✅ Captured seeds on mobile, writing on desktop
- ❌ Need specific deliverable with structure
- ❌ Tight deadline with clear requirements

**Use Outcome-Driven When**:
- ✅ Know exactly what you need to write
- ✅ Have deadline and stakeholder expectations
- ✅ Writing professional documents (reports, proposals)
- ✅ No existing notes/research on topic
- ✅ Need efficiency over discovery
- ❌ Want creative exploration
- ❌ Have substantial existing research

**Use Hybrid When**:
- ✅ Have research/notes AND clear writing goal
- ✅ Writing academic papers, thesis chapters
- ✅ Need both grounded insights and intentional direction
- ✅ Want centers that serve specific argument/outcome
- ✅ Synthesizing literature for structured paper
- ❌ Pure exploration (use seed-based)
- ❌ No existing notes (use outcome-driven)

---

## Edge Cases & Error Scenarios

### EC-1: Vague Outcome Definition

**Scenario**: User enters "I want to write something good"

**Handling**:
- **Detection**: AI analyzes specificity (keyword check + semantic analysis)
- **Warning**: "Your outcome is very broad. Try being more specific:"
  - What type of document? (report, essay, proposal...)
  - What topic or question?
  - Who will read it?
- **Suggestion**: Show examples of specific outcomes
- **Fallback**: Offer seed-based mode as alternative

**Acceptance Criteria**:
- [ ] Vague outcomes detected with 90%+ accuracy
- [ ] Warnings helpful, not frustrating
- [ ] Examples inspire specificity
- [ ] Can proceed anyway (soft warning)

---

### EC-2: Outcome + Seeds Mismatch (Hybrid Mode)

**Scenario**: Outcome is "Write tutorial on Python Django" but seeds are about React

**Handling**:
- **Detection**: AI checks semantic similarity (outcome keywords vs seed topics)
- **Warning**: "Your seeds don't seem to match your outcome:
  - Outcome: Python Django tutorial
  - Seeds: 10 notes about React, 2 about general web dev
  - Recommendation: Gather Django-related seeds or adjust outcome"
- **Options**:
  - [Gather Different Seeds] - Return to seed selection
  - [Adjust Outcome] - Edit outcome to match seeds
  - [Continue Anyway] - Proceed with mismatch (may produce weak centers)

**Acceptance Criteria**:
- [ ] Mismatch detected before expensive AI call
- [ ] Warning explains specific mismatch
- [ ] Recovery options clear
- [ ] Can override if user knows what they're doing

---

### EC-3: No Outcome-Aligned Centers Found (Hybrid)

**Scenario**: Seeds analyzed, but no centers score >50% outcome alignment

**Handling**:
- **Result**: "No strongly aligned centers found. Found 3 centers, but all are tangentially related to your outcome."
- **Explanation**:
  - "Best alignment: 45% ('React Component Patterns')"
  - "Your outcome focuses on Django backend, but seeds focus on frontend"
- **Options**:
  - [View Tangential Centers Anyway] - Maybe useful for intro/context
  - [Try Outcome-Only Mode] - Abandon seeds, generate structure from outcome
  - [Gather More Relevant Seeds] - Return to seed selection
  - [Refine Outcome] - Adjust outcome to match seed themes

**Acceptance Criteria**:
- [ ] Clear explanation of why alignment is low
- [ ] Recovery paths actionable
- [ ] Cost refunded if user abandons
- [ ] Learn from failure (prompt improvement)

---

### EC-4: User Abandons Mid-Section

**Scenario**: User writes 100 words in Section 2, closes modal, doesn't return

**Handling**:
- **Auto-Save**: Draft saved every 30 seconds
- **State Preservation**:
  - Document created with partial content
  - Sections 1 (complete) and 2 (partial) saved
  - Sections 3-4 marked as "not started"
  - Frontmatter tracks progress
- **Resume Flow**:
  - Next time user opens document, show:
    "Resume writing Section 2? (100 words written, ~200 remaining)
     [Resume] [Start Over] [View Full Document]"

**Acceptance Criteria**:
- [ ] No data loss from abandonment
- [ ] Resume flow intuitive
- [ ] Can restart or abandon
- [ ] Partial documents clearly marked

---

### EC-5: Generated Structure Doesn't Fit Outcome

**Scenario**: User outcome is "Project retrospective" but AI generates blog post structure

**Handling**:
- **Prevention**: Strong document type detection from outcome keywords
- **Validation**: User reviews structure before accepting
- **Recovery**:
  - User clicks [Regenerate Structure]
  - Modal: "What's wrong with this structure?"
    - ( ) Wrong document type (expected: retrospective, got: blog)
    - ( ) Missing required sections
    - ( ) Too shallow / too deep
    - ( ) Sections don't match my needs
  - AI regenerates with feedback
- **Override**: User can manually edit structure

**Acceptance Criteria**:
- [ ] Structure mismatch rate <10%
- [ ] Regeneration improves alignment (>80% success)
- [ ] Feedback improves AI over time
- [ ] Manual editing always available

---

## Roadmap & Implementation Phases

### Phase 1: Outcome-Driven MVP (4-6 weeks)

**Goal**: Ship basic outcome-driven writing

**Deliverables**:
- Outcome definition modal
- AI structure generation
- Structure editing UI
- Section-by-section writing view
- Basic next steps (outcome-aware)
- Document creation with outcome metadata
- 5 professional document templates

**Success Criteria**:
- 30% of active users try outcome-driven mode in first month
- 65% completion rate (vs 60% target)
- Average doc creation time <45 min
- Structure quality >80% user satisfaction

---

### Phase 2: Hybrid Mode (3-4 weeks)

**Goal**: Extend to hybrid (outcome + seeds)

**Deliverables**:
- Hybrid setup modal
- Outcome-aligned center discovery
- Outcome alignment scoring
- Hybrid document templates
- Outcome filtering UI
- Mode selection helper

**Success Criteria**:
- 20% of users try hybrid mode
- 70% of academic users adopt hybrid
- Average alignment score >75%
- 60% completion rate

---

### Phase 3: Polish & Templates (2-3 weeks)

**Goal**: Improve UX and expand templates

**Deliverables**:
- 10 additional templates (academic, docs, professional)
- Template library UI
- Custom template creation
- Improved mode selection (quiz)
- Onboarding tour
- Settings UI

**Success Criteria**:
- 60% template usage rate
- Mode selection accuracy >90%
- Onboarding completion >70%
- User satisfaction >85%

---

### Phase 4: Advanced Features (4-6 weeks)

**Goal**: Power user features

**Deliverables**:
- Template marketplace (share templates)
- Outcome refinement suggestions
- Multi-document outcome tracking
- Outcome evolution (outcome changes as you write)
- Collaborative outcomes (team writing)
- Advanced analytics (outcome achievement tracking)

**Success Criteria**:
- 50% feature adoption overall
- Power users (top 20%) use advanced features
- Template sharing active (>100 shared templates)
- Retention >75% at 90 days

---

## Open Questions

### Product Questions

1. **Should outcomes be shareable/collaborative?**
   - Use case: Team writes project proposal together
   - Technical: Shared outcomes in team vaults
   - **Recommendation**: P3 feature, validate need first

2. **Should AI suggest outcomes from user's existing documents?**
   - "You often write project retrospectives - create one now?"
   - Pattern recognition from past documents
   - **Recommendation**: P2 enhancement, ML-based

3. **How to handle outcome evolution during writing?**
   - User starts with outcome A, discovers better outcome B while writing
   - Should we support mid-stream outcome changes?
   - **Recommendation**: P2 - allow outcome refinement, preserve original

4. **Should hybrid mode work with single notes (not just MOCs/seeds)?**
   - Use case: "Write tutorial using my existing Django project note"
   - **Recommendation**: Yes, P1 - extend to single-note input

5. **How to prevent outcome-driven mode from becoming rigid outlining?**
   - Risk: Users treat AI structure as prescriptive
   - Mitigation: Emphasize editability, show examples of structure evolution
   - **Recommendation**: UX copy and onboarding focused on flexibility

---

### Technical Questions

1. **Can we detect outcome type without user input?**
   - Use NLP to classify: "Write Q4 retrospective" → document type: retrospective
   - Accuracy target: >90%
   - **Recommendation**: Yes, implement as default with user override

2. **How to cache outcome structures?**
   - Similar outcomes ("project retrospective") → reuse structure
   - Privacy: Don't share structures across users
   - **Recommendation**: Per-user cache, 30-day TTL

3. **Should sections support nested subsections?**
   - Use case: Large documents (thesis chapters)
   - Complexity: Nested structure UI
   - **Recommendation**: P2 feature, max 2 levels deep

4. **How to optimize cost for frequent structure generation?**
   - Template matching: If outcome matches template, skip AI
   - Partial generation: Only generate unknown sections
   - **Recommendation**: Template matching for MVP, partial gen for P2

5. **Can outcome alignment be calculated offline (no AI)?**
   - Keyword matching: outcome keywords ∩ center keywords
   - Speed: Instant vs 3-5s AI call
   - Accuracy: 70% vs 95% AI
   - **Recommendation**: Hybrid - offline estimate + AI refinement

---

## Appendices

### Appendix A: Sample Outcome Definitions

**Professional Writing**:

```
Project Retrospective:
"Q4 Product Launch retrospective for engineering team and VP Product,
covering what went well, challenges we overcame, and action items for Q1.
Should highlight team wins and be honest about obstacles."

Technical Specification:
"API specification for authentication service, documenting OAuth flow,
token refresh, error handling, and rate limiting. Audience: Frontend
developers integrating with our API."

Product Proposal:
"Proposal for new mobile app feature: offline mode. Needs to cover
problem statement, user research, proposed solution, technical approach,
timeline, and success metrics. Audience: Product leadership."
```

**Academic Writing**:

```
Literature Review:
"Chapter 2 literature review on temporal delay in feedback loops and
learning inefficiency. Synthesize 18 papers to support thesis that
temporal delay is the primary causal factor. Include theoretical
framework, empirical evidence, and implications."

Research Proposal:
"NSF grant proposal for studying feedback mechanisms in online learning.
Needs to cover research questions, methodology, significance, timeline,
and budget. 5-page limit."

Conference Paper:
"CHI conference paper (10 pages) presenting our study on AI-assisted
writing tools. Structure: Intro, Related Work, System Design, User Study,
Results, Discussion, Limitations, Future Work."
```

**Documentation**:

```
API Tutorial:
"Tutorial for beginners to use our REST API. Cover authentication setup,
making first request, handling responses, error handling, and
troubleshooting. Include code examples in Python and JavaScript."

User Guide:
"User guide for WriteAlive's outcome-driven mode. Explain when to use it,
how to define outcomes, work with generated structure, and complete
documents. Screenshots included."
```

---

### Appendix B: Template Specification Format

```typescript
interface DocumentTemplate {
  id: string;  // "project-retrospective"
  name: string;  // "Project Retrospective"
  category: "professional" | "academic" | "documentation" | "creative";
  description: string;  // "Reflect on completed project..."

  outcomeTemplate: string;  // "{Project} retrospective for {audience}..."
  placeholders: {  // Variables in outcomeTemplate
    project: { type: "text", prompt: "Project name?" },
    audience: { type: "text", prompt: "Who will read this?" }
  };

  defaultSections: {
    title: string;
    purpose: string;
    estimatedWords: number;
    writingPrompt: string;
    required: boolean;
    order: number;
  }[];

  documentType: "report" | "proposal" | "tutorial" | ...;
  lengthPreference: "short" | "medium" | "long";
  audience: string;
  tone: "formal" | "professional" | "casual" | "academic";

  tags: string[];
  author: string;  // For shared templates
  usageCount: number;  // For popularity ranking
  rating: number;  // 1-5 stars from users
}
```

---

### Appendix C: Cost Estimation Formulas

**Outcome-Driven Mode Costs**:

```typescript
// Structure Generation
function estimateStructureCost(
  outcomeLength: number,  // chars in outcome description
  sectionCount: number
): number {
  const INPUT_TOKENS = (outcomeLength / 4) + 500;  // Outcome + system prompt
  const OUTPUT_TOKENS = sectionCount * 150;  // Each section ~150 tokens

  const inputCost = (INPUT_TOKENS / 1000) * 0.003;  // Claude Sonnet input
  const outputCost = (OUTPUT_TOKENS / 1000) * 0.015;  // Claude Sonnet output

  return inputCost + outputCost;
}

// Example: "Project retrospective..." (200 chars), 4 sections
// Input: 50 + 500 = 550 tokens = $0.0017
// Output: 4 * 150 = 600 tokens = $0.009
// Total: $0.011

// Section Suggestion
function estimateSectionSuggestionCost(
  sectionContent: number  // words in section
): number {
  const INPUT_TOKENS = (sectionContent * 1.33) + 400;  // Content + prompt
  const OUTPUT_TOKENS = 400;  // Suggestion set

  const inputCost = (INPUT_TOKENS / 1000) * 0.003;
  const outputCost = (OUTPUT_TOKENS / 1000) * 0.015;

  return inputCost + outputCost;
}

// Example: 200 words written
// Input: 266 + 400 = 666 tokens = $0.002
// Output: 400 tokens = $0.006
// Total: $0.008

// Hybrid Center Discovery (same as MOC)
function estimateHybridCost(
  noteCount: number,
  totalWords: number,
  outcomeLength: number
): number {
  const SEED_TOKENS = (totalWords / 0.75) + 800;  // Seeds + MOC structure
  const OUTCOME_TOKENS = (outcomeLength / 4) + 200;  // Outcome context
  const OUTPUT_TOKENS = 600;  // Centers

  const inputCost = ((SEED_TOKENS + OUTCOME_TOKENS) / 1000) * 0.003;
  const outputCost = (OUTPUT_TOKENS / 1000) * 0.015;

  return inputCost + outputCost;
}

// Example: 15 notes, 12,000 words, outcome 200 chars
// Seeds: 16,000 + 800 = 16,800 tokens
// Outcome: 50 + 200 = 250 tokens
// Input: 17,050 tokens = $0.051
// Output: 600 tokens = $0.009
// Total: $0.060
```

**Monthly Cost Scenarios**:

```
Professional Writer (Outcome-Driven Heavy):
- 15 outcome-driven docs/month
- 60 section suggestions
- Total: (15 * $0.011) + (60 * $0.008) = $0.165 + $0.480 = $0.645

Academic Researcher (Hybrid Heavy):
- 3 hybrid analyses/month (large)
- 30 section suggestions
- Total: (3 * $0.060) + (30 * $0.008) = $0.180 + $0.240 = $0.420

Mixed User:
- 5 seed-based (existing)
- 8 outcome-driven
- 2 hybrid
- 40 suggestions
- Seed: 5 * $0.023 = $0.115
- Outcome: 8 * $0.011 = $0.088
- Hybrid: 2 * $0.060 = $0.120
- Suggestions: 40 * $0.008 = $0.320
- Total: $0.643
```

**Cost Protection**:
- Monthly budget warning: >$5
- Per-operation warning: >$0.10
- Hard limit: $50/month (likely misconfiguration)

---

### Appendix D: Metrics & Analytics Spec

**Telemetry Events** (Anonymized, Aggregated):

```typescript
// Outcome Definition
event('outcome_defined', {
  mode: 'outcome-driven' | 'hybrid',
  outcomeLength: number,  // chars
  hasAudience: boolean,
  hasTopics: boolean,
  lengthPreference: string,
  documentType: string,  // auto-detected
  templateUsed: boolean,
  templateId?: string
});

// Structure Generation
event('structure_generated', {
  sectionCount: number,
  totalEstimatedWords: number,
  totalEstimatedMinutes: number,
  documentType: string,
  generationTime: number,  // seconds
  cost: number,
  userEdited: boolean  // Did user edit before accepting?
});

// Section Writing
event('section_started', {
  sectionIndex: number,
  sectionPurpose: string,
  estimatedWords: number
});

event('section_completed', {
  sectionIndex: number,
  actualWords: number,
  timeSpent: number,  // minutes
  suggestionsUsed: number,
  validationPassed: boolean
});

// Hybrid Mode
event('hybrid_centers_discovered', {
  seedCount: number,
  centersFound: number,
  avgOutcomeAlignment: number,  // %
  stronglyAligned: number,  // count with >90%
  cost: number
});

event('hybrid_center_selected', {
  outcomeAlignment: number,
  centerStrength: string,
  connectedSeeds: number
});

// Document Completion
event('outcome_document_completed', {
  mode: 'outcome-driven' | 'hybrid',
  sectionsCompleted: number,
  totalWords: number,
  totalTime: number,  // minutes
  suggestionsUsed: number,
  templateUsed: boolean,
  wholenessScore?: number,  // If calculated
  outcomeAchieved: boolean  // User self-report
});

// Abandonment
event('outcome_writing_abandoned', {
  mode: string,
  abandonPoint: 'outcome-definition' | 'structure-review' | 'section-N' | 'complete',
  sectionsCompleted: number,
  wordsWritten: number,
  reason?: string  // If user provides feedback
});
```

**Dashboard Metrics**:

```
Daily Active Users:
- By mode: seed-based, outcome-driven, hybrid
- New users vs returning
- Cross-mode usage (users trying multiple)

Adoption Funnel:
- Started outcome definition → 100%
- Generated structure → 85%
- Started writing → 75%
- Completed document → 55%

Quality Metrics:
- Average wholeness score by mode
- Completion rate by mode
- Time to completion by mode
- User satisfaction (NPS) by mode

Cost Metrics:
- Average cost per document by mode
- Monthly cost per user
- Cost per feature (structure, suggestions, hybrid)
- Cost outliers (>$0.50 operations)

Template Metrics:
- Template usage rate
- Most popular templates
- Template completion rates
- Custom template creation rate
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-07 | PM Team | Initial specification based on user request for outcome-driven and hybrid writing capabilities |

---

## Approval

**Product Manager**: __________________ Date: __________

**Engineering Lead**: __________________ Date: __________

**UX Designer**: __________________ Date: __________

---

**End of Product Specification**
