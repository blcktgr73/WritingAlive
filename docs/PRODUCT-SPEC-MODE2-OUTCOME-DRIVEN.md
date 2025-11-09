# Product Specification: Mode 2 - Outcome-Driven Writing

**Feature ID**: MODE-2-OUTCOME-DRIVEN
**Version**: 1.0
**Status**: Ready for Technical Design
**Target**: Professional knowledge workers (40% of addressable market)
**Last Updated**: 2025-11-08

---

## Product Vision Summary

Enable **top-down goal-oriented writing** for professionals who know what they need to write but face blank-page paralysis. Transform "I need to write a Q4 retrospective by Friday" into a 35-minute guided writing session that maintains Saligo principles (small steps, low energy barriers) within intentional structure.

**Innovation**: Saligo Writing + Outcome Awareness = Intentional Discovery
- Not rigid outlining - structure evolves as you write
- Not freeform discovery - purpose guides each step
- **Best of both**: Small truthful steps toward defined goals

---

## Success Metrics

### Primary KPIs (Must-Have)

1. **Mode Selection Accuracy**: 90%
   - Users choose outcome mode when appropriate for context
   - Validated via 3-question decision quiz

2. **Completion Rate**: 70%
   - vs 60% for seed-based mode
   - Structure reduces abandonment

3. **Time to First Sentence**: <5 minutes
   - 2-3 min outcome definition
   - 3-5 sec structure generation
   - Maintains low energy barrier

4. **Cost per Document**: $0.005-0.010
   - 10x cheaper than seed-based center discovery
   - Structure generation only, minimal token usage

### Secondary KPIs (Should-Have)

5. **Professional User Adoption**: 2x growth
   - From 20% to 40% of user base
   - Measured via document type tagging

6. **Document Creation Time**: 30-40 minutes
   - vs 60-90 min traditional outline-first
   - 40-60% time savings

7. **Template Usage**: 60%
   - Users leverage pre-built templates
   - Reduces outcome definition friction

---

## Core User Stories (Priority Order)

### US-1: Define Outcome Efficiently (P0 - MVP Blocker)

**As a** product manager with tight deadlines,
**I want** to define my writing goal in 2-3 minutes without traditional outlining,
**So that** I can start writing immediately with clear direction.

**Acceptance Criteria**:
- [ ] Outcome definition modal opens from command palette
- [ ] Required fields: Outcome description (50-500 chars)
- [ ] Optional fields: Audience, topics, length preference
- [ ] Character counter prevents too-short/too-long inputs
- [ ] Example outcomes shown for common document types
- [ ] Auto-save allows resume if interrupted
- [ ] Total time from command to structure: <3 minutes

**User Flow**:
```
Command Palette → "Start Outcome-Driven Writing" → Modal opens
→ Enter: "Q4 Product Retrospective for team and VP"
→ Audience: "Engineering team and leadership"
→ Topics: "Wins, challenges, lessons, action items"
→ Length: Medium (3-5 pages)
→ [Generate Structure] → 3-5 seconds → Structure preview
```

---

### US-2: Review and Customize AI Structure (P0 - MVP Blocker)

**As a** technical writer following templates,
**I want** to review and edit AI-generated document structure before writing,
**So that** I can ensure it matches organizational requirements.

**Acceptance Criteria**:
- [ ] Structure displayed with 3-5 sections
- [ ] Each section shows: title, purpose, estimated words/time, writing prompt
- [ ] User can: add section, remove section, reorder, edit titles/prompts
- [ ] Total estimated time shown (sections sum to realistic total)
- [ ] "Reset to AI suggestion" available after edits
- [ ] [Start Writing] button enabled after review
- [ ] Structure saved to document frontmatter

**UI Requirements**:
- Visual progress bars showing effort distribution per section
- Clear section purposes (not vague "Introduction")
- Low-energy writing prompts (not "Write 500 words about...")
- Drag-and-drop reordering support

---

### US-3: Write Section-by-Section with Guidance (P0 - MVP Blocker)

**As a** consultant writing client proposals,
**I want** to write one section at a time with AI prompts guiding each step,
**So that** I maintain writing momentum without planning paralysis.

**Acceptance Criteria**:
- [ ] Section-focused UI shows current section context
- [ ] Progress indicator: Section N/M, X% complete overall
- [ ] Writing prompt displayed for current section
- [ ] Distraction-free text input with markdown support
- [ ] Real-time word count vs target estimate
- [ ] [Suggest Next Steps] provides 2-3 expansion directions
- [ ] [Mark Complete] validates section, moves to next
- [ ] [Save Draft] preserves progress, allows resume
- [ ] Auto-save every 30 seconds

**Section Navigation**:
- Can jump between sections (not strictly sequential)
- Previous sections remain editable
- Completed sections marked ✅ in sidebar

---

### US-4: Get AI Next Steps Within Outcome Context (P0 - MVP Blocker)

**As a** writer mid-section feeling stuck,
**I want** AI suggestions that remember my document outcome and section purpose,
**So that** I stay aligned with my goal while expanding content.

**Acceptance Criteria**:
- [ ] [Suggest Next Steps] analyzes current section + overall outcome
- [ ] Returns 2-3 specific directions (not generic "add more details")
- [ ] Each suggestion shows: title, rationale, outcome impact, content hints
- [ ] Suggestion types: deepen, connect to outcome, complete section
- [ ] Response time: <3 seconds
- [ ] Cost: ~$0.003-0.005 per suggestion set
- [ ] Suggestions append to document for reference

**Outcome-Aware Behavior**:
- Detects drift from outcome → suggests realignment
- Identifies missing outcome requirements → prompts coverage
- Recognizes section near completion → suggests finishing touches

---

### US-5: Complete Document with Outcome Achievement (P1 - Post-MVP)

**As a** professional writer finishing a structured document,
**I want** to verify I've achieved my stated outcome before finalizing,
**So that** I deliver complete, coherent work aligned with stakeholder needs.

**Acceptance Criteria**:
- [ ] All sections marked complete
- [ ] Document assembled with frontmatter metadata
- [ ] Outcome achievement self-assessment prompt
- [ ] Automatic document statistics: sections, words, time spent
- [ ] Export options: PDF, Word, Obsidian note
- [ ] Template saved if user wants to reuse structure

**Validation Checks (Soft Warnings)**:
- Word counts within 80-120% of estimates?
- All outcome topics covered?
- Section purposes fulfilled? (AI check)
- User can override and complete anyway

---

### US-6: Use Templates for Common Document Types (P1 - Post-MVP)

**As a** professional writing similar documents repeatedly,
**I want** to select from pre-built templates matching my document type,
**So that** I skip outcome definition and jump straight to writing.

**Acceptance Criteria**:
- [ ] Template library with 10+ professional templates
- [ ] Categories: Professional, Academic, Documentation
- [ ] Templates include: sections, prompts, structure, audience
- [ ] User can browse, preview, and select template
- [ ] Template populates outcome modal fields
- [ ] User can customize before using
- [ ] Save custom templates for reuse

**Built-In Templates (MVP)**:
1. Project Retrospective (Wins, Challenges, Lessons, Actions)
2. Technical Specification (Overview, API, Auth, Errors, Examples)
3. Product Proposal (Problem, Solution, Approach, Metrics, Timeline)
4. Status Report (Summary, Progress, Blockers, Next Steps)
5. Meeting Summary (Decisions, Action Items, Follow-ups)

---

### US-7: Resume Partial Documents (P1 - Post-MVP)

**As a** writer who paused mid-document,
**I want** to resume exactly where I left off with context preserved,
**So that** I don't waste time re-orienting.

**Acceptance Criteria**:
- [ ] Partial documents marked with progress in frontmatter
- [ ] Resume prompt shows: "Section N in progress (X words written)"
- [ ] [Resume Writing] opens section-by-section view at current section
- [ ] Previous sections' content preserved
- [ ] Remaining sections still show prompts
- [ ] Can restart from beginning if desired
- [ ] No data loss from interruptions

---

## Key Features (Implementation Checklist)

### Feature 1: Outcome Definition Interface

**Components**:
- [ ] `OutcomeDefinitionModal.tsx` - Main input interface
- [ ] `OutcomeManager.ts` - Service layer for outcome operations
- [ ] Outcome YAML schema in frontmatter
- [ ] Validation: min 50 chars, max 500 chars
- [ ] Auto-detection of document type from keywords
- [ ] Example outcomes library (5+ examples)

**Data Structure**:
```yaml
outcome:
  description: "Q4 Product Retrospective for team and VP"
  audience: "Engineering team and leadership"
  topics: ["wins", "challenges", "lessons", "actions"]
  length_preference: "medium"
  document_type: "retrospective"
```

---

### Feature 2: AI Structure Generation

**Components**:
- [ ] `StructureGenerator.ts` - AI-powered structure creation
- [ ] AI prompt template for outcome → structure
- [ ] Structure validation (2-6 sections, realistic estimates)
- [ ] Cost tracking ($0.005-0.010 target)
- [ ] Performance target: <5 seconds 95th percentile

**AI Prompt Strategy**:
```typescript
// Input: Outcome description, audience, topics, length
// Output: 3-5 sections with titles, purposes, prompts, estimates
// Constraints: Saligo principles (low-energy prompts, small steps)
```

**Structure Output**:
```json
{
  "title": "Q4 Product Retrospective",
  "sections": [
    {
      "id": "section-1",
      "title": "Executive Summary",
      "purpose": "High-level outcomes for leadership",
      "estimatedWords": 200,
      "estimatedMinutes": 5,
      "writingPrompt": "Summarize the key achievement in 1-2 sentences..."
    }
    // ... 3-4 more sections
  ],
  "totalEstimatedWords": 1200,
  "totalEstimatedMinutes": 35
}
```

---

### Feature 3: Structure Editing UI

**Components**:
- [ ] `StructurePreviewModal.tsx` - Review and edit interface
- [ ] Section editing: add, remove, reorder, modify
- [ ] Drag-and-drop reordering
- [ ] Visual effort distribution (progress bars)
- [ ] Reset to AI suggestion button

**Edit Operations**:
- Add Section: Insert at any position, AI suggests prompt
- Remove Section: Soft delete (mark optional)
- Edit Section: Change title, purpose, prompt, word estimate
- Reorder: Drag-and-drop with dependency warnings

---

### Feature 4: Section-by-Section Writing View

**Components**:
- [ ] `SectionWritingView.tsx` - Focused writing interface
- [ ] Progress indicator (current section, overall %)
- [ ] Section context display (title, purpose, prompt, estimate)
- [ ] Markdown editor with auto-save (30s interval)
- [ ] Section navigation sidebar
- [ ] Action buttons: Suggest Next Steps, Mark Complete, Save Draft

**UI Layout**:
```
┌─────────────────────────────────────────┐
│ Progress: Section 2/4 (100/300 words)   │ ← Header
├─────────────────────────────────────────┤
│ 🎯 What Went Well                       │ ← Section Context
│ 💡 List 3-5 wins with impact...         │
├─────────────────────────────────────────┤
│                                         │
│ [Writing area - markdown editor]        │ ← Main Area
│                                         │
├─────────────────────────────────────────┤
│ [💡 Next Steps] [✅ Complete] [💾 Save] │ ← Actions
└─────────────────────────────────────────┘
│ ✅ Section 1                            │ ← Sidebar
│ ▶️  Section 2 (current)                 │
│ ⏸️  Section 3                           │
│ ⏸️  Section 4                           │
└─────────────────────────────────────────┘
```

---

### Feature 5: Outcome-Aware Next Steps

**Components**:
- [ ] `OutcomeAwareExpansion.ts` - Enhanced AI prompting
- [ ] Next steps analysis considering outcome + section context
- [ ] Suggestion types: deepen, realign, complete, connect
- [ ] Response format: title, rationale, outcome impact, hints

**AI Prompt Enhancement**:
```typescript
const prompt = `
CONTEXT:
- Document Outcome: "${outcome.description}"
- Current Section: "${section.title}" (Purpose: ${section.purpose})
- Section Progress: ${currentWords} / ${targetWords} words

CURRENT CONTENT:
${sectionContent}

TASK: Suggest 2-3 next steps that:
1. Continue this section toward completion
2. Serve the overall document outcome
3. Align with section purpose
4. Enable low-energy iteration

Identify if content is drifting from outcome and suggest realignment.
`;
```

---

### Feature 6: Document Creation & Assembly

**Components**:
- [ ] `OutcomeDocumentCreator.ts` - Final document assembly
- [ ] YAML frontmatter with outcome metadata
- [ ] Section content aggregation
- [ ] Progress tracking (sections completed, time spent)
- [ ] Export functionality

**Document Template**:
```markdown
---
title: "Q4 Product Retrospective"
created: 2025-11-08T14:30:00
mode: outcome-driven
outcome:
  description: "Q4 Product Retrospective for team and VP"
  audience: "Engineering team and leadership"
  document_type: "retrospective"
sections_completed: 4
total_words: 1350
writing_time: 38
tags: [outcome-driven, retrospective, Q4]
---

# Q4 Product Retrospective

## Executive Summary
[User content from Section 1]

## What Went Well
[User content from Section 2]

## Challenges & Solutions
[User content from Section 3]

## Lessons & Action Items
[User content from Section 4]

---

💡 *This document was created using WriteAlive's Outcome-Driven mode.*
*Writing time: 38 minutes | Sections: 4 | Words: 1,350*
```

---

### Feature 7: Template Library (P1)

**Components**:
- [ ] `TemplateLibrary.ts` - Template storage and retrieval
- [ ] `TemplateSelectionModal.tsx` - Browse and select UI
- [ ] Template schema definition
- [ ] Built-in templates (10+ professional types)
- [ ] Custom template creation (user-defined)

**Template Schema**:
```typescript
interface DocumentTemplate {
  id: string;
  name: string;
  category: "professional" | "academic" | "documentation";
  description: string;
  outcomeTemplate: string;
  defaultSections: Section[];
  documentType: string;
  lengthPreference: "short" | "medium" | "long";
  audience: string;
}
```

---

## Critical Requirements

### Performance Constraints

1. **Structure Generation**: <5 seconds (95th percentile)
   - Rationale: User waiting before writing
   - Measurement: P95 latency from modal submission to structure display

2. **Next Steps Suggestions**: <3 seconds (average)
   - Rationale: Real-time writing guidance needs responsiveness
   - Measurement: Mean response time

3. **Auto-Save**: Every 30 seconds, <500ms
   - Rationale: Prevent data loss without interrupting flow
   - Measurement: Save operation duration

---

### Cost Constraints

1. **Structure Generation**: $0.005-0.010 per document
   - Input: ~500 tokens (outcome + prompt)
   - Output: ~600 tokens (4 sections @ 150 tokens each)
   - Model: Claude 3.5 Sonnet
   - Calculation: (500/1000 * $0.003) + (600/1000 * $0.015) = ~$0.011

2. **Next Steps Suggestions**: $0.003-0.005 per suggestion set
   - Input: ~600 tokens (section content + prompt)
   - Output: ~400 tokens (2-3 suggestions)
   - Calculation: (600/1000 * $0.003) + (400/1000 * $0.015) = ~$0.008

3. **Monthly Budget per Active User**: $8-15
   - Assumes: 15 outcome docs + 60 suggestions/month
   - Calculation: (15 * $0.011) + (60 * $0.008) = $0.645

4. **Cost Transparency**:
   - Show estimated cost before structure generation
   - Track cumulative cost per document in frontmatter
   - Monthly cost dashboard in settings

---

### UX Requirements

1. **Mode Selection Clarity**: 90% accuracy
   - 3-question quiz helps indecisive users
   - Clear use case descriptions
   - Examples resonate with target personas
   - Validation: User testing + analytics

2. **Outcome Input Ease**: <2 minutes
   - Measured: Modal open to structure generation
   - Simplified fields (only description required)
   - Examples reduce cognitive load
   - Template shortcuts for common types

3. **Writing Flow Continuity**:
   - Max 3 clicks between sections
   - Auto-save prevents any data loss
   - Section navigation always visible
   - Can pause/resume anytime without friction

4. **Keyboard Accessibility**:
   - Tab navigation through all UI elements
   - Enter to submit forms
   - Keyboard shortcuts for common actions
   - Screen reader compatible

---

## Out of Scope (Deferred to Mode 3: Hybrid)

The following features are **explicitly NOT part of Mode 2** and will be addressed in Hybrid Mode:

1. **Seed Integration**: Outcome-driven is seed-free
   - Deferred to: Mode 3 (Hybrid: Outcome + Seeds)
   - Rationale: Mode 2 serves users with clear goals but no existing research

2. **Outcome-Aligned Center Discovery**: Not needed without seeds
   - Deferred to: Mode 3 (Hybrid)
   - Rationale: Centers emerge from seeds, not outcomes alone

3. **Outcome Alignment Scoring**: Only relevant with seeds
   - Deferred to: Mode 3 (Hybrid)
   - Rationale: Measures how well centers serve outcome using seed content

4. **Cross-Mode Workflows**: Switching between modes mid-document
   - Deferred to: Post-MVP enhancement
   - Rationale: Adds complexity, validate single-mode usage first

5. **Collaborative Outcomes**: Team-shared writing goals
   - Deferred to: Phase 4 (Advanced Features)
   - Rationale: Power user feature, needs validation

6. **Outcome Evolution**: Refining outcome mid-writing
   - Deferred to: Phase 4
   - Rationale: Nice-to-have, not MVP blocker

7. **Multi-Document Outcome Tracking**: Outcomes spanning multiple docs
   - Deferred to: Phase 4
   - Rationale: Advanced use case (thesis chapters)

---

## Future Enhancements (Post-Mode 2 Launch)

### Phase 2 Enhancements (After Mode 3 Hybrid)

1. **Template Marketplace**:
   - Users share custom templates
   - Rating and review system
   - Template categories and search
   - Import/export functionality

2. **Smart Outcome Suggestions**:
   - AI learns from user's past documents
   - "You often write retrospectives - create one now?"
   - Pattern recognition from document history

3. **Section Subsections** (Nested Structure):
   - Support 2-level deep nesting
   - Large documents (thesis chapters, long reports)
   - Subsection-specific prompts

4. **Advanced Validation**:
   - Structural coherence analysis (wholeness scoring)
   - Tone consistency checking
   - Audience alignment validation
   - Citation/reference checks (academic)

### Phase 3 Enhancements (Long-Term)

5. **Outcome Refinement Mid-Stream**:
   - Detect better outcome while writing
   - Suggest outcome pivots
   - Preserve original outcome for comparison

6. **Collaborative Outcomes**:
   - Team-defined shared writing goals
   - Multi-author section assignment
   - Progress visibility for team leads

7. **Outcome Evolution Tracking**:
   - Version history for outcomes
   - Compare how outcome changed during writing
   - Learn from outcome evolution patterns

8. **AI-Generated Templates**:
   - "Create template from this document"
   - Generalize structure for reuse
   - Template recommendation engine

---

## Edge Cases & Error Handling

### EC-1: Vague Outcome Definition

**Scenario**: User enters "I want to write something good"

**Detection**:
- Keyword check: Generic verbs (write, create, make)
- Semantic analysis: Lack of specific topic/document type
- Length check: <30 characters

**Handling**:
```
⚠️ Your outcome is very broad. Try being more specific:
  - What type of document? (report, essay, proposal...)
  - What topic or question?
  - Who will read it?

Examples:
  ✅ "Q4 retrospective for team covering wins and challenges"
  ✅ "API tutorial for beginners using our REST endpoints"
  ❌ "Write something good" (too vague)

[Try Again] [Use Seed-Based Mode Instead]
```

**Acceptance Criteria**:
- [ ] Vague outcomes detected with 90%+ accuracy
- [ ] Warning helpful, not frustrating
- [ ] Examples inspire specificity
- [ ] Can proceed anyway (soft warning, not blocker)

---

### EC-2: User Abandons Mid-Section

**Scenario**: User writes 100 words in Section 2, closes modal, doesn't return for days

**Auto-Save Behavior**:
- Draft saved every 30 seconds
- Document created with partial content
- Frontmatter tracks progress

**Resume Flow**:
```
You have an incomplete outcome-driven document:
  📄 "Q4 Product Retrospective"
  ✅ Section 1 complete (200 words)
  ▶️ Section 2 in progress (100/300 words)
  ⏸️ Section 3 not started
  ⏸️ Section 4 not started

[Resume Writing] [Start Over] [View Document]
```

**Acceptance Criteria**:
- [ ] No data loss from abandonment
- [ ] Resume exactly where left off
- [ ] Can view partial document in Obsidian
- [ ] Can abandon and restart if desired

---

### EC-3: Generated Structure Doesn't Fit

**Scenario**: Outcome is "Project retrospective" but AI generates blog post structure

**Prevention**:
- Strong document type detection from keywords
- Validation against known templates
- Structure review step before writing

**Recovery**:
```
The generated structure may not match your needs.
Expected: Retrospective
Generated sections look like: Blog post (intro, body, conclusion)

[Regenerate Structure] [Edit Manually] [Use Anyway]
```

If user clicks [Regenerate]:
```
What's wrong with this structure?
( ) Wrong document type (expected retrospective, got blog)
( ) Missing required sections
( ) Too shallow / too deep
( ) Sections don't match my needs

[Regenerate with Feedback]
```

**Acceptance Criteria**:
- [ ] Mismatch rate <10%
- [ ] Regeneration improves alignment >80% of time
- [ ] Feedback loop improves AI prompts over time
- [ ] Manual editing always available fallback

---

### EC-4: User Writes Way Beyond Estimates

**Scenario**: Section 1 estimated 200 words, user writes 800 words

**Handling**:
- No blocking, just informational warnings
- Update total document estimate dynamically

**Warning Display**:
```
📊 Section 1: 800 / 200 words (400% of estimate)

This section grew significantly. Consider:
  • Splitting into 2 sections?
  • Reducing other sections to maintain total length?
  • Continuing as-is (estimates will adjust)

[Split Section] [Continue Writing] [Adjust Estimates]
```

**Acceptance Criteria**:
- [ ] Estimates flexible, not rigid
- [ ] User can ignore warnings
- [ ] Split section option available
- [ ] Total document estimate updates

---

### EC-5: AI Suggestion Not Helpful

**Scenario**: User clicks [Suggest Next Steps], but suggestions feel generic

**Feedback Loop**:
```
Were these suggestions helpful?
( ) Very helpful - used one
( ) Somewhat helpful - gave me ideas
( ) Not helpful - too generic
( ) Not helpful - off-topic

[Submit Feedback] [Skip]
```

**If "Not helpful" selected**:
- Log to analytics (improve prompts over time)
- Offer [Regenerate Suggestions] with more context
- Suggest [Skip to Next Section] if truly stuck

**Acceptance Criteria**:
- [ ] Feedback mechanism non-intrusive
- [ ] Can regenerate suggestions
- [ ] Analytics track helpfulness rates
- [ ] Target: >70% "helpful" rating

---

## Implementation Roadmap

### Phase 1: MVP (4-6 weeks)

**Goal**: Ship basic outcome-driven writing with professional templates

**Week 1-2: Foundation**
- [ ] Outcome definition modal UI
- [ ] OutcomeManager service
- [ ] YAML frontmatter schema
- [ ] Validation logic

**Week 3-4: AI Structure Generation**
- [ ] StructureGenerator service
- [ ] AI prompt engineering (outcome → structure)
- [ ] Structure preview modal
- [ ] Structure editing UI

**Week 5-6: Writing Experience**
- [ ] SectionWritingView component
- [ ] Section navigation
- [ ] Auto-save implementation
- [ ] Document assembly

**Success Criteria**:
- [ ] 30% of active users try outcome mode in first month
- [ ] 65% completion rate (target: 70%)
- [ ] Average doc creation time <45 min
- [ ] Structure quality >80% satisfaction

---

### Phase 2: Polish (2-3 weeks)

**Goal**: Add templates, next steps, and refinements

**Week 7-8: Templates**
- [ ] Template library (10+ built-in)
- [ ] Template selection UI
- [ ] Template application logic
- [ ] Custom template creation

**Week 9: Outcome-Aware Next Steps**
- [ ] Enhanced AI prompting for next steps
- [ ] Outcome drift detection
- [ ] Realignment suggestions
- [ ] Performance optimization

**Success Criteria**:
- [ ] 60% template usage rate
- [ ] Next steps helpfulness >70%
- [ ] Cost per doc <$0.012
- [ ] Time to first sentence <5 min

---

### Phase 3: Mode Integration (1-2 weeks)

**Goal**: Integrate with existing WriteAlive system

**Week 10-11: Integration**
- [ ] Mode selection interface (quiz)
- [ ] Command palette integration
- [ ] Ribbon button support
- [ ] Settings UI
- [ ] Tutorial/onboarding

**Success Criteria**:
- [ ] Mode selection accuracy 90%
- [ ] Onboarding completion 70%
- [ ] No regressions in seed-based mode
- [ ] Smooth workflow transitions

---

## Technical Dependencies

### Required Services

1. **AI Service** (Existing - Extend):
   - Add `generateStructureFromOutcome()` method
   - Add outcome-aware prompt templates
   - Cost tracking for outcome operations

2. **Document Creator** (Existing - Extend):
   - Support outcome metadata in frontmatter
   - Section-based document assembly
   - Progress tracking fields

3. **New Services** (Create):
   - `OutcomeManager.ts` - Outcome CRUD operations
   - `StructureGenerator.ts` - AI structure generation
   - `TemplateLibrary.ts` - Template storage/retrieval

### UI Components (New)

1. `OutcomeDefinitionModal.tsx` - Outcome input
2. `StructurePreviewModal.tsx` - Review/edit structure
3. `SectionWritingView.tsx` - Section-by-section writing
4. `TemplateSelectionModal.tsx` - Browse templates

### Data Schema Extensions

**Frontmatter Fields** (New):
```yaml
mode: "outcome-driven"  # NEW
outcome:  # NEW
  description: string
  audience?: string
  topics?: string[]
  length_preference?: "short" | "medium" | "long"
  document_type?: string
writing_progress:  # NEW
  sections_total: number
  sections_completed: number
  current_section?: string
  words_written: number
  time_spent_minutes: number
```

---

## Validation & Testing

### User Acceptance Testing

1. **Mode Selection Test**:
   - 20 users given scenarios
   - Measure: Correct mode chosen
   - Target: 90% accuracy

2. **Outcome Definition Test**:
   - 15 users define 3 outcomes each
   - Measure: Time to structure generation
   - Target: <3 minutes average

3. **Writing Flow Test**:
   - 10 users complete full document
   - Measure: Completion rate, time, satisfaction
   - Target: 70% completion, 30-45 min, 85% satisfaction

### Performance Testing

1. **Structure Generation Load**:
   - 100 concurrent outcome definitions
   - Measure: P50, P95, P99 latency
   - Target: P95 <5 seconds

2. **Cost Analysis**:
   - 1000 structure generations
   - Measure: Mean, median, P95 cost
   - Target: Mean <$0.012

3. **Auto-Save Reliability**:
   - 100 interrupted sessions
   - Measure: Data loss rate
   - Target: 0% data loss

---

## Analytics Instrumentation

### Events to Track

```typescript
// Outcome Definition
event('outcome_defined', {
  outcomeLength: number,
  hasAudience: boolean,
  hasTopics: boolean,
  documentType: string,
  templateUsed: boolean,
  timeSpent: number
});

// Structure Generation
event('structure_generated', {
  sectionCount: number,
  totalEstimatedWords: number,
  generationTime: number,
  cost: number,
  userEdited: boolean
});

// Section Completion
event('section_completed', {
  sectionIndex: number,
  actualWords: number,
  timeSpent: number,
  suggestionsUsed: number
});

// Document Completion
event('outcome_document_completed', {
  sectionsCompleted: number,
  totalWords: number,
  totalTime: number,
  outcomeAchieved: boolean  // self-report
});

// Abandonment
event('outcome_writing_abandoned', {
  abandonPoint: string,
  sectionsCompleted: number,
  wordsWritten: number
});
```

---

## Appendix: Sample Templates

### Template 1: Project Retrospective

```typescript
{
  id: "project-retrospective",
  name: "Project Retrospective",
  category: "professional",
  description: "Reflect on completed project with wins, challenges, and lessons",
  outcomeTemplate: "{Project} retrospective for {audience}",
  defaultSections: [
    {
      title: "Executive Summary",
      purpose: "High-level outcomes for leadership",
      estimatedWords: 200,
      estimatedMinutes: 5,
      writingPrompt: "Summarize the key achievement in 1-2 sentences. What's the one thing leadership should remember?",
      required: true,
      order: 1
    },
    {
      title: "What Went Well",
      purpose: "Celebrate successes and show impact",
      estimatedWords: 400,
      estimatedMinutes: 10,
      writingPrompt: "List 3-5 major wins. For each, describe impact in 2-3 sentences.",
      required: true,
      order: 2
    },
    {
      title: "Challenges & How We Overcame Them",
      purpose: "Honest reflection on obstacles",
      estimatedWords: 400,
      estimatedMinutes: 10,
      writingPrompt: "Identify 2-3 major obstacles. How did the team respond?",
      required: true,
      order: 3
    },
    {
      title: "Lessons & Action Items",
      purpose: "Forward-looking, actionable insights",
      estimatedWords: 300,
      estimatedMinutes: 8,
      writingPrompt: "What patterns did you notice? What will you do differently next time?",
      required: true,
      order: 4
    }
  ],
  documentType: "retrospective",
  lengthPreference: "medium",
  audience: "Team and leadership"
}
```

### Template 2: Technical Specification

```typescript
{
  id: "technical-spec",
  name: "Technical Specification",
  category: "documentation",
  description: "API or system specification for developers",
  outcomeTemplate: "{System/API} specification for {audience}",
  defaultSections: [
    {
      title: "Overview",
      purpose: "Introduce system/API purpose and scope",
      estimatedWords: 300,
      estimatedMinutes: 8,
      writingPrompt: "What problem does this solve? Who is the intended user?",
      required: true,
      order: 1
    },
    {
      title: "Architecture",
      purpose: "Explain system design and components",
      estimatedWords: 500,
      estimatedMinutes: 15,
      writingPrompt: "Describe main components and how they interact. Include diagram if helpful.",
      required: true,
      order: 2
    },
    {
      title: "API Reference",
      purpose: "Document endpoints, parameters, responses",
      estimatedWords: 800,
      estimatedMinutes: 20,
      writingPrompt: "List each endpoint with: method, path, params, response format, example.",
      required: true,
      order: 3
    },
    {
      title: "Authentication",
      purpose: "Explain auth flow and security",
      estimatedWords: 400,
      estimatedMinutes: 10,
      writingPrompt: "How do users authenticate? What tokens/keys are needed?",
      required: true,
      order: 4
    },
    {
      title: "Error Handling",
      purpose: "Document error codes and troubleshooting",
      estimatedWords: 300,
      estimatedMinutes: 8,
      writingPrompt: "List common errors, their causes, and solutions.",
      required: true,
      order: 5
    },
    {
      title: "Examples",
      purpose: "Provide working code examples",
      estimatedWords: 400,
      estimatedMinutes: 12,
      writingPrompt: "Show 2-3 common use cases with full code examples.",
      required: false,
      order: 6
    }
  ],
  documentType: "specification",
  lengthPreference: "long",
  audience: "Developers"
}
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-08 | Product Management | Focused spec extracted from comprehensive product spec for Mode 2 implementation |

---

**End of Specification**
