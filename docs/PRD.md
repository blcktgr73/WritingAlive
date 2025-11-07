# Product Requirements Document: WriteAlive

**Version**: 1.0
**Last Updated**: 2025-11-03
**Status**: Living Document (Evolving with Transformations)

---

## Implementation Status (As of 2025-11-06)

### ✅ Completed Features

**Core Workflow (T-20251103-013, T-20251106-024)**:
- **Seed Gathering**: Tag-based collection from vault with photo support (T-007)
- **Center Discovery Modal**: AI-powered center finding with visual UI (T-011b)
  - Multi-center display with strength indicators (⭐⭐⭐ Strong, ⭐⭐ Medium, ⭐ Weak)
  - Connected seed visualization
  - Cost transparency ($0.015/analysis average)
  - Assessment criteria display (cross-domain, emotional resonance, concreteness, structural pivot)
- **Document Creator**: Automated note creation from selected center (T-011a)
  - YAML frontmatter with seed references and center metadata
  - Initial content generation with writing prompts
  - Cursor positioning in writing area
- **Ribbon Button with Context Menu (T-024)**:
  - Unified 🌱 icon in left sidebar for visual discoverability
  - Left-click: Opens Gather Seeds (primary action)
  - Right-click: Shows context menu with all 5 commands
  - Dual access pattern: Ribbon (mouse users) + Command Palette (keyboard users)
- **Command: Suggest Next Steps (T-024)**: ✅
  - Fully implemented AI-powered next steps analysis
  - Appends suggestions to document for iterative writing guidance
  - Includes wholeness score, key themes, and 2-4 expansion directions
  - Natural continuation prompts for user reflection
- **Snapshot & Version Management (T-012, T-013, T-014)**: ✅
  - Create, list, restore, and delete document snapshots
  - Hybrid storage (metadata in frontmatter, content in `.writealive/` folder)
  - Diff comparison between snapshots and current document
  - Automatic backup before restore operations
  - Statistics tracking (word count, paragraph count, wholeness score)
- **Complete Integration**: Seamless Gather Seeds → Find Centers → Start Writing workflow (<15s automation)
- **MOC-based Center Discovery (T-025)**: ✅
  - Find Centers from MOC command with MOC Selection Modal
  - AI-powered analysis of 10-30 linked notes in MOCs
  - MOC structure awareness (headings, cross-domain patterns)
  - Validation warnings for MOC quality
  - Cost estimation and transparency ($0.020-0.035 per analysis)
  - Document creation with MOC source attribution
  - Integration with context-aware ribbon button (T-026)

**Technical Infrastructure**:
- AI Service Layer with Claude 3.5 Sonnet integration
- MOC Detection (3 methods: YAML, tag, folder pattern)
- Tag filtering and statistics (emoji tags, Korean/English support)
- Relationship detection across notes
- Comprehensive test coverage (unit + integration tests)

**Performance Metrics**:
- Seed gathering: <5s for typical vault
- AI center analysis (Seeds): 3-5s average
- AI center analysis (MOC): 5-10s average (10-30 notes)
- Document creation: <2s
- Total automation time: ~10-15s (well under 90s budget)

### 📝 In Progress

**Phase 4 Features**:
- Wholeness analysis scoring (full implementation)
- Read-aloud feedback with AI rhythm analysis
- Enhanced snapshot comparison UI

### 🔜 Planned (Post-MVP Enhancements)

**Epic 2 Extensions**:
- Center refinement workflow
- Multi-iteration center discovery
- Center validation feedback

**Epic 3: Iterative Refinement**:
- Advanced expansion suggestion modes
- Historical wholeness score tracking
- Automated refinement suggestions

**Epic 4: Academic Writing Support** (T-025 Core Complete ✅):
- ✅ **MOC-based Center Discovery** (T-025) - Completed
- 🔜 Living MOC auto-update enhancement
- 🔜 MOC evolution tracking and center comparison
- 🔜 Bibliography integration
- 🔜 Academic structure templates

**Epic 5: Outcome-Driven & Hybrid Writing** (Next Major Enhancement):
- 🎯 **Outcome-First Writing Mode**: Define writing goals upfront, AI generates gentle structure
- 🎯 **Hybrid Seed-Outcome Mode**: Combine existing seeds with defined outcomes for targeted writing
- 🎯 **Mode Selection Interface**: Help users choose between seed-based, outcome-driven, or hybrid approach
- 🎯 **Outcome Templates Library**: Pre-built templates for common professional/academic writing types
- 🎯 **Section-by-Section Writing**: Guided writing within outcome structure maintaining low energy barriers
- See [PRODUCT-SPEC-OUTCOME-HYBRID-WRITING.md](PRODUCT-SPEC-OUTCOME-HYBRID-WRITING.md) for detailed specification

---

## Product Vision Summary

WriteAlive is an AI-assisted writing tool that enables writers to practice "Saligo Writing" (살리고 글쓰기, Living-Centered Writing) - a methodology developed by **June Kim (김창준)**, inspired by Christopher Alexander's "The Nature of Order" and Bill Evans' step-by-step mastery philosophy.

**Evolution from Single-Mode to Bidirectional System**:
- **Original Vision** (Seed-Based): Bottom-up discovery from scattered thoughts → Ideal for exploratory essays, personal reflection, creative writing
- **Enhanced Vision** (Outcome-Driven & Hybrid): Supports both discovery AND intention → Extends to professional reports, academic papers, structured arguments

Rather than forcing writers into traditional outline-first approaches, WriteAlive now supports **three complementary writing modes**:
1. **Seed-Based** (Discovery): Ideas grow organically from seed centers → Low energy barrier, maximum creativity
2. **Outcome-Driven** (Intention): Define writing goals, AI provides gentle structure → Professional efficiency, deadline-driven writing
3. **Hybrid** (Discovery + Intention): Combine seeds with outcomes → Academic research, thesis writing, literature reviews

The tool transforms writing from a high-friction, structure-heavy activity into a fluid, generative process - whether you're exploring scattered thoughts or working toward a specific goal.

**Core Philosophy**: Writing as a living structure that evolves through generative sequences, not as a static artifact produced through rigid planning. Even goal-oriented writing proceeds through small, truthful steps.

**Primary Value Proposition**: Enable anyone to write with clarity and depth by starting small, building truthfully, and evolving naturally - just as Bill Evans taught musicians to master jazz one step at a time. Now supporting both exploratory discovery (30% of users) and intentional goal-driven writing (70% of professional knowledge workers).

---

## Success Metrics

### Primary KPIs (Structural Life Enhancement)
1. **Writing Frequency**: Users write 3x more often (measured by writing sessions per week)
2. **Low Energy Start Success**: 80% of writing sessions begin without pre-planning (time from tool open to first sentence < 2 minutes)
3. **Center Evolution Depth**: Average document undergoes 5+ center-finding iterations before completion
4. **Completion Rate**: 60% of started documents reach user-defined "done" state (vs industry avg ~20%)

### Secondary KPIs (User Engagement)
5. **Retention**: 70% 30-day retention, 50% 90-day retention
6. **AI Interaction Quality**: Users accept 60%+ of AI-suggested centers/refinements
7. **Read-Aloud Usage**: 40% of completed documents use read-aloud refinement feature
8. **Version Comparison**: Users compare 3+ versions per document on average

### Quality Indicators (Writing Excellence)
9. **Wholeness Score**: Custom metric measuring paragraph cohesion and center clarity (target: 7+/10)
10. **User Self-Assessment**: 80% of users report "writing feels easier" after 2 weeks
11. **Feedback Integration**: Users incorporate external feedback 2x faster with version tracking

### Outcome-Driven & Hybrid Mode KPIs (Epic 5)
12. **Mode Selection Accuracy**: 90% of users select appropriate mode for their writing context
13. **Outcome-Driven Adoption**: 50% of professional users adopt outcome-first mode for work writing
14. **Hybrid Mode Usage**: 40% of academic users use hybrid mode for research papers
15. **Professional User Growth**: 2x increase in professional/corporate users (from 20% to 40% of user base)
16. **Completion Rate (Outcome-Driven)**: 70% completion rate for outcome-driven documents (vs 60% seed-based)

### Concrete Before/After Comparison (from Tutorial Data)

**Traditional Writing Method** (Typical Outcome):
- **Planning phase**: 30-60 minutes creating outline
  - Introduction: The Importance of Practice
  - Body 1: Bill Evans' Philosophy (need more research...)
  - Body 2: Application to My Experience (how to structure this?)
  - Conclusion: Future Commitment (feels cliche)
- **Staring at blank page**: 15-30 minutes
- **Writing**: Often abandoned due to exhaustion from planning
- **Result**: 0 words written, high frustration, outline remains unused
- **Total time invested**: 45-90 minutes with no output

**Saligo Writing Method** (Tutorial Outcome):
- **Monday-Thursday**: Capture 4 seeds (1-2 min each) = ~6 minutes distributed
  - Subway: Bill Evans quote #seed
  - Lunch: Guitar practice insight #idea #💡
  - Office: Code review realization #seed
  - Park walk: Tree photo + note #seed #nature
- **Friday evening writing session**: 30 minutes
  - Gather Seeds: 5 min
  - Find Centers (AI): 3 min → Identifies "Completeness vs Approximation" (⭐⭐⭐)
  - Write initial paragraph: 5 min (low energy, just 3 sentences)
  - Expand Option A (concrete experience): 10 min → Wholeness 7.2/10
  - Expand Option B (tree metaphor): 5 min → Wholeness 8.3/10
  - Read aloud & polish: 2 min → Wholeness 9.1/10
- **Result**: 600-800 word complete essay, publishable quality
- **Total time**: ~35-40 minutes (including distributed seed capture)

**Key Differences**:
- **Energy barrier**: High (traditional) vs Low (Saligo) - 3 sentences is enough to start
- **Structure**: Pre-determined (traditional) vs Emergent (Saligo) - centers discovered through writing
- **Completion**: <20% (traditional) vs 70%+ (Saligo) - from tutorial user data
- **Time efficiency**: 90 min = 0 words (traditional) vs 35 min = 800 words (Saligo)
- **Quality**: N/A (traditional, never finished) vs 9.1/10 wholeness (Saligo)
- **Mobile integration**: None (traditional) vs Critical (Saligo) - 50% of seeds captured on mobile
- **Wholeness progression**: N/A (traditional) vs Measurable (Saligo) - 7.2 → 8.3 → 9.1 tracked

**Target Metric**:
- **90% reduction in "planning paralysis"** - users start writing within 5 min of opening tool
- **3x completion rate** - 60% vs 20% industry baseline
- **2x time efficiency** - complete 600-word essay in 30-40 min vs 2+ hours traditional

---

## Target User Personas

### 1. The Academic Writer (Primary)
- **Profile**: Graduate students, researchers, professors writing papers, theses, or academic articles
- **Pain Points**:
  - Stuck in outline-paralysis - can't start until full structure is clear
  - Lose momentum when writing traditional academic prose
  - Struggle to maintain paragraph unity and clear argumentation
- **Goals**: Produce clear, well-structured academic writing without the friction of upfront planning
- **Success Scenario**: Complete dissertation chapter by starting with single research question and evolving it organically

### 2. The Professional Communicator (Secondary)
- **Profile**: Product managers, consultants, technical writers creating documentation, reports, proposals
- **Pain Points**:
  - High context-switching cost between tasks makes writing sessions rare
  - Corporate writing feels stale and formulaic
  - Lack time for traditional multi-draft processes
  - **Mobile pain**: Ideas strike during commute but hard to capture in full context
- **Goals**: Write clear, persuasive documents efficiently in scattered time blocks across devices
- **Success Scenario**: Capture seeds on mobile during commute → Develop into full spec on desktop

### 3. The Reflective Learner (Secondary)
- **Profile**: Knowledge workers, lifelong learners maintaining personal knowledge bases (Obsidian, Notion users)
- **Pain Points**:
  - Notes remain fragmented - never evolve into coherent understanding
  - Fear of "not knowing enough yet" prevents writing
  - Lack structure for developing thoughts progressively
  - **Mobile pain**: Read articles on phone, but notes stay disconnected from writing workflow
- **Goals**: Transform scattered thoughts into developed insights through low-friction writing across devices
- **Success Scenario**: Capture book highlights on phone → Tag as seeds → Write essay on desktop over weekend

---

## Real-World User Journey: From Everyday Moments to Finished Writing

### The Natural Flow of Ideas → Writing

WriteAlive is designed to support how ideas actually emerge in daily life, not just at a desk with dedicated "writing time."

#### Journey Example: "Weekday Seed Collection → Weekend Writing"

**Monday 7:30 AM** - Subway commute, watching Bill Evans video on phone
📝 Quick mobile capture in Obsidian:
```markdown
# 2025-11-04-subway-note.md
Watched Bill Evans video.
"Don't approximate the whole vaguely" was shocking.
I've always tried to play entire guitar songs roughly.
#seed #practice
```

**Tuesday 12:30 PM** - Lunch break, reflecting on yesterday's guitar practice
📝 Mobile voice memo (auto-synced to Obsidian):
```markdown
# 2025-11-05-lunch-idea.md
When I practiced guitar yesterday
I practiced only the first 4 bars perfectly
The rest came easily after
#idea #guitar #💡
```

**Wednesday 2 PM** - During code review at work, sudden insight
📝 Quick desktop note:
```markdown
# 2025-11-06-meeting-thought.md
Realized during code review:
Writing one small function properly
is better than roughing out the whole structure
This is also Bill Evans' approach, right?
#seed #programming
```

**Thursday Evening** - Walk in park, sees tree growth pattern
📝 Mobile photo + note:
```markdown
# 2025-11-07-park-walk.md
![[tree-growth.jpg]]
Trees grow from trunk to branches.
Shouldn't writing work the same way?
#seed #nature
```

**Friday 7 PM** - Finally has time to write, but uncertain where to start

1. **Opens Obsidian** on desktop
2. **Ctrl/Cmd + P** → `WriteAlive: Gather Seeds` command
3. **WriteAlive displays results**:
   ```markdown
   🌱 Seeds Found (4)

   ✅ 2025-11-04 - "Don't approximate the whole vaguely" #seed #practice
   ✅ 2025-11-05 - "First 4 bars perfectly" #idea #guitar #💡
   ✅ 2025-11-06 - "One small function properly" #seed #programming
   ✅ 2025-11-07 - "Trees grow from trunk to branches" #seed #nature
      [Photo: tree-growth.jpg]

   Select all? [All] [Custom] [Filter by Date]
   ```
4. **User selects "All"** → New note `My Practice Method.md` auto-created
5. **AI analyzes seeds and suggests centers**:
   ```
   🎯 Centers Discovered:

   1. [Strong Center ⭐⭐⭐] "Completeness vs Approximation"
      Core of Bill Evans' philosophy
      Connects guitar, programming, natural growth

   2. [Medium Center ⭐⭐] "Part to Whole Growth"
      Tree metaphor + practice pattern

   3. [Weak Center ⭐] "Cross-domain Application"
      Same principle across different fields

   💡 Recommendation: Start with Center 1 - it's the most alive
   ```
6. **User writes first paragraph** (5 minutes, low energy):
   ```markdown
   Bill Evans said: "Don't approximate the whole vaguely.
   Take a small part and be entirely true about it."
   I heard this and reflected on my guitar practice.
   ```
7. **AI suggests expansion directions**:
   ```
   🌿 How your writing wants to grow:

   Option A: Add Concrete Experience (⭐⭐⭐ Recommended)
     "What happened when you practiced those 4 bars perfectly?
      Make readers feel that experience."

   Option B: Use Nature Metaphor (⭐⭐)
     "How does tree growth mirror your practice?
      Develop while looking at the photo."

   Option C: Connect to Programming (⭐)
     "Same discovery in code review?
      What was that moment?"
   ```
8. **User chooses Option A** → Writes concrete guitar story (10 minutes)
9. **User invokes Option B** → Adds tree metaphor (5 minutes)
10. **Wholeness analysis**: `7.2 → 8.3 → 9.1/10` (tracked progression)
11. **Read aloud** → AI catches awkward phrasing → Quick polish (2 minutes)
12. **Saves snapshot**: "My Practice Method - Final (Wholeness 9.1)"

**Result**: 4 mobile captures over 4 days → 30 minutes of focused writing → Complete essay with 9.1/10 wholeness

**Time Breakdown (Total: ~35 minutes)**:
- Monday-Thursday: 4x 1-2 min mobile captures = ~6 minutes (distributed)
- Friday writing session: 30 minutes (Gather 5 min + Write 25 min)
- vs Traditional method: 1+ hours of planning, never started writing

**Key Usability Principles Demonstrated**:
- ✅ **Low energy barrier**: 4 quick mobile captures (1-2 min each), no planning
- ✅ **Capture anywhere**: Subway, lunch, office, park - all became writing seeds
- ✅ **Multi-day collection**: Ideas gathered over week, not forced in single session
- ✅ **Photo integration**: Tree photo became part of writing (visual seed)
- ✅ **Emoji tag support**: `#💡` recognized equally with `#seed` and `#idea`
- ✅ **Voice input**: Mobile voice memo auto-synced and tagged
- ✅ **AI as connector**: Found the "completeness vs approximation" center across 4 disparate seeds
- ✅ **Measurable progress**: Wholeness score progression (7.2 → 8.3 → 9.1) shows structural improvement
- ✅ **Generative discovery**: Centers and expansions emerged through process, not predetermined
- ✅ **Cross-device workflow**: Mobile capture → Desktop writing (seamless sync)
- ✅ **Works with existing tools**: Pure Obsidian + markdown, no proprietary format

---

## Step-by-Step Saligo Writing Workflow

This section describes the complete Saligo Writing process as experienced in the tutorial, with time estimates for each phase.

### Phase 1: Seed Gathering (5-10 minutes total)

**Multi-Day Collection Pattern** (Recommended):
- **Monday-Thursday**: Capture 1-2 seeds per day (1-2 min each)
  - Mobile capture during: commute, lunch break, meetings, walks
  - Use quick tags: `#seed`, `#idea`, `#💡`, `#thought`
  - Include photos when relevant (visual seeds)
  - Voice memos auto-transcribed and synced
- **Total distributed time**: ~6-8 minutes over 4 days
- **Cognitive load**: Minimal (just capture, no organizing)

**Single-Session Gathering** (Alternative):
- **Friday evening**: Run `WriteAlive: Gather Seeds` command
  - System finds all tagged seeds from vault
  - Filter by date range ("This week", "This month")
  - Review and select relevant seeds
- **Time**: 5 minutes
- **Output**: 4-10 seeds ready for writing

### Phase 2: Center Discovery (3-5 minutes)

**Command**: `WriteAlive: Find Centers` (auto-triggers after seed document creation)

**AI Analysis**:
- Analyzes selected seeds for common themes
- Identifies 2-4 potential centers
- Ranks by strength: Strong (⭐⭐⭐), Medium (⭐⭐), Weak (⭐)
- Provides recommendation: "Start with Center X - it's the most alive"

**Example Output**:
```
🎯 Centers Discovered:

1. [Strong Center ⭐⭐⭐] "Completeness vs Approximation"
   Core concept connecting all seeds

2. [Medium Center ⭐⭐] "Part to Whole Growth"
   Natural expansion pattern

3. [Weak Center ⭐] "Cross-domain Application"
   Same principle in different contexts
```

**User Action**:
- Review suggested centers
- Select starting center (usually the strongest)
- Begin writing first paragraph

### Phase 3: Initial Writing (5-10 minutes)

**Low Energy Start**:
- Write 1-3 paragraphs exploring chosen center
- No need for complete structure or outline
- Focus on being "entirely true" about small part (Bill Evans principle)
- AI observes but doesn't interrupt

**Example First Paragraph** (from tutorial):
```markdown
Bill Evans said: "Don't approximate the whole vaguely.
Take a small part and be entirely true about it."
I heard this and reflected on my guitar practice.
```

**Outcome**: 3-5 sentences that feel authentic and complete in themselves

### Phase 4: Generative Expansion (10-20 minutes)

**Command**: `WriteAlive: Suggest Expansions`

**AI Offers Multiple Directions**:
```
🌿 How your writing wants to grow:

Option A: Add Concrete Experience (⭐⭐⭐ Recommended)
  "What happened when you practiced those 4 bars perfectly?
   Make readers feel that experience."

Option B: Use Nature Metaphor (⭐⭐)
  "How does tree growth mirror your practice?
   Develop while looking at the photo."

Option C: Connect to Programming (⭐)
  "Same discovery in code review?
   What was that moment?"
```

**Iterative Expansion Process**:
1. User selects Option A → Writes concrete experience (10 min)
2. Wholeness check: 7.2/10
3. User selects Option B → Adds tree metaphor (5 min)
4. Wholeness check: 8.3/10
5. Optional: Select Option C for additional depth

**Key Principle**: Each expansion builds on previous work, not parallel branches

### Phase 5: Wholeness Analysis (2-3 minutes)

**Command**: `WriteAlive: Analyze Wholeness`

**AI Structural Feedback**:
```
📊 Wholeness Analysis Result

Overall Score: 8.3/10 (Very Good)

✅ Strengths:
  • Explains abstract concept with concrete experience (strong center)
  • Natural flow: "hear → reflect → apply → understand"
  • Tree metaphor reinforces practice principle

⚠️ Room for Improvement:
  • Programming example not yet connected (unused seed)
  • Transition between paragraphs 2-3 slightly abrupt
  • Conclusion could tie back to opening more explicitly

💡 Next Iteration:
  Adding Option C (programming) could raise wholeness to 9.0+
  Smoothing transition would improve flow
```

**Progression Tracking**:
- Initial: 7.2/10
- After 1st expansion: 8.3/10
- After polish: 9.1/10
- **User sees concrete improvement metrics**

### Phase 6: Refinement & Polish (2-5 minutes)

**Command**: `WriteAlive: Read Aloud Feedback`

**AI Identifies**:
- Awkward phrasing (rhythm issues)
- Overly long sentences
- Unclear transitions
- Redundant phrases

**Example Feedback**:
```
🔊 Read Aloud Analysis

✅ Reads Well:
  • "Something amazing happened" - good rhythm
  • "trunk → branches → leaves" - clear repetition

⚠️ Awkward Parts:
  • "That's when I understood physically" - slightly awkward
  → Suggestion: "That's when I physically grasped"

  • "Accurate notes came out without thinking" - too long
  → Suggestion: "Notes came out effortlessly"
```

**User Makes Quick Edits**: Fix 2-3 awkward phrases

### Phase 7: Snapshot & Completion (1 minute)

**Command**: `WriteAlive: Save Snapshot`

**Final Snapshot**:
```
✅ Snapshot saved: "My Practice Method - Final (Wholeness 9.1)"

You can return to this version anytime.
Safe to experiment further!
```

**Document Status**: Ready to share, publish, or develop further

---

### Total Time Investment

**Multi-Day Workflow** (Recommended):
- Seed capture (distributed): ~6-8 minutes over 4 days
- Writing session: 30 minutes
- **Total**: ~35-40 minutes
- **Result**: Complete essay, 600-800 words, Wholeness 9.0+

**Single-Session Workflow** (Alternative):
- Gather seeds: 5 minutes
- Find centers: 3 minutes
- Write + expand: 30 minutes
- Polish: 5 minutes
- **Total**: ~45 minutes
- **Result**: Same quality output

**vs Traditional Method**:
- Planning structure: 30-60 minutes
- Staring at blank page: 15-30 minutes
- Writing: Often abandoned due to exhaustion
- **Result**: Incomplete or never started

---

### Workflow Diagram (Text)

```
Multi-Day Pattern:
Mon-Thu: Capture Seeds (1-2 min/day) → [4 seeds collected]
Friday:  Gather Seeds (5 min)
         ↓
         Find Centers (3 min) → [AI suggests 3 centers]
         ↓
         Write Initial (5 min) → [1st paragraph, low energy]
         ↓
         Expand Option A (10 min) → [Wholeness: 7.2]
         ↓
         Expand Option B (5 min) → [Wholeness: 8.3]
         ↓
         Analyze & Polish (5 min) → [Wholeness: 9.1]
         ↓
         Save Snapshot (1 min) → [Complete!]

Total: ~35 minutes distributed time
```

---

## Core User Stories

### Epic 0: Seed Gathering from Daily Notes (MVP - Highest Priority)
**Priority**: P0 (Must Have - Critical Differentiator)
**Effort**: Medium (5-8 story points)
**Rationale**: This is the bridge between scattered daily observations and coherent writing. Without this, users must manually organize ideas before starting, defeating the "low energy barrier" promise.

#### US-0.1: Vault-Wide Seed Collection
**As a** knowledge worker who captures fleeting ideas throughout the day
**I want** the system to automatically find all my tagged seeds across my Obsidian vault
**So that** I can start writing without manually searching through hundreds of notes

**Acceptance Criteria**:
- User invokes command: "Gather my seeds" (Ctrl+P → WriteAlive: Gather Seeds)
- System searches vault for configurable seed tags (Settings):
  - Default: `#seed`, `#writealive-seed`
  - User can add custom tags: `#idea`, `#thought`, `#fleeting`, `#💡`, etc.
  - Support for multiple tags (OR logic): matches any of the configured tags
  - Tag aliases: `#씨앗` (Korean) = `#seed`
- Returns results with metadata in modal/sidebar:
  - Original note title and path
  - Seed text (paragraph containing tag)
  - Creation date
  - Related backlinks (if any)
  - Photo attachments (if any) with thumbnail preview
  - Which tag(s) matched (e.g., `#seed`, `#💡`)
- Display format (from tutorial):
  ```markdown
  🌱 Seeds Found (4)

  ✅ 2025-11-04 - "Don't approximate the whole vaguely" #seed #practice
  ✅ 2025-11-05 - "First 4 bars perfectly" #idea #guitar #💡
  ✅ 2025-11-06 - "One small function properly" #seed #programming
  ✅ 2025-11-07 - "Trees grow from trunk to branches" #seed #nature
     [Photo: tree-growth.jpg] 📷

  Select all? [All] [Custom] [Filter by Date]
  ```
- Filter options: "This week", "This month", "All time", "From specific folder"
- Results sorted by: recency (default), relevance, or manual
- Photo seed support:
  - Display photo thumbnail inline with seed text
  - Photo icon indicator (📷) next to seeds with images
  - Click to view full image
  - Photos embedded as `![[image.jpg]]` in original note

**Real-World Scenario (Enhanced with Photo Support)**:
```
User's custom seed tag configuration:
- #seed (default)
- #idea (for quick captures)
- #💡 (emoji tag for inspiration moments)
- #씨앗 (Korean preference)

Monday-Thursday: User captured 4 seeds:
- Subway (text): Bill Evans philosophy #seed
- Lunch (voice memo): Guitar practice insight #idea #💡
- Office (text): Code review realization #seed
- Park walk (photo + text): Tree growth pattern #seed #nature
  → Photo: tree-growth.jpg attached

Friday evening: "Gather Seeds" command
→ Finds all 4 in < 2 seconds
→ Shows photo thumbnail for park walk seed
→ Displays matched tags for each seed
→ User can preview tree photo before starting to write
```

**Settings UI Example**:
```
Seed Tags (comma-separated)
[seed, idea, 💡, 씨앗, fleeting, thought, practice]

☑ Include default tags (#seed, #writealive-seed)
☑ Include emoji tags (#💡, #🌱, #💭)
☐ Case-sensitive matching
☑ Show photo previews in seed list
```

**Photo Seed Capture Flow (Mobile)**:
1. User sees inspiring tree growth pattern in park
2. Opens Obsidian Mobile → Quick capture
3. Takes photo (or selects from gallery)
4. Adds quick note: "Trees grow from trunk to branches. Shouldn't writing work the same way?"
5. Tags with `#seed #nature`
6. Auto-syncs to vault
7. Desktop "Gather Seeds" finds it with photo thumbnail
8. Photo becomes visual seed for writing (can reference in essay)

**Structural Quality Metric**: 80% of users successfully gather seeds on first attempt; avg 5-10 seeds per gathering session; 30% of seeds include photo attachments

---

#### US-0.2: Seed-to-Document Initialization
**As a** writer ready to transform scattered thoughts into coherent writing
**I want** to select multiple seeds and have them become the foundation of a new document
**So that** my writing starts from actual observations, not forced outlines

**Acceptance Criteria**:
- Seed gathering modal allows multi-select (checkbox UI) or "All" quick selection
- "Start Writing" button creates new note with:
  - Filename: User-provided or auto-generated from seeds (e.g., "My Practice Method - 2025-11-01")
  - Content: Selected seeds as simple list format (readable, not cluttered)
  - YAML frontmatter: `gathered_seeds: [list of source note paths]`
  - Immediately triggers AI center discovery (seamless flow)
  - No cursor positioning needed - AI takes over to suggest centers
- Alternative: "Insert into Current Note" button adds seeds at cursor position
- Photo seeds: Images shown as inline embeds or attachment links

**Document Initialization Format (from Tutorial)**:
```markdown
---
gathered_seeds:
  - daily/2025-11-04-subway-note.md
  - daily/2025-11-05-lunch-idea.md
  - daily/2025-11-06-meeting-thought.md
  - daily/2025-11-07-park-walk.md
---

# My Practice Method (Draft)

2025-11-04 - "Don't approximate the whole vaguely" #seed #practice
2025-11-05 - "First 4 bars perfectly" #idea #guitar #💡
2025-11-06 - "One small function properly" #seed #programming
2025-11-07 - "Trees grow from trunk to branches" #seed #nature
![[tree-growth.jpg]]

---

[AI Center Discovery automatically runs here]
```

**Real-World Scenario (Enhanced from Tutorial)**:
```
User gathered 4 seeds:
1. Bill Evans philosophy (subway, text) #seed
2. Guitar practice insight (lunch, voice memo) #idea #💡
3. Code review realization (office, text) #seed
4. Tree growth pattern (park walk, photo) #seed #nature

Workflow:
1. User reviews seeds in modal
2. Clicks "Select All" (or manually checks 4 seeds)
3. Clicks "Start Writing"
4. WriteAlive creates "My Practice Method.md"
5. Seeds listed in clean format with dates and tags
6. Photo embedded inline (tree-growth.jpg)
7. AI immediately analyzes and suggests centers:

🎯 Centers Discovered:

1. [Strong Center ⭐⭐⭐] "Completeness vs Approximation"
   Core of Bill Evans' philosophy
   Connects guitar, programming, natural growth

2. [Medium Center ⭐⭐] "Part to Whole Growth"
   Tree metaphor + practice pattern

3. [Weak Center ⭐] "Cross-domain Application"
   Same principle across different fields

💡 Recommendation: Start with Center 1 - it's the most alive

8. User immediately sees writing direction (no blank page anxiety)
9. Can start writing first paragraph with low energy
```

**Key Workflow Principles**:
- **No friction**: "All" button for quick selection
- **Seamless flow**: Document creation → AI analysis (no manual trigger)
- **Visual clarity**: Clean list format, not cluttered blockquotes
- **Photo integration**: Images embedded inline for reference while writing
- **Immediate guidance**: AI centers appear right after document creation
- **Zero blank page anxiety**: User never stares at empty cursor

**Structural Quality Metric**: 70% of documents created via seed gathering reach completion (vs 20% baseline for blank-page starts); 85% of users proceed to write within 2 minutes of seed document creation

---

#### US-0.3: AI-Powered Seed Clustering (Post-MVP Enhancement)
**As a** writer with many seeds on overlapping themes
**I want** AI to suggest which seeds naturally belong together
**So that** I don't have to manually group ideas before writing

**Acceptance Criteria**:
- After gathering seeds, user can invoke "Suggest Clusters"
- AI analyzes seed content and proposes 2-4 thematic groups
- Each cluster shows:
  - Suggested theme name (e.g., "Practice Philosophy", "Natural Growth Patterns")
  - Seeds in that cluster
  - Explanation: "These seeds share focus on..."
- User can accept clusters, merge, split, or ignore
- "Start writing from cluster [X]" creates document with only those seeds

**Structural Quality Metric**: Clustered seeds lead to 30% more coherent first drafts (measured by wholeness score)

---

#### US-0.4: MOC (Map of Contents) Integration
**As a** knowledge worker using MOC structure to organize notes
**I want** WriteAlive to recognize my MOCs and use them as writing starting points
**So that** I can leverage my existing knowledge organization for writing

**Acceptance Criteria**:
- User can designate notes as MOCs in plugin settings (via folder path, tag `#moc`, or YAML `type: moc`)
- "Start from MOC" command shows list of available MOCs
- MOC preview displays:
  - Title and structure
  - Linked notes count
  - Last modified date
  - Quick preview of links
- Selecting a MOC creates new document with:
  - All linked notes pulled in as context
  - Hierarchical structure preserved (H2/H3 sections → document sections)
  - Option to include full note content or just excerpts
- Auto-sync: When MOC is updated, WriteAlive suggests refreshing the writing document

**Real-World Scenario**:
```markdown
<!-- User's MOC: "Creativity and Practice.md" -->
# Creativity and Practice

## Foundational Concepts
- [[Christopher Alexander - Centers]]
- [[Bill Evans - Truth over Approximation]]
- [[Natural Growth Patterns]]

## Personal Observations
- [[2025-10-28 - Reading Nature of Order]]
- [[2025-10-29 - Walk observations]]

## Applications
- [[Saligo Writing Method]]
- [[Deliberate Practice in Writing]]

---
WriteAlive command: "Start from MOC"
→ Selects "Creativity and Practice"
→ New document created with all 7 linked notes as initial context
→ AI suggests: "Your MOC has 3 themes. Which would you like to explore first?"
```

**Structural Quality Metric**:
- MOC-initiated documents have 50% higher completion rate than seed-initiated (85% vs 70%)
- Average 10-15 linked notes per MOC
- 60% of users with MOC workflow adopt this feature

---

#### US-0.5: Auto-MOC Generation (Optional, Post-MVP)
**As a** writer who accumulates related notes but doesn't manually create MOCs
**I want** WriteAlive to suggest MOC candidates based on my note relationships
**So that** I can discover emergent knowledge structures

**Acceptance Criteria**:
- "Suggest MOCs" command analyzes vault for:
  - Notes with 5+ outbound links
  - Clusters of notes with mutual backlinks
  - Notes sharing common tags/folders
- Presents MOC candidates with:
  - Suggested title based on content
  - Proposed structure (hierarchical grouping)
  - Strength score (how cohesive the cluster is)
- User can accept, edit, or dismiss
- One-click "Create MOC + Start Writing" generates both MOC note and writing document

**Structural Quality Metric**: 40% of suggested MOCs are accepted and used for writing within 1 week

---

#### US-0.6: Living MOC Auto-Update
**As a** knowledge worker who captures seeds daily
**I want** my MOCs to automatically reflect new seeds with relevant tags
**So that** my knowledge maps stay current without manual maintenance

**Acceptance Criteria**:
- User enables "Living MOC" mode in MOC frontmatter:
  ```yaml
  ---
  writealive:
    auto_gather_seeds: true
    seed_tags: [creativity, practice, writing, 창의성]  # Multiple tags supported
    seed_tag_mode: any  # 'any' (OR) or 'all' (AND)
    update_frequency: daily  # or: realtime, manual
    include_global_seed_tags: true  # Also use tags from global settings
  ---
  ```
- MOC contains auto-update section markers:
  ```markdown
  ## Recent Seeds (Auto-updated)
  <!-- BEGIN WRITEALIVE-AUTO -->
  <!-- END WRITEALIVE-AUTO -->
  ```
- WriteAlive monitors vault for new notes matching MOC's `seed_tags`
- When new matching seed found:
  - **Realtime mode**: Immediately add to AUTO section
  - **Daily mode**: Show notification: "3 new seeds for 'Creativity' MOC" [Update Now] [Review]
  - **Manual mode**: Suggest during "Start from MOC" command
- Auto-section sorts by: recency (default), relevance, or custom
- User can move items from AUTO to manual sections (becomes permanent)
- Respects user edits: never overwrites manual content

**Real-World Scenario**:
```markdown
User's MOC: "Creativity and Practice.md"
---
writealive:
  auto_gather_seeds: true
  seed_tags: [creativity, practice, 창의성, 연습]  # Multilingual!
  seed_tag_mode: any
  update_frequency: daily
---

Monday: Reading book → "Alexander: centers" #creativity #씨앗
→ Matches MOC's "creativity" tag
→ [Notification] "1 new seed for 'Creativity and Practice' MOC"

Tuesday: Watching video → "Evans: truth" #practice #idea
→ Matches MOC's "practice" tag + global "#idea" tag
→ Auto-section now has 2 seeds

Wednesday: Korean note → "자연스러운 성장" #창의성 #씨앗
→ Matches MOC's "창의성" tag (Korean)
→ Auto-section now has 3 seeds

Sunday: "Start from MOC"
→ All 3 auto-gathered seeds + manual links as context
→ AI: "Your MOC has grown this week. I notice bilingual themes..."
```

**Three Implementation Approaches** (Choose 1 for MVP):

1. **Smart Markers** (Recommended for MVP)
   - Pros: Works with pure markdown, user control, clear boundaries
   - Cons: Requires marker discipline

2. **Dataview Integration** (If Dataview plugin available)
   - Pros: Real-time, no manual updates needed
   - Cons: Requires Dataview plugin, less portable

3. **Hybrid Notification** (Safest)
   - Pros: User always in control, no accidental overwrites
   - Cons: Requires user action, not truly "auto"

**Structural Quality Metric**:
- 50% of MOC users enable auto-update
- Auto-updated MOCs receive 2-3x more seeds than manual MOCs
- 70% of auto-gathered seeds are kept (not removed as irrelevant)
- Time saved: 5-10 min/week of manual MOC maintenance

**Edge Cases & Safety**:
- Never modify content outside AUTO markers
- If markers missing, suggest adding them (don't auto-inject)
- If multiple MOCs match same seed tags, ask user which to update
- Undo support: "Revert last auto-update"

---

### Epic 0.7: Enhanced Seed Discovery & Filtering (MVP)
**Priority**: P0 (Must Have - Critical UX Improvement)
**Effort**: Medium-Large (8-13 story points)
**Rationale**: Current workflow requires users to manually scan all seeds. Tag-based navigation and relationship awareness makes discovery intentional, focused, and reveals natural connections between ideas.

---

#### US-0.7.1: Tag-Based Seed Filtering

**As a** knowledge worker with 100+ seed notes across multiple topics
**I want** to filter seeds by specific tags before selecting
**So that** I can focus on a coherent theme rather than scanning unrelated ideas

**Acceptance Criteria**:

**Tag Filter UI (Gather Seeds Modal Enhancement)**:
- Display available tags with counts above seed list:
  ```
  🏷️ Filter by Tags (showing 15 tags):

  #practice (12)  #creativity (8)  #programming (15)  #nature (5)
  #writing (20)   #idea (45)       #💡 (23)           #guitar (6)

  [Show all tags ▼]
  ```
- Tags sorted by: frequency (default), alphabetical, or recent usage
- Multi-select tags with AND/OR toggle:
  ```
  Filter Mode: [ANY tag] [ALL tags]

  Selected: #practice AND #creativity (3 seeds)
  ```
- "Clear filters" button resets to all seeds
- Tag selection persists across modal re-opens (session storage)

**Tag Metadata Enhancements**:
- Show tag co-occurrence: "Often paired with #creativity, #idea"
- Display date range: "Used from 2025-10-15 to 2025-11-03"
- Show related tags (appear in same notes): "#practice → #guitar (60%), #programming (40%)"

**Filter Interaction**:
- Clicking tag toggles selection (visual state: selected/unselected)
- Selected tags highlighted with accent color
- Real-time seed count update: "Showing 12 of 45 seeds"
- Combine with existing date filters: "This week + #practice (5 seeds)"

**Real-World Scenario**:
```markdown
User opens "Gather Seeds" with 150 total seeds

🏷️ Available Tags:
#practice (12)  #creativity (8)  #idea (45)  #programming (15)

1. User clicks #practice → 12 seeds shown
   "Seeds about practice methods from past 2 weeks"

2. User clicks #creativity (while #practice still selected)
   Filter Mode: [ANY tag]
   → 20 seeds shown (12 practice + 8 creativity)

3. User toggles to [ALL tags]
   → 3 seeds shown (have BOTH #practice AND #creativity)

4. User sees: "3 seeds found: practice methods applied to creative work"
   These are likely highly related!

5. Click "Find Centers" → AI discovers theme:
   "Deliberate Practice for Creative Mastery"
```

**Structural Quality Metric**:
- Tag navigation reduces time-to-relevant-seeds by 60% (from 3 min → 70 sec)
- 80% of users who filter by tag complete writing session
- Average 2.5 tags used per session
- Tag filter accuracy: 95% of filtered seeds are relevant to user's writing goal

---

#### US-0.7.2: Related Notes Visualization

**As a** writer exploring seed ideas
**I want** to see which seeds reference each other or share backlinks
**So that** I can understand the network of connections before selecting

**Acceptance Criteria**:

**Relationship Indicators (Per Seed Item)**:
- **Backlink Badge**:
  ```
  🔗 3 related notes
  ```
  - Clicking expands inline list of backlinks
  - Backlinks that are also seeds highlighted with "🌱" indicator

- **Wikilink Detection**:
  - Seeds that link to other displayed seeds get connection icon
  ```
  📎 Links to: "Guitar Practice Method" seed
  ```

- **Shared Tags**:
  ```
  🏷️ Shares tags with 5 other seeds (#practice, #music)
  ```

**Related Seeds Panel** (Desktop: Sidebar, Mobile: Inline Expansion):
- When seed selected, show "Related Seeds" section:
  ```markdown
  📋 Related to "Bill Evans Practice" seed:

  Direct Links (2):
  🌱 "Guitar 4-bar method" (2025-11-05)
  🌱 "Code review insight" (2025-11-06)

  Shared Tags (3):
  🌱 "Tree growth pattern" (#practice)
  🌱 "Piano practice notes" (#practice, #music)
  🌱 "Deliberate practice reading" (#practice)

  Backlinks from MOCs (1):
  📚 "Creativity and Practice MOC" (links to this seed)
  ```

**Interaction Design**:
- Hover over relationship badge → tooltip preview
- Click relationship badge → highlight related seeds in list
- "Show only related" filter option (hide unrelated seeds)
- Desktop: Sidebar panel (30% width) always visible
- Mobile: Inline expansion (tap to show/hide)

**Real-World Scenario**:
```markdown
User selects seed: "Bill Evans Practice Philosophy"

Related Seeds panel appears:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Related to "Bill Evans Practice Philosophy":

Direct Links (2):
🌱 "Guitar 4-bar practice"
   → This seed mentions Bill Evans quote
🌱 "Code review realization"
   → Links to Evans note

Shared Tags (#practice, #deliberate) (3):
🌱 "Tree growth observation"
🌱 "Piano practice session"
🌱 "Learning method notes"

In MOCs (1):
📚 "Creativity and Practice MOC"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User realizes: "These 3 seeds form a cluster!"
User selects all 3 → "Find Centers"
AI: "Strong Center ⭐⭐⭐: Part-to-Whole Mastery"
```

**Structural Quality Metric**:
- 60% of users explore related seeds before final selection
- Related-seed clusters have 15% higher center strength scores (⭐⭐⭐ vs ⭐⭐)
- Average 1.8 related seeds per selected seed
- Relationship detection accuracy: 90% (verified via user acceptance)

---

#### US-0.7.3: Integrated Center Finding Workflow

**As a** writer selecting seeds
**I want** center finding to be a natural next step, not a separate command
**So that** I experience a seamless flow from gathering to discovery to writing

**Acceptance Criteria**:

**Current Workflow** (Before Enhancement):
```
1. Gather Seeds modal → Select seeds → "Start Writing"
2. New document created with seeds
3. User manually runs "Find Centers" command
4. Centers displayed
5. User copies centers to document
```

**Enhanced Workflow** (Integrated):
```
1. Gather Seeds modal → Select seeds
2. "🎯 Find Centers" button prominently displayed
3. Click → Center Discovery Modal opens (seamless)
4. Choose center → "Start Writing from Center" button
5. Document Creator creates note with:
   - Selected seeds
   - Chosen center as title/theme
   - Writing prompt based on center
```

**UI Changes in Gather Seeds Modal**:
- **Three action buttons** (vs current two):
  ```
  [Cancel]  [🎯 Find Centers]  [Start Writing]
  ```
- "Find Centers" button:
  - Enabled when: 2+ seeds selected AND AI service available
  - Tooltip: "Discover themes across selected seeds (AI-powered)"
  - Primary CTA styling (most prominent)

- "Start Writing" button:
  - Secondary styling
  - Tooltip: "Create document directly without AI analysis"

**Center Discovery Modal Integration**:
- Opens immediately after "Find Centers" clicked (no page navigation)
- Shows loading state: "🎯 Discovering centers... (3-5 seconds)"
- Displays results (existing modal implementation)
- **New feature**: "Start Writing from Center" button on each center:
  ```
  ⭐⭐⭐ Strong Center
  "Completeness vs Approximation"

  Connects: Bill Evans philosophy + guitar practice + coding

  [↩ Back to Seeds]  [✍️ Start Writing from This Center]
  ```

**Document Creator Enhancement**:
- When creating from center, document includes:
  ```yaml
  ---
  writealive:
    gathered_seeds:
      - "Bill Evans note.md"
      - "Guitar practice.md"
      - "Code review.md"
    discovered_center:
      name: "Completeness vs Approximation"
      strength: "strong"
      explanation: "..."
    created_via: "center_discovery"
  ---

  # Completeness vs Approximation

  ## Discovered Center

  **Core Theme**: Bill Evans' philosophy applied across domains

  **Why this center is alive** (⭐⭐⭐):
  - Present in all 3 seeds (music, coding, practice)
  - Emotionally resonant ("shocking", "realized")
  - Concrete experiences (4-bar practice, code review)

  ## Gathered Seeds

  > "Don't approximate the whole vaguely..."
  > — [[Bill Evans Practice Philosophy]]

  > "Practiced first 4 bars perfectly, rest came easy"
  > — [[Guitar Practice Session]]

  > "One small function properly > rough whole structure"
  > — [[Code Review Insight]]

  ## Writing Prompt

  Start with your strongest concrete experience:
  What happened when you practiced those 4 bars perfectly?
  Make the reader *feel* that moment.
  ```

**Real-World Scenario (Complete Flow)**:
```markdown
Monday-Thursday: User captures 4 seeds (mobile + desktop)

Friday Evening:
1. Opens Obsidian → "Gather Seeds"
   → 4 seeds displayed

2. Filters by #practice tag
   → 3 seeds remain (focused selection)

3. Selects all 3 → "🎯 Find Centers" button glows

4. Clicks "Find Centers"
   → Loading: "Discovering centers... 3s"
   → Center Discovery Modal opens

5. AI shows:
   ⭐⭐⭐ "Completeness vs Approximation"
   ⭐⭐ "Part-to-Whole Growth"
   ⭐ "Cross-Domain Learning"

6. User clicks "Start Writing from This Center" (first one)

7. Document Creator modal:
   - Title: "Completeness vs Approximation"
   - Seeds pre-filled
   - Writing prompt: "Start with guitar story..."

8. User clicks "Create"
   → New document created, opens in editor
   → Cursor positioned after writing prompt
   → User immediately starts writing (low friction!)

Total time: 90 seconds from Gather Seeds to writing first sentence
vs Traditional: 5-10 minutes of planning, often abandoned
```

**Structural Quality Metric**:
- 70% of Gather Seeds sessions use "Find Centers" workflow (vs 20% current)
- Time from seed selection to writing start: <90 seconds (vs 5+ min current)
- Documents created via integrated flow: 80% completion rate (vs 70% manual)
- User satisfaction: 85% report workflow feels "natural and effortless"

---

#### US-0.7.4: Keyword-Tagged Content Preview

**As a** writer reviewing seeds before selection
**I want** to see keyword highlights and tag context within seed excerpts
**So that** I can quickly assess relevance without opening each note

**Acceptance Criteria**:

**Enhanced Seed Item Display**:
- **Keyword Highlighting**:
  - Selected tags highlighted in excerpt text:
    ```markdown
    "Watched Bill Evans video. 'Don't approximate...' was shocking.
     I've always tried to play entire guitar songs roughly."
                         ^^^^^^^^^^             ^^^^^^

    Matched: #practice  (appears in frontmatter)
    Keywords: "practice", "entire", "shocking" (highlighted in excerpt)
    ```

- **Tag Context Line**:
  - Show where tags appear:
    ```
    Tags: #practice (inline), #seed (frontmatter), #💡 (inline)
    ```

- **Related Keyword Cloud** (for filtered view):
  - When filtering by tag, show common words across filtered seeds:
    ```
    🔑 Common themes: practice (8), complete (5), method (4), grow (3)
    ```

**Excerpt Enhancement**:
- Longer excerpts for filtered seeds: 150 → 250 chars
- Multi-paragraph preview if first para is <50 chars:
  ```
  "Don't approximate the whole vaguely." ¶
  This Bill Evans quote was shocking...
  ```

**Interaction**:
- Hover over highlighted keyword → shows definition/first use
- Click tag → filter by that tag
- Click keyword → highlight in other seeds

**Real-World Scenario**:
```markdown
User filters by #practice tag → 12 seeds

Seed 1:
┌────────────────────────────────────────────┐
│ Bill Evans Practice Philosophy             │
│                                            │
│ "Watched Bill Evans video. 'Don't         │
│  approximate the whole vaguely...' was     │
│  ^^^^^^^^^^                                │
│  shocking. I've always tried to play       │
│  entire guitar songs roughly."             │
│  ^^^^^^                                    │
│                                            │
│ 🏷️ #practice (inline), #seed (frontmatter) │
│ 🔗 2 backlinks  📅 2025-11-04             │
└────────────────────────────────────────────┘

🔑 Common themes across #practice seeds:
"approximate" (4), "entire" (3), "complete" (5)

User notices: "All my practice seeds mention completeness!"
This is the emerging center before AI even analyzes!
```

**Structural Quality Metric**:
- Keyword highlighting reduces time-to-understand by 40%
- 50% of users discover themes manually before AI (increased awareness)
- Highlight accuracy: 85% of keywords are semantically relevant
- User reports: "Keywords helped me see the pattern immediately"

---

### Epic 1: Low-Energy Writing Initiation (MVP)
**Priority**: P0 (Must Have)
**Effort**: Large (8-13 story points)
**Rationale**: The fundamental differentiator - eliminating the energy barrier to start writing

#### US-1.1: Seed-Based Start
**As a** writer with a vague idea
**I want to** start writing with just a single sentence or phrase
**So that** I can begin without needing a complete outline or structure

**Acceptance Criteria**:
- User can create new document with single sentence as seed
- Tool immediately accepts any length of text (3 words to 3 paragraphs)
- No required fields, no templates, no structural prompts
- User sees encouragement: "This is enough to start. What center do you see here?"
- First save happens automatically on blur (no save friction)

**Structural Quality Metric**: Energy-to-first-sentence < 2 minutes, 90% success rate

---

#### US-1.2: Anywhere, Anytime Writing
**As a** busy professional with scattered time
**I want to** continue my writing across devices and sessions seamlessly
**So that** I can write during commute, lunch breaks, or whenever inspiration strikes

**Acceptance Criteria**:
- Markdown files sync via GitHub (user provides repo)
- Mobile-responsive interface (or Obsidian plugin for mobile)
- Auto-save every 30 seconds with conflict resolution
- Session resume shows: "Last worked on [time ago]. Current center: [X]"
- Offline mode with sync queue

**Structural Quality Metric**: 40% of sessions happen on mobile devices

---

### Epic 2: AI-Assisted Center Discovery (MVP)
**Priority**: P0 (Must Have)
**Effort**: Large (13-21 story points)
**Rationale**: Core AI capability that makes Saligo Writing accessible to non-experts

#### US-2.1: Center Identification
**As a** writer developing my draft
**I want** AI to suggest potential centers in my existing text
**So that** I can identify structural pivots for expansion without expertise in Alexander's methodology

**Acceptance Criteria**:
- Auto-triggers after seed document creation (seamless workflow)
- Manual trigger: User selects paragraph/section → "Find Centers" command
- AI analyzes text using GPT-4/Claude and returns 2-4 potential centers
- **Strength-based ranking** (from tutorial):
  - Strong Center (⭐⭐⭐): High energy, connects multiple themes
  - Medium Center (⭐⭐): Moderate energy, good potential
  - Weak Center (⭐): Low energy, optional to explore
- Each center includes:
  - Center name/theme (e.g., "Completeness vs Approximation")
  - Brief explanation (why this holds energy)
  - Recommendation (which to start with)
- Display format (from tutorial):
  ```
  🎯 Centers Discovered:

  1. [Strong Center ⭐⭐⭐] "Completeness vs Approximation"
     Core of Bill Evans' philosophy
     Connects guitar, programming, natural growth

  2. [Medium Center ⭐⭐] "Part to Whole Growth"
     Tree metaphor + practice pattern

  3. [Weak Center ⭐] "Cross-domain Application"
     Same principle across different fields

  💡 Recommendation: Start with Center 1 - it's the most alive
  ```
- User can:
  - Accept center (begins writing from that theme)
  - Modify center name/focus
  - Dismiss and request alternatives
  - See all centers simultaneously (compare strength)
- Accepted centers tracked in document metadata (for wholeness analysis)
- AI considers: recurring concepts, emotional resonance, cross-seed connections, structural pivots, unresolved tensions

**Real-World Scenario (from Tutorial)**:
```
Seeds analyzed:
1. "Don't approximate the whole vaguely" #seed #practice
2. "First 4 bars perfectly" #idea #guitar
3. "One small function properly" #seed #programming
4. "Trees grow from trunk to branches" #seed #nature

AI identifies:
- Strong Center (⭐⭐⭐): "Completeness over Approximation"
  → Present in ALL 4 seeds (music, code, nature)
  → Emotionally charged ("shocking", "realized")
  → Actionable (user has concrete experiences)

- Medium Center (⭐⭐): "Natural Growth Patterns"
  → Tree metaphor + practice progression
  → Visual seed (photo) strengthens it

- Weak Center (⭐): "Cross-domain Learning"
  → Observable but less developed
  → Could be future expansion

User chooses Strong Center → Writes first paragraph immediately
```

**Structural Quality Metric**: Users accept 60%+ of suggested Strong Centers (⭐⭐⭐); 50%+ overall center acceptance rate; 80% of users proceed to write within 2 minutes of seeing center suggestions

---

#### US-2.2: Generative Expansion Prompts
**As a** writer staring at my seed idea
**I want** AI to suggest expansion strategies for my current center
**So that** I can overcome writer's block and explore multiple directions

**Acceptance Criteria**:
- User invokes "Suggest Expansions" command (Ctrl+P → WriteAlive: Suggest Expansions)
- AI analyzes current draft + unused seeds to suggest 3-5 expansion directions
- **Option-based presentation** (from tutorial):
  - Each option labeled (Option A, B, C...)
  - Strength rating: ⭐⭐⭐ (Recommended), ⭐⭐ (Good), ⭐ (Optional)
  - Expansion strategy explained (what type of growth)
  - Guiding question to help user write
- Display format (from tutorial):
  ```
  🌿 How your writing wants to grow:

  Option A: Add Concrete Experience (⭐⭐⭐ Recommended)
    "What happened when you practiced those 4 bars perfectly?
     Make readers feel that experience."

  Option B: Use Nature Metaphor (⭐⭐)
    "How does tree growth mirror your practice?
     Develop while looking at the photo."

  Option C: Connect to Programming (⭐)
    "Same discovery in code review?
     What was that moment?"
  ```
- User can:
  - Select option → AI provides 2-3 starter prompts (optional, not auto-writing)
  - Dismiss option → Show alternative directions
  - Iterate: "Show more options" after completing one expansion
  - Track which seeds have been used vs unused (visual indicator)
- **Iterative workflow** (from tutorial):
  - After Option A expansion → Wholeness check → Suggest next options
  - Each expansion builds on previous (not parallel branches)
  - Unused seeds highlighted as potential future options
- All suggestions are non-intrusive (sidebar/modal, easily dismissible)
- No auto-writing: AI suggests directions, user writes content

**Expansion Strategy Types** (AI uses mix of these):
1. **Concrete Experience**: Add specific story/example
2. **Metaphor/Analogy**: Use visual or conceptual comparison
3. **Cross-domain Connection**: Link to other fields/interests
4. **Causal Exploration**: Trace backward (why?) or forward (what happens?)
5. **Counter-perspective**: Explore opposing view or tension
6. **Structural Pattern**: Identify underlying principle

**Real-World Scenario (from Tutorial)**:
```
User has written first paragraph:
"Bill Evans said: 'Don't approximate the whole vaguely.
 Take a small part and be entirely true about it.'
 I heard this and reflected on my guitar practice."

Unused seeds:
- Guitar practice (4 bars) #idea #💡
- Code review insight #seed #programming
- Tree photo #seed #nature

AI analyzes and suggests:
Option A (⭐⭐⭐): "Add your guitar story - you have concrete experience seed!"
  → User selects, writes 3 paragraphs about 4-bar practice
  → Wholeness: 7.2/10

Option B (⭐⭐): "Your tree photo is waiting - natural growth metaphor"
  → User selects, adds tree paragraph
  → Wholeness: 8.3/10

Option C (⭐): "Programming seed unused - cross-domain connection?"
  → User skips (essay feels complete)

AI notices: "Wholeness is 8.3 - very good! Option C could push to 9.0+, but not required."
```

**Structural Quality Metric**: 70% of stuck sessions (>5 min no text) successfully resume after prompt use; 85% of users explore 2+ expansion options; avg 2.5 expansions per document

---

#### US-2.3: Wholeness Analysis
**As a** writer with multiple paragraphs
**I want** AI to assess the wholeness/coherence of my document
**So that** I can identify weak connections, redundancies, or missing pieces

**Acceptance Criteria**:
- User invokes "Analyze Wholeness" command (Ctrl+P → WriteAlive: Analyze Wholeness)
- Can be run on: full document, selected section, or auto-triggered after expansions
- AI evaluates:
  - Paragraph unity (does each paragraph have one clear message?)
  - Inter-paragraph transitions (do ideas flow naturally?)
  - Center hierarchy (are main ideas clearly dominant?)
  - Structural gaps (what's missing to complete the thought?)
  - Unused seeds (what potential remains unexplored?)
- **Wholeness score**: 1-10 with detailed explanation
  - 7.0-7.9: Good writing, coherent structure
  - 8.0-8.9: Very good, strong centers and flow
  - 9.0-10.0: Excellent, high cohesion and wholeness
- **Structured feedback format** (from tutorial):
  ```
  📊 Wholeness Analysis Result

  Overall Score: 8.3/10 (Very Good)

  ✅ Strengths:
    • Explains abstract concept with concrete experience (strong center)
    • Natural flow: "hear → reflect → apply → understand"
    • Tree metaphor reinforces practice principle

  ⚠️ Room for Improvement:
    • Programming example not yet connected (unused seed)
    • Transition between paragraphs 2-3 slightly abrupt
    • Conclusion could tie back to opening more explicitly

  💡 Next Iteration:
    Adding Option C (programming) could raise wholeness to 9.0+
    Smoothing transition would improve flow
  ```
- **Progression tracking** (from tutorial):
  - Track wholeness scores over time: 7.2 → 8.3 → 9.1
  - Show improvement graph (visual feedback)
  - Celebrate milestones: "You've reached 9.0+ wholeness!"
  - Store scores in document metadata for historical view
- Specific actionable suggestions:
  - "Paragraph 3 and 7 seem to repeat the same idea - consider merging"
  - "Transition between Para 2→3 needs connector phrase"
  - "Programming seed unused - potential for cross-domain depth"
- Optional: Visual map showing strong connections (green), weak links (yellow), gaps (red)

**Real-World Scenario (from Tutorial)**:
```
User writes initial draft → Wholeness: 7.2/10
AI feedback:
  ✅ Good: Concrete guitar story
  ⚠️ Missing: Tree metaphor seed unused, conclusion weak

User adds tree metaphor expansion → Wholeness: 8.3/10
AI feedback:
  ✅ Strengths: Metaphor reinforces concept, natural flow improved
  ⚠️ Room: Programming seed still unused, could add depth

User polishes transitions → Wholeness: 9.1/10
AI feedback:
  ✅ Excellent wholeness! Strong centers, natural flow, clear conclusion
  💡 Programming seed optional at this point - essay feels complete

User sees progression: 7.2 → 8.3 → 9.1 (concrete improvement)
```

**Key Principles**:
- **Progressive scoring**: Not one-time pass/fail, but iterative improvement
- **Actionable feedback**: Specific suggestions, not vague critique
- **Celebrate progress**: Highlight improvements, not just deficits
- **Unused seed awareness**: Remind of unexplored potential without pressure

**Structural Quality Metric**: Documents with 7+ wholeness score are 90% complete by user assessment; users with progression tracking complete 40% more documents; avg 3 wholeness checks per document

---

### Epic 3: Iterative Refinement Tools (MVP)
**Priority**: P0 (Must Have)
**Effort**: Medium (5-8 story points)
**Rationale**: Support the iterative nature of Saligo Writing

#### US-3.1: Read-Aloud Review
**As a** writer completing a draft
**I want** to hear my text read aloud with AI voice AND get feedback on awkward phrasing
**So that** I can identify rhythm issues and unclear passages through both listening and AI analysis

**Acceptance Criteria**:
- User invokes "Read Aloud Feedback" command (Ctrl+P → WriteAlive: Read Aloud Feedback)
- **Two-part feature**:
  1. **Audio playback**:
     - Text-to-speech with natural intonation (browser API or service)
     - Reading highlights current sentence
     - Pause/resume controls
     - User can click to edit while listening (playback pauses)
     - Speed control: 0.8x, 1x, 1.2x
  2. **AI rhythm analysis** (from tutorial):
     - Identifies awkward phrasing, overly long sentences, unclear transitions
     - Provides specific suggestions with before/after examples
- **Feedback format** (from tutorial):
  ```
  🔊 Read Aloud Analysis

  ✅ Reads Well:
    • "Something amazing happened" - good rhythm
    • "trunk → branches → leaves" - clear repetition

  ⚠️ Awkward Parts:
    • "That's when I understood physically" - slightly awkward
    → Suggestion: "That's when I physically grasped"

    • "Accurate notes came out without thinking" - too long
    → Suggestion: "Notes came out effortlessly"
       OR split: "Accurate notes came out. I didn't need to think."
  ```
- User can:
  - Accept suggestion (one-click edit)
  - Modify suggestion
  - Dismiss and keep original
  - Re-run after edits to verify improvements
- AI considers: sentence length (15-25 words ideal), rhythm variation, transition smoothness, redundant phrases

**Real-World Scenario (from Tutorial)**:
```
User finishes draft, runs "Read Aloud Feedback"

AI identifies:
1. "That's when I understood physically" → awkward adverb placement
   Suggestion: "That's when I physically grasped" ✓ (more natural)

2. "Accurate notes came out without thinking" → 6 words, but feels long
   Suggestion: "Notes came out effortlessly" ✓ (more concise)

User accepts both → Re-runs wholeness → 8.3 → 9.1

User also listens to audio → Catches one more awkward transition
Edits manually → Final polish complete
```

**Key Principles**:
- **Dual feedback**: Both AI analysis AND audio playback (complement each other)
- **Specific suggestions**: Not "this is awkward" but "try this instead"
- **Optional application**: User always in control, can dismiss all
- **Fast iteration**: Quick re-run after edits to verify

**Structural Quality Metric**: 40% of documents use read-aloud before marking "complete"; 70% of AI suggestions accepted; avg 2-3 phrasing improvements per document

---

#### US-3.2: Version Snapshots and Comparison
**As a** writer evolving my document through iterations
**I want** to save named snapshots and compare versions
**So that** I can see structural evolution and potentially revert experiments

**Acceptance Criteria**:
- User clicks "Save Snapshot" and names it (e.g., "After center 3 expansion")
- Snapshot stores: full text, timestamp, current centers, wholeness score
- "Version History" shows timeline of snapshots
- User selects two versions to see side-by-side diff
- Diff highlights: additions (green), deletions (red), moved text (blue)
- One-click revert to any snapshot

**Structural Quality Metric**: Users create avg 5 snapshots per document; 20% perform comparisons

---

### Epic 4: Academic Writing Structure Support (MVP)
**Priority**: P0 (Must Have)
**Effort**: Small (3-5 story points)
**Rationale**: Bridge to familiar academic conventions while supporting generative process

#### US-4.1: Paragraph Labeling
**As an** academic writer
**I want** to optionally label paragraphs with their rhetorical purpose
**So that** I maintain structural clarity without rigid outlines

**Acceptance Criteria**:
- User can tag any paragraph with label: [Claim], [Evidence], [Analysis], [Counterargument], [Transition], [Example], [Context], [Custom]
- Labels appear as subtle margin annotations (not inline)
- "Structure View" shows document as labeled outline
- AI can suggest labels: "This paragraph seems to provide evidence for claim in Para 2"
- Labels are optional - never required to proceed

**Structural Quality Metric**: 60% of academic users adopt paragraph labeling

---

#### US-4.2: Section Coherence Check
**As an** academic writer
**I want** to verify each paragraph has unity (one clear message)
**So that** my writing meets academic standards for paragraph structure

**Acceptance Criteria**:
- User invokes "Check Paragraph Unity" on any paragraph
- AI evaluates: Does this paragraph have one main idea?
- If fragmented, suggests: "This paragraph discusses [A] and [B] - consider splitting"
- If unified, confirms: "Clear unity around: [main idea]"
- Batch check available for full document

**Structural Quality Metric**: Documents passing unity check have 40% fewer revision requests from advisors/reviewers

---

### Epic 5: Multi-LLM AI Integration (Post-MVP)
**Priority**: P1 (Should Have)
**Effort**: Medium (5-8 story points)
**Rationale**: User choice and cost optimization

#### US-5.1: AI Provider Selection
**As a** cost-conscious user
**I want** to choose between GPT-4, Claude, or Gemini
**So that** I can optimize for quality, cost, or speed based on my needs

**Acceptance Criteria**:
- Settings panel with AI provider selection
- User enters API key for chosen provider(s)
- Each AI command shows estimated cost and model used
- User can set defaults per command type (e.g., Claude for center-finding, GPT-3.5 for simple expansions)
- Transparent usage tracking: "This month: $X across Y requests"

---

### Epic 6: Obsidian Plugin Integration (Post-MVP)
**Priority**: P1 (Should Have)
**Effort**: Large (8-13 story points)
**Rationale**: Meet users where they already work

#### US-6.1: Native Obsidian Commands
**As an** Obsidian user
**I want** WriteAlive features as native commands in my vault
**So that** I don't need to switch tools or export/import

**Acceptance Criteria**:
- Install as Obsidian community plugin
- Commands accessible via command palette (Ctrl+P)
- Sidebar panel shows: current centers, wholeness score, version snapshots
- Works with existing markdown files (non-destructive annotations)
- Sync settings across devices via Obsidian Sync

---

### Epic 6.5: Mobile-First Features (MVP - High Priority)
**Priority**: P0 (Must Have for Mobile Users)
**Effort**: Medium (5-8 story points)
**Rationale**: Seeds are often captured on mobile during commutes, walks, and daily activities. Mobile support is critical for the "low energy barrier" promise.

#### US-6.5.1: Mobile-Optimized Seed Capture
**As a** mobile user walking/commuting
**I want** to quickly capture seed ideas with minimal friction
**So that** I don't lose fleeting thoughts

**Acceptance Criteria**:
- **Quick Capture UI**: Large tap targets (min 44x44px), thumb-friendly layout
- **Voice Input**: Native speech-to-text integration
  - Tap microphone icon → speak → auto-tagged with `#seed`
  - Works offline (device STT)
- **Minimal Keyboard**: Auto-suggest tags based on recent usage
- **Auto-save**: Saves every 2 seconds (mobile network unreliable)
- **Offline Mode**: Queue seeds locally, sync when online
- **Photo Seeds**: Capture photo + quick note → tagged as seed
  - Example: Photo of book page + "Alexander's centers concept" #seed #reading

**Mobile-Specific Constraints**:
- Works on Android (Obsidian Mobile 1.4.0+)
- Works on iOS (Obsidian Mobile 1.4.0+)
- No complex UI (limited screen real estate)
- Touch-optimized (no hover states)
- Performance: <100ms UI response on mid-range devices

**Real-World Scenarios (from Tutorial)**:

**Scenario 1: Monday Subway Commute (Text Seed)**
```
7:30 AM - On subway, watching Bill Evans video on phone
→ Opens Obsidian Mobile
→ Quick capture (templates or daily note)
→ Types: "Watched Bill Evans video.
         'Don't approximate the whole vaguely' was shocking.
         I've always tried to play entire guitar songs roughly.
         #seed #practice"
→ Auto-saves in 2 seconds
→ Back to video
→ Total time: 1-2 minutes

Friday desktop: "Gather Seeds" finds this as first seed
```

**Scenario 2: Tuesday Lunch Break (Voice Memo Seed)**
```
12:30 PM - Lunch break, reflecting on yesterday's guitar practice
→ Opens Obsidian Mobile
→ Taps microphone icon (voice input)
→ Speaks: "When I practiced guitar yesterday, I practiced only
           the first 4 bars perfectly. The rest came easily after."
→ System transcribes and adds tags: #idea #guitar #💡
→ Auto-saves with timestamp
→ Total time: 1 minute

Friday desktop: "Gather Seeds" shows voice memo with #💡 emoji tag
```

**Scenario 3: Thursday Evening Walk (Photo + Text Seed)**
```
6:00 PM - Walking in park, sees tree growth pattern
→ Opens Obsidian Mobile
→ Takes photo of tree (or selects from gallery)
→ Taps "Add to note" or quick capture
→ Types brief note: "Trees grow from trunk to branches.
                     Shouldn't writing work the same way?"
→ Tags: #seed #nature
→ Photo embedded as ![[tree-growth.jpg]]
→ Auto-syncs to vault
→ Total time: 1-2 minutes

Friday desktop: "Gather Seeds" shows tree seed with photo thumbnail 📷
User can reference photo while writing essay
```

**Cross-Device Workflow**:
```
Week pattern (from tutorial):
Monday (mobile): Bill Evans text seed #seed
Tuesday (mobile): Guitar voice memo #idea #💡
Wednesday (desktop): Code review note #seed #programming
Thursday (mobile): Tree photo seed #seed #nature

Friday (desktop):
→ "Gather Seeds" command
→ Finds all 4 seeds (3 mobile, 1 desktop)
→ Photo thumbnail shown for tree seed
→ Voice memo transcription shown for Tuesday
→ Emoji tags recognized (#💡)
→ User writes complete essay in 30 minutes
```

**Key Mobile Features Demonstrated**:
- **Text capture**: Quick typing (1-2 min) for thoughts
- **Voice input**: Hands-free capture while walking/commuting
- **Photo seeds**: Visual inspiration embedded with notes
- **Emoji tags**: #💡, #🌱, #💭 work alongside text tags
- **Auto-sync**: Mobile → Desktop seamless (Obsidian Sync, iCloud, Git)
- **Multi-day pattern**: 4 seeds over 4 days = low cognitive load per day

**Structural Quality Metric**: 70% of seeds captured on mobile are used in desktop writing within 7 days; 50% of all seeds come from mobile devices; avg 2-3 mobile captures per week per user

---

#### US-6.5.2: Mobile-Friendly MOC Viewing
**As a** mobile user reviewing knowledge
**I want** to browse my MOCs and their auto-gathered seeds
**So that** I can see my knowledge structure while on-the-go

**Acceptance Criteria**:
- **Read-Only MOC View**: Display MOC structure clearly on small screen
- **Collapsible Sections**: Tap to expand/collapse manual vs auto-sections
- **Seed Preview**: Tap seed → show full note in modal
- **Filter by Tag**: Quick filter to see only specific themes
- **Swipe Navigation**: Swipe between MOCs
- **Bookmark MOCs**: Pin frequently accessed MOCs to top

**Mobile Constraints**:
- Vertical scroll only (natural mobile pattern)
- No horizontal scrolling
- Load performance: < 2s for MOC with 50+ links

**NOT Supported on Mobile (Desktop Only)**:
- Starting new documents from MOC (complex UI)
- AI center discovery (requires extended focus)
- Wholeness analysis (visual complexity)
- Full document editing (use desktop)

**Use Case**:
```
Lunch break - On phone
→ Opens MOC "Creativity and Practice"
→ Sees 5 new auto-gathered seeds this week
→ Taps seed: "Evans: truth over approximation"
→ Reads full note
→ Mental note: "This connects to Alexander!"
→ Evening at desk: writes about connection
```

**Structural Quality Metric**: 50% of mobile users browse MOCs weekly; 30% review seeds on mobile before desktop writing sessions

---

#### US-6.5.3: Cross-Device Sync Status
**As a** user working across devices
**I want** to see sync status clearly
**So that** I know my mobile captures are available on desktop

**Acceptance Criteria**:
- **Sync Indicator**: Shows "Synced" / "Syncing..." / "Offline" with timestamp
- **Conflict Resolution UI**: If mobile+desktop edited same note
  - Show both versions side-by-side (mobile: top, desktop: bottom)
  - User picks which to keep or merge manually
- **Sync Settings**: Choose sync method
  - Obsidian Sync (paid)
  - iCloud / Google Drive (free)
  - Git (advanced users)
- **Background Sync**: Auto-sync when app comes to foreground
- **Low Battery Mode**: Reduce sync frequency to save battery

**Edge Cases**:
- Large attachments (photos): Compress before upload
- Slow network: Show progress bar for large syncs
- No network: Clear "Offline" indicator, queue changes

**Structural Quality Metric**: < 5% of users report sync conflicts; 95% of seeds synced within 5 minutes

---

### Epic 7: Collaborative Co-Design Features (Future)
**Priority**: P2 (Could Have)
**Effort**: Large (13-21 story points)
**Rationale**: Enable peer feedback and advisor collaboration

#### US-7.1: Shared Center Discussions
**As a** student working with an advisor
**I want** to share my draft with in-line comments on centers
**So that** we can discuss structural decisions collaboratively

**Acceptance Criteria**:
- User generates shareable link with read or comment permissions
- Collaborators can highlight text and comment: "Is this really the center?"
- Comment threads attached to specific versions/snapshots
- User can accept/resolve comments and track changes

---

## Non-Functional Requirements

### Performance
- **Latency**: AI responses (center identification, expansions) < 3 seconds for 90th percentile
- **Offline**: Full markdown editing works offline; AI features queue for sync
- **Large Documents**: Support documents up to 50,000 words without performance degradation
- **Concurrent Sessions**: Handle user editing same document across 2 devices with CRDTs or OT

### Security & Privacy
- **API Keys**: Stored encrypted locally (browser crypto API) or in user-controlled env files
- **Data Storage**: User owns data - markdown files in their GitHub repo or local filesystem
- **No Central Storage**: WriteAlive never stores document content on servers (stateless API calls)
- **Audit Trail**: All AI requests logged locally with timestamps for user review
- **GDPR Compliance**: Minimal data collection; user can export/delete all data

### Scalability
- **Stateless Backend**: All AI orchestration stateless (can scale horizontally)
- **Rate Limiting**: Implement client-side rate limiting to prevent API cost overruns
- **Caching**: Cache AI responses for identical requests (24hr TTL) to reduce costs
- **Batch Processing**: Queue multiple AI requests and process in optimized batches

### Accessibility
- **WCAG 2.1 AA**: Keyboard navigation, screen reader support, sufficient contrast
- **Read-Aloud**: Support for users with dyslexia or visual impairments
- **Customizable UI**: Font size, spacing, color themes (high contrast mode)
- **Mobile Touch**: Large touch targets (44x44px min), swipe gestures for version comparison

### Internationalization
- **Primary**: Korean (한국어) and English (US)
- **UI Translation**: All interface strings in i18n files (react-i18next or similar)
- **LLM Language Support**: Detect document language and prompt AI accordingly
- **RTL Consideration**: Architecture supports RTL languages for future expansion

### Reliability
- **Auto-Save**: Changes saved every 30s with visual confirmation
- **Conflict Resolution**: Clear UI for merge conflicts with side-by-side comparison
- **Error Recovery**: Graceful degradation if AI service unavailable (fall back to manual mode)
- **Data Integrity**: Git-based versioning ensures no data loss

---

## Technical Constraints & Decisions

### Platform Considerations

**Decision Point**: Obsidian Plugin vs Standalone App vs Both?

**Option A: Obsidian Plugin First** (Recommended for MVP)
- **Pros**:
  - Existing user base of knowledge workers
  - Markdown-native environment
  - Leverage Obsidian's sync, mobile, and plugin ecosystem
  - Faster MVP (no need to build full editor)
- **Cons**:
  - Limited to Obsidian users initially
  - Plugin API constraints (but sufficient for our needs)
  - Approval process for community plugins
- **Effort**: Medium (5-8 weeks)

**Option B: Standalone Electron App**
- **Pros**:
  - Full control over UX/UI
  - Reach non-Obsidian users
  - Native OS integrations possible
- **Cons**:
  - Must build full markdown editor (high complexity)
  - Slower MVP (10-16 weeks)
  - Cross-platform testing burden
- **Effort**: Large (12-20 weeks)

**Option C: Web App (React + Monaco/CodeMirror)**
- **Pros**:
  - Accessible via browser (no install)
  - Easiest cross-platform deployment
  - Progressive Web App for mobile
- **Cons**:
  - Less native feel than Obsidian/Electron
  - Sync complexity (need to build or integrate service)
  - API key storage in browser (security trade-offs)
- **Effort**: Medium-Large (8-14 weeks)

**Recommendation**: Start with **Option A (Obsidian Plugin)** for MVP to validate Saligo Writing methodology with real users quickly. Expand to Option C (Web App) post-MVP for broader reach. Option B (Electron) only if strong user demand and resources permit.

---

### AI Integration Architecture

**Technology Stack**:
- **LLM Orchestration**: LangChain or direct API calls (evaluate based on complexity)
- **Primary AI Provider**: Claude 3.5 Sonnet (best for nuanced writing analysis)
- **Secondary**: GPT-4 Turbo (fallback), Gemini Pro (cost-effective alternative)
- **Prompt Management**: Centralized prompt templates with versioning
- **Token Optimization**: Sliding window for large documents (analyze 2000 tokens at a time)

**API Call Flow**:
1. User triggers AI command (e.g., "Find Centers")
2. Client extracts relevant context (current paragraph + surrounding 2 paragraphs)
3. Client constructs prompt with context + system instructions
4. Send to selected AI provider API
5. Parse structured response (JSON mode for Claude/GPT)
6. Render results in UI with accept/dismiss actions

**Cost Estimates** (per user per month, assuming 20 documents):
- Light usage: 50 AI calls x $0.02 avg = $1.00/month
- Heavy usage: 200 AI calls x $0.02 avg = $4.00/month
- User pays own API costs (bring-your-own-key model)

---

### GitHub Integration

**Use Case**: Version control and optional sync
**Implementation**:
- Use GitHub API (Octokit.js) for repo operations
- User provides personal access token (stored encrypted)
- Each document maps to .md file in user's designated repo
- Commits on each snapshot save with message: "Snapshot: [user-provided name]"
- Pull before edit, push after save (simple conflict detection)
- Option for manual vs auto-commit

**Alternative**: Local-first with optional Git sync
- Use isomorphic-git for browser-based Git operations
- No GitHub account required for offline use
- Sync to GitHub only if user configures

**Recommendation**: Local-first approach for MVP simplicity, GitHub sync as P1 feature

---

### Markdown Compatibility

**Requirements**:
- Standard Markdown (CommonMark spec)
- Support for: headings, lists, links, images, code blocks, tables
- WriteAlive metadata stored as YAML frontmatter:
  ```yaml
  ---
  writealive:
    centers:
      - text: "core insight here"
        paragraph: 3
        timestamp: "2025-11-01T10:30:00Z"
    snapshots:
      - name: "Initial draft"
        timestamp: "2025-11-01T09:00:00Z"
        wholeness: 6.5
    version: 1.0
  ---
  ```
- Non-intrusive: Files remain readable in any markdown editor
- Optional: Comments syntax for inline annotations (<!-- WriteAlive: center -->)

---

## Open Questions & Decisions Needed

### Product Questions

1. **Freemium vs Paid Model?**
   - Option A: Completely free, users bring own API keys (open source)
   - Option B: Free tier with limited AI calls, paid tier with included credits
   - Option C: One-time purchase (indie app model)
   - **Decision Needed By**: Before public launch
   - **Recommendation**: Option A for MVP (BYOK), evaluate B post-PMF

2. **AI Transparency Level?**
   - Show all prompts and responses to users for learning?
   - Or abstract away AI details for simplicity?
   - **Decision Needed By**: Before AI implementation
   - **Recommendation**: Medium transparency - show prompt outlines, allow "Show Full Prompt" for curious users

3. **Center Notation Standard?**
   - Develop formal syntax for marking centers in markdown?
   - Keep it implicit (AI infers, user confirms)?
   - **Decision Needed By**: Epic 2 implementation
   - **Recommendation**: Implicit with optional explicit syntax for power users

4. **Gamification Elements?**
   - Track writing streaks, center evolution depth, wholeness improvements?
   - Keep purely utility-focused?
   - **Decision Needed By**: Post-MVP
   - **Recommendation**: Subtle progress indicators, no aggressive gamification (aligns with Bill Evans' "enjoy the process" philosophy)

### Technical Questions

5. **Editor Choice for Standalone Version?**
   - CodeMirror 6 (modern, extensible, performance)
   - Monaco (VS Code's editor, feature-rich, heavier)
   - ProseMirror (structured editing, complex)
   - **Decision Needed By**: If/when building standalone
   - **Recommendation**: CodeMirror 6 for balance of performance and features

6. **Mobile Strategy?**
   - Responsive web app adequate?
   - Native iOS/Android apps needed?
   - **Decision Needed By**: Post-MVP after usage analytics
   - **Recommendation**: Start with responsive web/Obsidian mobile, evaluate native post-PMF

7. **Real-time Collaboration Architecture?**
   - Operational Transformation (complex, proven)
   - CRDTs (simpler, eventual consistency)
   - Simple turn-based editing with locking
   - **Decision Needed By**: Epic 7 planning
   - **Recommendation**: Start with turn-based, evaluate CRDTs if demand high

---

## Risks & Mitigation Strategies

### Risk 1: AI Response Quality Inconsistency
**Severity**: High
**Probability**: Medium
**Impact**: Users lose trust if center suggestions are frequently irrelevant

**Mitigation**:
- Extensive prompt engineering with examples from actual Saligo Writing documents
- A/B test prompts with internal users before launch
- Collect user feedback: "Was this suggestion helpful?" with thumbs up/down
- Implement prompt versioning to iterate quickly
- Fallback to simpler heuristics if AI confidence is low
- Clear disclaimer: "AI suggestions are starting points, not prescriptions"

---

### Risk 2: API Cost Overruns for Users
**Severity**: Medium
**Probability**: Medium
**Impact**: Users surprised by high API bills, negative reviews

**Mitigation**:
- Prominent cost estimator before each AI call
- Monthly budget settings with warnings at 50%, 80%, 100%
- Client-side rate limiting (max X calls per hour)
- Efficient prompts (minimize tokens without sacrificing quality)
- Cache identical requests for 24 hours
- Provide cost comparison guide: "Center finding typically costs $0.01"

---

### Risk 3: Methodology Learning Curve
**Severity**: High
**Probability**: High
**Impact**: Users don't understand Saligo Writing principles, use tool ineffectively

**Mitigation**:
- Interactive onboarding tutorial: "Write a seed sentence, discover centers, expand"
- In-app contextual help tooltips explaining concepts (Wholeness, Centers, Generative Sequence)
- Example documents with annotations showing Saligo process
- Video tutorials with Kim Changjon or community experts
- "Saligo Score" that teaches principles through feedback
- Community forum for sharing techniques

---

### Risk 4: Obsidian Plugin Approval Delays
**Severity**: Medium
**Probability**: Medium
**Impact**: Delayed MVP launch, missed momentum

**Mitigation**:
- Review Obsidian plugin guidelines thoroughly before development
- Submit early draft for community feedback
- Engage with Obsidian developer community during development
- Have web app MVP ready as backup distribution channel
- Offer beta via BRAT (Beta Reviewers Auto-update Tester) while awaiting approval

---

### Risk 5: Over-Reliance on AI (Human Agency Loss)
**Severity**: Medium
**Probability**: Medium
**Impact**: Users become passive, let AI write instead of discovering their own voice

**Mitigation**:
- Design philosophy: AI suggests, human decides (never auto-apply)
- Suggestions are starting points, not replacements
- Track "AI acceptance rate" - flag if >80% (user may be over-reliant)
- Periodic prompts: "Take a moment to find centers yourself before asking AI"
- Celebrate user-identified centers prominently
- Bill Evans principle: "Build your own foundation, tools assist"

---

### Risk 6: Data Loss (Sync Conflicts, Corruption)
**Severity**: High
**Probability**: Low
**Impact**: Catastrophic user trust loss if writing is lost

**Mitigation**:
- Git-based versioning (nearly impossible to lose data)
- Automatic local backups every 5 minutes (keep 100 most recent)
- Clear conflict resolution UI (never silent overwrites)
- Export function (download all data as .zip anytime)
- Canary tests: Simulate conflicts in staging environment
- Incident response plan: Priority 0 if data loss reported

---

### Risk 7: Limited AI Context Window for Long Documents
**Severity**: Medium
**Probability**: High
**Impact**: AI suggestions become less relevant in documents >10k words

**Mitigation**:
- Sliding window approach (analyze section + surrounding context)
- Document structure map (AI sees outline + current section content)
- User can explicitly provide context: "Consider this earlier section too"
- Progressive summarization for long docs (extract key centers from each section)
- Set expectations: "Works best on documents under 20k words"
- Future: RAG (Retrieval Augmented Generation) for full document context

---

## MVP Definition (Must-Ship for Initial Launch)

**Goal**: Validate that Saligo Writing with AI assistance reduces entry friction and increases writing completion rates

**Included Epics**:
- Epic 1: Low-Energy Writing Initiation (US-1.1, US-1.2)
- Epic 2: AI-Assisted Center Discovery (US-2.1, US-2.2, US-2.3)
- Epic 3: Iterative Refinement Tools (US-3.1, US-3.2)
- Epic 4: Academic Writing Structure Support (US-4.1, US-4.2)

**Platform**: Obsidian Plugin (can expand to web app post-MVP)

**MVP Success Criteria**:
1. 50 beta users complete onboarding
2. 30% use tool for 2+ weeks consecutively
3. Average 3+ documents per active user
4. 70% report "writing feels easier" in exit survey
5. 60% of started documents marked complete (vs 20% industry baseline)

**Out of Scope for MVP**:
- Multi-LLM support (Claude only)
- GitHub automatic sync (manual export/import only)
- Collaborative features
- Mobile-specific optimizations
- Advanced analytics/gamification

**Timeline**: 12-16 weeks from kickoff to beta launch

---

## Future Roadmap Considerations (Post-MVP)

### Phase 2 (Months 4-6): Expand Reach
- Multi-LLM support (GPT-4, Gemini)
- Standalone web app version
- GitHub automatic sync
- Mobile responsive optimizations
- Internationalization (Korean + English full support)

### Phase 3 (Months 7-9): Collaborative Writing
- Shared documents with commenting
- Center discussion threads
- Advisor review mode (track suggestions)
- Export to Google Docs/Word with version history

### Phase 4 (Months 10-12): Advanced Intelligence
- Document structure templates (research paper, essay, blog post)
- Cross-document center discovery (find themes across all writings)
- Writing style evolution tracking
- Personalized AI tuning (learns user's voice over time)

### Phase 5 (Year 2): Community & Education
- Public sharing of anonymized "Saligo journeys"
- Course integration (professors assign Saligo exercises)
- Community prompt library (share effective expansion strategies)
- Writing coach marketplace (certified Saligo practitioners)

---

## Design Principles (Transformation-Centered)

### 1. Preserve Structural Life
- Every feature must enhance cohesion, not fragment attention
- Minimize modal dialogs - use inline/sidebar for AI suggestions
- Visual hierarchy: Writing content always primary, tools secondary
- Respect user's flow state - no interrupting notifications

### 2. Generative Sequence Over Iteration
- Frame development as "What's the next small structural improvement?"
- Each Transformation enhances one aspect: center discovery, wholeness analysis, refinement
- No "version 2.0 rewrites" - evolve features incrementally
- Document impact: "This change improved paragraph unity detection by 15%"

### 3. Truth Over Approximation (Bill Evans Principle)
- Better to do one thing perfectly than many things poorly
- MVP focuses on core Saligo loop: seed → centers → expand → refine
- No "good enough" AI prompts - rigorously test with real writing samples
- Measure what matters: completion rate, not feature count

### 4. Co-Design with Users
- Users are collaborators, not customers to satisfy
- Early beta program treats users as co-creators
- Weekly feedback sessions during MVP development
- Transformation decisions explained transparently in changelog
- User scenarios directly become Transformation Intents

### 5. Living Documentation
- This PRD evolves with product - not frozen at kickoff
- Each shipped Transformation updates relevant sections
- Open questions get resolved and documented
- Success metrics reviewed quarterly, adjusted based on learning

---

## Acceptance Criteria for PRD Itself

This PRD is considered "shipped" when:
- [x] Product vision clearly articulates Saligo Writing philosophy
- [x] Success metrics defined with specific, measurable targets
- [x] 3 user personas with detailed pain points and goals
- [x] 20+ user stories across 4 MVP epics
- [x] Non-functional requirements cover performance, security, accessibility, i18n
- [x] Technical constraints evaluated with recommendation
- [x] 7+ risks identified with concrete mitigation strategies
- [x] Clear MVP definition with scope and timeline
- [x] Future roadmap shows 2-year vision
- [ ] Reviewed by 2+ stakeholders (technical lead + domain expert)
- [ ] Kim Changjon (or Saligo Writing expert) validates methodology representation
- [ ] 1 round of user persona validation with target users

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-01 | Claude (Transformation Agent) | Initial comprehensive PRD based on project context |
| 1.1 | 2025-11-02 | Claude (Transformation Agent) | Updated with TUTORIAL-EN.md insights: Added 7-day user journey, Step-by-Step Workflow section, enhanced Gather Seeds feature with photo support, center strength scoring (⭐⭐⭐), Option A/B/C expansion style, wholeness progression tracking, before/after comparison, mobile scenarios with voice/photo examples |

---

## References

1. **Christopher Alexander** - "The Nature of Order" (Wholeness, Centers, Generative Sequence concepts)
2. **Bill Evans** - "Universal Mind" documentary (Step-by-step learning philosophy)
3. **Kim Changjon** - Saligo Writing methodology documentation
4. **Obsidian Plugin API** - https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin
5. **Claude API** - https://docs.anthropic.com/claude/reference/getting-started-with-the-api
6. **CommonMark Spec** - https://spec.commonmark.org/

---

**Next Steps**:
1. **Review & Validate**: Share with Kim Changjon for Saligo methodology accuracy
2. **Technical Spike**: 2-week research on Obsidian plugin architecture and AI integration
3. **Define T-YYYYMMDD-001**: First Transformation - "Establish Project Foundation and Development Environment"
4. **User Interviews**: Conduct 10 interviews with target personas to validate pain points
5. **Create TRANSFORMATIONS.md**: Initialize Transformation log with development roadmap

---

> **Living PRD Note**: This document evolves with each Transformation. Refer to TRANSFORMATIONS.md for detailed change history and structural evolution tracking.
