# Product Specification: Find Centers from MOC

**Feature ID**: MOC-CENTER-DISCOVERY
**Version**: 1.0
**Status**: Approved for Development
**Last Updated**: 2025-11-06
**Author**: Product Management

---

## Executive Summary

**Find Centers from MOC** is an advanced workflow feature that enables users to discover structural centers from existing MOC (Map of Content) files. While the existing "Gather Seeds" feature works with scattered seed notes (10-20 notes), this feature analyzes already-organized knowledge in MOC files (15-30 linked notes) to reveal hidden patterns and generate starting points for academic and professional writing.

**Business Impact**: Bridges the gap between knowledge organization and writing generation, transforming static MOCs into dynamic writing starting points. Targets graduate students, researchers, and professional writers who maintain structured knowledge bases.

**Strategic Fit**: Extends Saligo Writing methodology from exploratory (Gather Seeds) to structured (MOC-based) writing contexts. Complements Living MOC feature by providing consumption pathway for organized knowledge.

---

## Product Vision Summary

Transform MOCs from passive link collections into active writing catalysts. Enable users to ask: **"I've organized 15 notes on learning methodology - what thesis should I write?"** and receive AI-discovered structural centers that reveal the hidden coherence in their organized knowledge.

**Core Philosophy**: MOCs are not just organizational tools - they are maps that reveal the structure of knowledge you've already woven together. WriteAlive discovers the hidden centers in these maps and transforms them into writing starting points.

---

## Success Metrics

### Primary KPIs (Business Value)

1. **Feature Adoption Rate**: 40% of active users try "Find Centers from MOC" within 30 days of release
2. **MOC-to-Writing Conversion**: 60% of MOC analyses result in document creation (vs 70% for Gather Seeds)
3. **Academic Writing Usage**: 70% of usage comes from users with MOCs in research/academic contexts
4. **Repeat Usage**: 50% of users who try feature use it 3+ times per month

### Secondary KPIs (User Engagement)

5. **Average MOC Size Analyzed**: 12-18 notes (sweet spot for center discovery)
6. **Center Quality**: 80% of MOC analyses produce at least 1 "Strong" center
7. **Time to Writing**: Users start writing within 10 minutes of running command (vs 15 min for manual synthesis)
8. **Cost Efficiency**: Average analysis cost $0.02-0.03 (within acceptable range for academic users)

### Quality Indicators (Feature Excellence)

9. **Center Coherence**: 75% of users rate discovered centers as "highly relevant" to their MOC topic
10. **Discovery Value**: 60% of users report discovering connections they hadn't consciously recognized
11. **Document Completion**: 55% of MOC-started documents reach completion (vs 60% for Gather Seeds)
12. **Cross-Feature Usage**: 50% of MOC users also use Living MOC feature (synergy)

### Concrete Before/After Comparison

**Traditional Method** (Manual MOC Synthesis):
- **Review MOC**: 5-10 minutes scanning links
- **Re-read notes**: 20-30 minutes reading 15 notes
- **Manual synthesis**: 30-45 minutes identifying patterns, outlining
- **Result**: Thesis/outline identified after 55-85 minutes
- **Completion rate**: ~40% (often abandon due to analysis paralysis)

**Find Centers from MOC Method**:
- **Select MOC**: 30 seconds (Command Palette or Ribbon)
- **AI Analysis**: 5-7 seconds (automatic)
- **Review centers**: 2-3 minutes (browse 3-5 discovered centers)
- **Start writing**: Immediate (click "Start Writing")
- **Result**: Document created with thesis and seed references in ~3-5 minutes
- **Completion rate**: Target 60%

**Key Efficiency Gains**:
- **Time savings**: 50-80 minutes → 3-5 minutes (94% reduction in pre-writing time)
- **Mental load**: High cognitive effort → Low friction browsing
- **Discovery quality**: Manual connections → AI-revealed cross-domain patterns
- **Completion probability**: 40% → 60% (50% improvement)

---

## Target User Personas

### 1. The Academic Researcher (Primary - 50% of users)

**Profile**:
- Graduate students, post-docs, professors
- Maintain MOCs for literature reviews, chapter outlines, research domains
- 10-30 MOCs in vault, each with 15-25 linked notes
- Writing papers, theses, dissertations, grant proposals

**Pain Points**:
- "I've collected 20 papers on feedback loops in learning - what's my thesis?"
- "I have a Chapter 2 MOC with all my literature review notes - how do I synthesize this?"
- "I know there's a pattern across these studies, but I can't articulate it clearly"
- Manual synthesis takes hours and feels overwhelming

**Goals**:
- Quickly identify the core argument/thesis from collected research
- Find structural patterns across disparate studies
- Generate literature review structure from organized notes
- Reduce time spent on synthesis, more time writing

**Success Scenario**:
> "I have a Chapter-2-Literature-Review MOC with 18 papers. I ran Find Centers from MOC and it revealed 'Temporal Delay Problem in Feedback Loops' - a pattern I sensed but couldn't articulate. This became my thesis. 3 minutes vs 2 hours of manual synthesis."

### 2. The Professional Knowledge Worker (Secondary - 30% of users)

**Profile**:
- Product managers, consultants, technical writers, strategists
- Maintain project MOCs, topic research MOCs, meeting notes MOCs
- 5-15 MOCs, each with 10-20 notes
- Writing strategy docs, project reports, proposals, technical documentation

**Pain Points**:
- "I have a Product Strategy MOC with 15 customer interview notes - what's the core insight?"
- "My Q4 Project MOC has scattered meeting notes - what's the narrative thread?"
- "I've organized competitive research but can't see the strategic angle"
- Need to synthesize quickly for stakeholder presentations

**Goals**:
- Extract strategic insights from project documentation
- Identify key themes across customer feedback
- Generate executive summaries from meeting notes
- Create compelling narratives for proposals

**Success Scenario**:
> "My Q4-Product-Strategy MOC had 12 customer interviews and 8 competitive analysis notes. Find Centers revealed 'Integration Friction as Adoption Barrier' - a theme I missed manually. Used this center to write our Q1 strategy proposal in 30 minutes."

### 3. The Structured Learner (Tertiary - 20% of users)

**Profile**:
- Knowledge workers, self-directed learners, educators
- Maintain topic MOCs for courses, reading projects, skill development
- 3-10 MOCs, each with 8-15 notes
- Writing syntheses, teaching materials, blog posts, essays

**Pain Points**:
- "I have a Learning Methods MOC with notes from 3 books and my practice journal - what's the core lesson?"
- "My Book Club MOC has everyone's insights - how do I synthesize this?"
- "I've collected course notes in a MOC but can't see the bigger picture"
- Want to transform learning into coherent understanding

**Goals**:
- Synthesize book notes into personal insights
- Connect theoretical readings with lived experience
- Create teaching materials from organized research
- Transform course notes into blog posts/essays

**Success Scenario**:
> "My Learning-Methodology MOC had 15 notes mixing Bill Evans quotes, coding practice logs, and guitar practice notes. AI discovered 'Completeness vs Approximation' as the unifying center. This became a blog post on learning philosophy."

---

## User Journey: From MOC to Writing

### Journey Overview

**Context**: User has spent 2-4 weeks collecting notes on a topic and organizing them into a MOC. Now they want to write but need to synthesize the organized knowledge.

### Detailed Flow

#### **Phase 1: MOC Preparation** (User Work - Already Done)

**Timeframe**: Days/weeks before discovery (background activity)

User has already:
1. Created MOC file (e.g., `2025-11-Learning-Methodology-MOC.md`)
2. Organized 15-30 notes with wikilinks
3. Added headings for structure (optional but helpful)
4. Marked as MOC using one of 3 methods:
   - YAML frontmatter: `type: moc`
   - Tag: `#MOC` or `#moc`
   - Folder: Placed in `MOCs/` folder

**MOC Quality Indicators**:
- 10-25 linked notes (optimal range)
- Notes have substantial content (100+ words each)
- Notes include user's own thoughts, not just bookmarks
- Topic coherence: Notes relate to common theme
- Heading structure provides context

---

#### **Phase 2: Command Invocation** (30-60 seconds)

**User Intent**: "I want to find patterns in this MOC and start writing"

**Entry Points** (Multiple Access Patterns):

**Option A: Command Palette** (Keyboard Users - 60% of usage):
1. User presses `Ctrl/Cmd + P`
2. Types `find centers from moc` or `moc`
3. Selects `WriteAlive: Find Centers from MOC`
4. **MOC Selection Modal** appears

**Option B: Ribbon Button Context Menu** (Mouse Users - 30% of usage):
1. User right-clicks 🌱 icon in left sidebar
2. Sees context menu with 5 commands
3. Selects `🔍 Find Centers from MOC`
4. **MOC Selection Modal** appears

**Option C: File Context Menu** (Contextual - 10% of usage):
1. User right-clicks on MOC file in file explorer
2. Sees `Find Centers from This MOC` option
3. Clicks option
4. Skips MOC selection, goes directly to analysis

---

#### **Phase 3: MOC Selection** (30-90 seconds)

**UI: MOC Selection Modal**

```
╔══════════════════════════════════════════════════════════╗
║  🔍 Select MOC for Center Discovery                      ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  📊 MOCs Found: 8                                        ║
║                                                          ║
║  🔍 Search: [________________]  🏷️ Filter: [All ▾]      ║
║                                                          ║
║  ┌──────────────────────────────────────────────────┐   ║
║  │ 📄 2025-11-Learning-Methodology-MOC              │   ║
║  │    📊 15 notes • 📅 Modified 2 days ago          │   ║
║  │    🏷️ YAML • 📁 MOCs/Research/                   │   ║
║  │    [Select] [Preview]                            │   ║
║  └──────────────────────────────────────────────────┘   ║
║                                                          ║
║  ┌──────────────────────────────────────────────────┐   ║
║  │ 📄 Chapter-2-Literature-Review-MOC               │   ║
║  │    📊 22 notes • 📅 Modified 1 week ago          │   ║
║  │    🏷️ Tag #MOC • 📁 Dissertation/                │   ║
║  │    [Select] [Preview]                            │   ║
║  └──────────────────────────────────────────────────┘   ║
║                                                          ║
║  ┌──────────────────────────────────────────────────┐   ║
║  │ 📄 Q4-Product-Strategy-MOC                       │   ║
║  │    📊 12 notes • 📅 Modified today               │   ║
║  │    🏷️ Folder • 📁 Work/Projects/                 │   ║
║  │    [Select] [Preview]                            │   ║
║  └──────────────────────────────────────────────────┘   ║
║                                                          ║
║  [Cancel]                                                ║
╚══════════════════════════════════════════════════════════╝
```

**Features**:
- **Auto-detection**: Shows all MOCs detected by 3 methods
- **Metadata display**: Note count, last modified, detection method, folder
- **Search/filter**: Quick find in large vaults
- **Preview button**: View MOC content before selecting
- **Validation warnings**:
  - ⚠️ "Only 3 notes - may produce weak centers"
  - ⚠️ "35 notes - consider splitting into smaller MOCs"
  - ⚠️ "Notes average 50 words - consider adding more content"

**User Action**: Selects MOC → Clicks [Select] → Modal closes → Processing begins

---

#### **Phase 4: AI Analysis** (5-7 seconds - Automatic)

**Processing Steps** (Visible Progress):

```
✅ Loading MOC structure... (1s)
   → Found 15 linked notes across 3 sections

✅ Reading note contents... (2-3s)
   → Extracted 12,000 words from 15 notes
   → Detected 3 photos, 8 backlinks

✅ AI structural pattern analysis... (5-7s)
   → Claude 3.5 Sonnet discovering centers
   → Analyzing cross-domain patterns
   → Evaluating structural pivots

✅ Center discovery complete!
   → 3 strong centers, 2 medium centers found
```

**Technical Operations**:
1. Parse MOC structure (MOCDetector service)
2. Extract linked note paths
3. Read note contents (exclude frontmatter)
4. Build context object (CenterFindingContext)
5. Call AIService.discoverCentersFromMOC()
6. AI analyzes patterns, returns DiscoveredCenter[]
7. Group centers by strength
8. Calculate costs and statistics

**Performance Targets**:
- MOC parsing: <500ms for 30 notes
- Content reading: <2s for 50,000 words
- AI analysis: 5-7s typical, 10s max
- **Total time**: <10 seconds for 95% of MOCs

**Cost Targets**:
- Average: $0.020-0.025 per analysis
- Range: $0.015 (10 notes) - $0.035 (30 notes)
- 15 notes, 12,000 words: ~18,000 tokens = $0.023

---

#### **Phase 5: Center Discovery Results** (2-3 minutes - User Review)

**UI: Center Discovery Modal** (Same as Gather Seeds, with MOC context)

```markdown
╔══════════════════════════════════════════════════════════════╗
║  🔍 Centers Found from MOC                                   ║
║  Source: 2025-11-Learning-Methodology-MOC.md (15 notes)     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ⭐⭐⭐ Strong Centers (3)                                    ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │ 📍 "Completeness vs Approximation"                     │ ║
║  │                                                        │ ║
║  │ 💡 Explanation:                                        │ ║
║  │ All your notes converge around the contrast of        │ ║
║  │ "small parts completely" vs "whole vaguely." From     │ ║
║  │ Bill Evans' "don't approximate" to programming TDD,   │ ║
║  │ to trees growing one branch at a time - all share    │ ║
║  │ this structure.                                        │ ║
║  │                                                        │ ║
║  │ 🔗 Connected Notes (9/15):                             │ ║
║  │    [[Bill Evans Practice Philosophy]] ⭐⭐⭐           │ ║
║  │    [[Guitar Practice Week 4 Log]] ⭐⭐⭐              │ ║
║  │    [[Programming TDD Experience]] ⭐⭐                 │ ║
║  │    [[Tree Growth Timelapse]] ⭐⭐                      │ ║
║  │    [[Nature of Order - Generative Sequence]] ⭐⭐     │ ║
║  │    [[Atomic Habits - Power of Small]] ⭐              │ ║
║  │    ... and 3 more                                     │ ║
║  │                                                        │ ║
║  │ 📊 Center Strength Indicators:                         │ ║
║  │    • Cross-domain: 9/10 (music→coding→writing)       │ ║
║  │    • Emotional resonance: 8/10 (core value)          │ ║
║  │    • Concreteness: 9/10 (abstract + concrete)        │ ║
║  │    • Structural pivot: 10/10 (9 notes center here)   │ ║
║  │                                                        │ ║
║  │    [Start Writing with This Center →]                 │ ║
║  └────────────────────────────────────────────────────────┘ ║
║                                                              ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │ 📍 "Generative Sequence"                              │ ║
║  │    (7/15 notes connected)                             │ ║
║  │    [Expand ▼]                                          │ ║
║  └────────────────────────────────────────────────────────┘ ║
║                                                              ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │ 📍 "Sensory Feedback"                                 │ ║
║  │    (6/15 notes connected)                             │ ║
║  │    [Expand ▼]                                          │ ║
║  └────────────────────────────────────────────────────────┘ ║
║                                                              ║
║  ⭐⭐ Medium Centers (2) [Show ▼]                            ║
║                                                              ║
╟──────────────────────────────────────────────────────────────╢
║  💰 Analysis: $0.023 | 18,450 tokens | Claude 3.5 Sonnet   ║
║  📊 MOC: 15 notes analyzed, 12,000 words, 3 headings        ║
║  ⏱️ Completed in 7.2 seconds                                ║
╚══════════════════════════════════════════════════════════════╝
```

**Key Differences from Gather Seeds Modal**:
1. **Source attribution**: "from MOC" instead of "from gathered seeds"
2. **MOC context**: Shows MOC structure (headings, note count)
3. **Coverage metric**: "9/15 notes connected" shows how many MOC notes relate to center
4. **Heading context**: Can show which MOC heading each connected note came from

**User Actions**:
- Browse centers (expand/collapse cards)
- Read explanations and connected notes
- Compare strength indicators
- Select center to start writing

---

#### **Phase 6: Start Writing** (<2 seconds - Automatic)

**User Action**: Clicks `[Start Writing with This Center →]` on chosen center

**Automatic Document Creation**:

1. **Generate filename**: `{date}-{center-name-slug}-from-MOC.md`
   - Example: `2025-11-08-Completeness-vs-Approximation-from-MOC.md`

2. **Create file** in output location (from settings)

3. **Insert YAML frontmatter**:
```yaml
---
title: Completeness vs Approximation
created: 2025-11-08T15:30:00
source_moc: "[[2025-11-Learning-Methodology-MOC]]"
center:
  name: "Completeness vs Approximation"
  strength: strong
  connected_notes: 9
seeds:
  - "[[Bill Evans Practice Philosophy]]"
  - "[[Guitar Practice Week 4 Log]]"
  - "[[Programming TDD Experience]]"
  - "[[Tree Growth Timelapse Observation]]"
  - "[[Nature of Order - Generative Sequence]]"
  - "[[Atomic Habits - Power of Small Habits]]"
  - "[[Writing Experiment Journal]]"
  - "[[Architectural Patterns and Learning Parallels]]"
  - "[[Code Review Philosophy]]"
tags: [writing, center-discovery, from-moc]
---
```

4. **Generate initial content** (AI-assisted):
```markdown
# Completeness vs Approximation: The Paradoxical Efficiency of Completeness in Learning

## 🌱 Center Discovery Memo

This writing emerged from the structural center discovered in your MOC `[[2025-11-Learning-Methodology-MOC]]`.

**Core Insight:**
Bill Evans said "Don't approximate the whole vaguely, but get a small part completely real, completely true."
Your guitar practice, programming learning, and writing experience all repeatedly prove this pattern.

**Questions to explore in this writing:**
- Why is "small completeness" more effective than "large approximation"?
- What's the common pattern across music/coding/writing?
- What does this imply for learning theory?

---

## ✍️ Writing Space

*Start writing freely below. Reference the 9 connected notes as you unfold your experience.*

*Tip: Use Ctrl/Cmd + P → "Suggest Next Steps" to get direction suggestions*

---


<!-- Auto-generated reference links -->
## 📚 Connected Seed Notes

### Core Connections (⭐⭐⭐)
- [[Bill Evans Practice Philosophy]] - Source of original philosophy
- [[Guitar Practice Week 4 Log]] - 4-bar perfect practice experiment
- [[Programming TDD Experience]] - Power of completing small functions

### Supporting Connections (⭐⭐)
- [[Tree Growth Timelapse Observation]] - Nature's generative pattern
- [[Nature of Order - Generative Sequence]] - Theoretical background

### Context Connections (⭐)
- [[Atomic Habits - Power of Small Habits]]
- [[Writing Experiment Journal]]
- [[Architectural Patterns and Learning Parallels]]
- [[Code Review Philosophy]]
```

5. **Open document** in editor

6. **Position cursor** at first line of "Writing Space" section

7. **Show success notice**: "Document created from center 'Completeness vs Approximation'. Ready to write!"

**Result**: User is now in writing mode with:
- Clear thesis/center to develop
- 9 connected notes as reference material
- AI-generated questions to guide exploration
- Low friction starting point (just start typing)

---

#### **Phase 7: Iterative Writing** (30-60 minutes - User-Driven)

**User Flow** (Same as Gather Seeds):

1. **Write initial paragraphs** (5-10 min)
   - Low energy start: 3-5 sentences exploring center
   - Reference connected notes naturally

2. **Invoke "Suggest Next Steps"** (AI-assisted)
   - `Ctrl/Cmd + P` → `WriteAlive: Suggest Next Steps`
   - AI offers 2-4 expansion directions
   - User chooses direction and writes

3. **Iterate expansions** (20-40 min)
   - Add concrete experience
   - Develop metaphors
   - Connect cross-domain insights
   - Build argument structure

4. **Polish and refine** (5-10 min)
   - Read aloud feedback
   - Wholeness analysis
   - Final edits

5. **Save snapshot** (optional)
   - Version control for completed draft

**Total Time**: 30-60 minutes from MOC to completed draft

---

## Functional Requirements

### FR-1: MOC Detection and Selection

**Priority**: P0 (MVP Blocker)

#### FR-1.1: Automatic MOC Detection
**Requirement**: System MUST detect all MOC files in vault using three methods:

1. **YAML Frontmatter Detection**:
   - Looks for `type: moc` in frontmatter
   - Case-insensitive matching
   - Optional: Support `type: [moc, index]` arrays

2. **Tag-Based Detection**:
   - Looks for `#MOC` or `#moc` tag (case-insensitive)
   - Supports inline tags and frontmatter tags
   - Supports tag variants: `#MOC`, `#moc`, `#map-of-content`

3. **Folder Pattern Detection**:
   - Default patterns: `MOCs/`, `Maps/`, `Map of Contents/`, `00 Maps/`, `_MOCs/`
   - User-configurable folder patterns in settings
   - Matches folders anywhere in path

**Acceptance Criteria**:
- [x] All three detection methods work independently
- [ ] Detection runs in <500ms for 1000 files
- [ ] User can configure custom folder patterns
- [ ] User can disable specific detection methods
- [ ] Detection respects `.obsidian` and excluded folders

**Dependencies**:
- Existing MOCDetector service (already implemented)
- Metadata cache API

---

#### FR-1.2: MOC Selection Modal
**Requirement**: System MUST present discoverable MOCs in selection modal

**UI Components**:
1. **List View**:
   - MOC title (filename without .md)
   - Note count (linked notes in MOC)
   - Last modified date (relative: "2 days ago")
   - Detection method badge (YAML/Tag/Folder)
   - Folder path

2. **Search Box**:
   - Filter MOCs by title
   - Real-time search as user types
   - Fuzzy matching support

3. **Filter Dropdown**:
   - All MOCs
   - By detection method (YAML/Tag/Folder)
   - By folder
   - By note count (< 10, 10-20, 20-30, > 30)
   - Recently modified (last 7 days, 30 days)

4. **Preview Button**:
   - Shows MOC content in modal
   - Displays headings and link count per section
   - Helps user confirm correct MOC

5. **Validation Warnings**:
   - "Only 3 notes - may produce weak centers"
   - "35 notes - consider splitting MOC"
   - "Notes average < 100 words - add content for better results"

**Acceptance Criteria**:
- [ ] Modal displays all detected MOCs
- [ ] Search filters in real-time (<100ms)
- [ ] Preview shows MOC structure without leaving modal
- [ ] Validation warnings help user choose quality MOCs
- [ ] Modal remembers last used MOC per session
- [ ] Keyboard navigation works (arrow keys, Enter to select)
- [ ] Accessible (ARIA labels, screen reader support)

**Edge Cases**:
- No MOCs found → Show help text with detection method instructions
- 100+ MOCs → Virtual scrolling for performance
- MOC deleted during selection → Graceful error, refresh list

---

#### FR-1.3: Quick Context Menu Entry
**Requirement**: System SHOULD provide right-click context menu on MOC files

**Implementation**:
- Right-click on MOC file in file explorer
- Shows "Find Centers from This MOC" option
- Skips selection modal, goes directly to analysis
- Only appears for files detected as MOCs

**Acceptance Criteria**:
- [ ] Context menu appears only for MOC files
- [ ] Menu item has appropriate icon (🔍)
- [ ] Clicking triggers immediate analysis
- [ ] Works with keyboard shortcuts (Shift+F10)

---

### FR-2: MOC Content Extraction

**Priority**: P0 (MVP Blocker)

#### FR-2.1: Link Extraction
**Requirement**: System MUST extract all wikilink targets from MOC content

**Extraction Logic**:
1. Parse MOC markdown content
2. Extract all wikilinks: `[[Note Title]]`, `[[Note|Alias]]`, `[[Note#Section]]`
3. Exclude embeds in code blocks or comments
4. Resolve link paths to actual files
5. Filter out non-existent notes (broken links)

**Contextual Information**:
- Parent heading (which section note appears under)
- Line number in MOC
- Display text vs actual link path

**Acceptance Criteria**:
- [ ] Extracts 100% of valid wikilinks
- [ ] Handles all wikilink formats (standard, alias, section)
- [ ] Excludes code blocks and comments
- [ ] Resolves links to actual files
- [ ] Captures parent heading context
- [ ] Handles embeds (![[Note]]) as links
- [ ] Performance: <100ms for 100 links

**Edge Cases**:
- MOC with no links → Error: "No linked notes found"
- MOC with only broken links → Error: "No valid notes found (all links broken)"
- Links to non-markdown files → Exclude from analysis
- Circular links (MOC links to itself) → Exclude self-link

---

#### FR-2.2: Note Content Reading
**Requirement**: System MUST read content from all linked notes

**Reading Logic**:
1. For each linked note in MOC:
   - Read full markdown content
   - **Exclude frontmatter** (privacy-aware)
   - Extract inline tags
   - Extract creation date
   - Count backlinks (popularity signal)
   - Detect photo embeds
   - Extract photo captions/alt text

2. Content Validation:
   - Minimum 20 words per note (else warning)
   - Maximum 10,000 words per note (else truncate with warning)
   - Total content < 100,000 words (else error)

3. Build SeedContext objects:
```typescript
{
  id: "seed-1",  // Anonymous ID
  content: "...",  // Note content without frontmatter
  tags: ["practice", "learning"],
  title: "Bill Evans Practice Philosophy",
  createdAt: 1699123456789,
  backlinkCount: 5,
  hasPhoto: true,
  photoCaption: "Bill Evans at piano"
}
```

**Acceptance Criteria**:
- [ ] Reads all linked notes successfully
- [ ] Excludes frontmatter from analysis
- [ ] Captures all inline tags
- [ ] Detects photo embeds correctly
- [ ] Handles missing/deleted notes gracefully
- [ ] Performance: <2s for 30 notes, 50,000 words total
- [ ] Respects file read errors (permissions, encoding)

**Privacy Considerations**:
- No file paths sent to AI (anonymous seed IDs)
- No vault names or folder structures exposed
- Frontmatter excluded (may contain personal metadata)
- User can preview what will be sent before analysis

---

#### FR-2.3: MOC Context Extraction
**Requirement**: System SHOULD extract MOC structural context

**Context Information**:
- MOC title
- Heading hierarchy (list of heading texts)
- Map of seed → heading (which note appears under which heading)
- Note count per section

**MOCContext Object**:
```typescript
{
  title: "2025-11 Learning Methodology MOC",
  headings: [
    "Theoretical Background",
    "Practical Experience",
    "Observations & Metaphors"
  ],
  seedsByHeading: {
    "seed-1": "Theoretical Background",
    "seed-2": "Theoretical Background",
    "seed-3": "Practical Experience",
    ...
  }
}
```

**Value**:
- AI can understand MOC organization
- Centers can reference which MOC section notes came from
- Helps AI identify domain boundaries (music vs coding vs theory)

**Acceptance Criteria**:
- [ ] Extracts all headings (h1-h6)
- [ ] Maps each seed to correct heading
- [ ] Handles notes not under any heading (pre-heading content)
- [ ] Performance: <50ms for 50 headings

---

### FR-3: AI Center Discovery from MOC

**Priority**: P0 (MVP Blocker)

#### FR-3.1: AI Service Integration
**Requirement**: System MUST provide `discoverCentersFromMOC()` method in AIService

**Method Signature**:
```typescript
async discoverCentersFromMOC(
  mocContext: MOCContext,
  seeds: SeedContext[],
  options?: {
    minCenters?: number;  // Default: 2
    maxCenters?: number;  // Default: 5
    minStrength?: 'weak' | 'medium' | 'strong';  // Default: 'weak'
  }
): Promise<CenterFindingResult>
```

**AI Prompt Strategy** (MOC-specific):
1. **Context Setup**:
   - "You are analyzing a Map of Content (MOC) - a collection of organized notes on a related topic"
   - "The user has organized these notes with headings: [heading list]"
   - "Find structural centers that unify these notes into writing starting points"

2. **MOC-Specific Instructions**:
   - "Consider the MOC structure - notes under same heading may form domain clusters"
   - "Look for patterns that span multiple MOC sections (cross-domain centers are strongest)"
   - "The user likely intends to write academic/professional content, not exploratory essays"

3. **Center Quality Criteria** (Enhanced for MOC):
   - Cross-domain: Spans 2+ MOC sections (higher weight)
   - Depth: Appears in multiple notes within same section
   - Academic value: Suitable for thesis/argument
   - Coherence: Notes logically support the center

4. **Output Format**: Same as Gather Seeds (DiscoveredCenter[])

**Acceptance Criteria**:
- [ ] Method integrates with existing AIService architecture
- [ ] Uses same CenterFindingResult interface as Gather Seeds
- [ ] Prompt optimized for MOC context (not seed gathering)
- [ ] Returns 2-5 centers typically
- [ ] Centers grouped by strength (strong/medium/weak)
- [ ] Cost estimation included
- [ ] Token usage tracked

**Performance Targets**:
- 10 notes, 5,000 words: 3-5 seconds, $0.015
- 20 notes, 15,000 words: 5-7 seconds, $0.025
- 30 notes, 30,000 words: 7-10 seconds, $0.035

---

#### FR-3.2: Center Quality Optimization for MOC
**Requirement**: System SHOULD produce higher-quality centers for MOC context

**MOC-Specific Quality Signals**:

1. **Structural Coherence** (New Metric):
   - How many MOC sections does center span?
   - Score: 3+ sections = 10/10, 2 sections = 7/10, 1 section = 4/10

2. **MOC Heading Alignment**:
   - Does center align with user's organizational intent (heading names)?
   - Example: If MOC has "Theory" and "Practice" sections, center should bridge both

3. **Academic Suitability** (Enhanced):
   - Is center suitable for thesis statement?
   - Does it invite argument/analysis (not just description)?
   - Can it support 1000+ word essay?

4. **Note Coverage**:
   - What % of MOC notes connect to this center?
   - Strong centers: 50-80% coverage
   - Medium centers: 30-50% coverage
   - Weak centers: <30% coverage

**Acceptance Criteria**:
- [ ] Centers spanning 3+ MOC sections scored higher
- [ ] Centers suitable for academic writing prioritized
- [ ] Coverage metric displayed in UI
- [ ] AI explains which MOC sections contribute to center

---

#### FR-3.3: Error Handling and Edge Cases
**Requirement**: System MUST handle MOC-specific failure modes gracefully

**Error Scenarios**:

1. **Too Few Notes**:
   - <5 notes: Error: "MOC has only 3 notes. Need at least 5 for meaningful center discovery."
   - Suggest: "Add more notes to MOC" or "Use Gather Seeds instead"

2. **Too Many Notes**:
   - >30 notes: Warning: "MOC has 35 notes. Consider splitting into smaller MOCs for better results."
   - Offer: "Analyze anyway" or "Cancel and split MOC"

3. **Weak Centers Only**:
   - AI returns only weak centers: "No strong patterns found. Notes may be too diverse or lack thematic coherence."
   - Suggest: "Try narrowing MOC topic" or "Add more notes with your own insights"

4. **No Centers Found**:
   - AI cannot identify any centers: "Unable to find structural centers. Notes may lack common themes."
   - Suggest: "Review MOC organization" or "Use manual writing approach"

5. **Insufficient Content**:
   - Notes average <100 words: Warning: "Notes are very short (avg 50 words). Centers may be weaker."
   - Suggest: "Add more detail to notes for better analysis"

6. **Content Too Heterogeneous**:
   - AI detects 5+ unrelated topics: "MOC appears to mix multiple unrelated topics."
   - Suggest: "Split into topic-specific MOCs" or "Accept diverse centers"

**Acceptance Criteria**:
- [ ] All error scenarios show helpful messages
- [ ] Suggestions are actionable (not just "try again")
- [ ] User can proceed with warnings (not hard-blocked)
- [ ] Errors logged for diagnostics
- [ ] Cost not charged for errors

---

### FR-4: Center Display and Selection

**Priority**: P0 (MVP Blocker)

#### FR-4.1: Reuse Existing Center Discovery Modal
**Requirement**: System MUST use existing CenterDiscoveryModal with MOC-specific adaptations

**Adaptations Needed**:

1. **Header Change**:
   - Current: "Centers Discovered (from 8 seeds)"
   - MOC: "Centers Found from MOC" + "Source: {MOC filename} ({N} notes)"

2. **Footer MOC Stats**:
   - Current: "8 seeds analyzed, 2,500 words"
   - MOC: "15 notes analyzed, 12,000 words, 3 headings"

3. **Coverage Metric** (New):
   - Display "9/15 notes connected" for each center
   - Shows how much of MOC the center covers

4. **Heading Context** (Optional, P1):
   - Show which MOC heading each connected note came from
   - Example: "[[Bill Evans]] (Theoretical Background)"
   - Helps user understand cross-domain span

**Acceptance Criteria**:
- [ ] Modal displays MOC-specific header
- [ ] Footer shows MOC statistics
- [ ] Coverage metric visible for each center
- [ ] All existing modal features work (expand/collapse, strength grouping)
- [ ] "Start Writing" button creates MOC-attributed document

**Code Changes**:
- Extend CenterFindingResult with optional `mocContext` field
- Modal conditionally renders MOC-specific UI elements
- No breaking changes to existing Gather Seeds workflow

---

### FR-5: Document Creation from MOC

**Priority**: P0 (MVP Blocker)

#### FR-5.1: MOC-Attributed Document Generation
**Requirement**: System MUST create documents with MOC source attribution

**Document Template**:

1. **Filename Pattern**:
   - Format: `{date}-{center-slug}-from-MOC.md`
   - Example: `2025-11-08-Completeness-vs-Approximation-from-MOC.md`
   - Suffix `-from-MOC` distinguishes from Gather Seeds documents

2. **YAML Frontmatter**:
```yaml
---
title: {Center Name}
created: {ISO Timestamp}
source_moc: "[[{MOC Filename}]]"  # NEW: Links back to MOC
center:
  name: "{Center Name}"
  strength: {strong|medium|weak}
  connected_notes: {N}
seeds:
  - "[[Note 1]]"
  - "[[Note 2]]"
  ...
tags: [writing, center-discovery, from-moc]  # NEW: from-moc tag
---
```

3. **Center Discovery Memo**:
   - Current: "This writing emerged from the structural center discovered in your seeds."
   - MOC: "This writing emerged from the structural center discovered in your MOC [[{MOC Name}]]."

4. **Connected Notes Section**:
   - Optional: Group notes by MOC heading
   - Example:
     ```markdown
     ## 📚 Connected Seed Notes

     ### From "Theoretical Background"
     - [[Bill Evans Practice Philosophy]] ⭐⭐⭐
     - [[Nature of Order]] ⭐⭐

     ### From "Practical Experience"
     - [[Guitar Practice Log]] ⭐⭐⭐
     - [[Programming TDD]] ⭐⭐
     ```

**Acceptance Criteria**:
- [ ] Documents link back to source MOC
- [ ] Frontmatter includes `source_moc` field
- [ ] Tags include `from-moc` for filtering
- [ ] Filename includes `-from-MOC` suffix
- [ ] Center discovery memo references MOC
- [ ] All existing document creation features work (seed links, initial content, cursor positioning)

**Backward Compatibility**:
- Gather Seeds documents continue to use existing template
- No changes to DocumentCreator API (add optional `sourceMOC` parameter)

---

### FR-6: Settings and Configuration

**Priority**: P1 (Post-MVP)

#### FR-6.1: MOC Detection Settings
**Requirement**: System SHOULD allow users to configure MOC detection

**Settings UI**:
```
╔══════════════════════════════════════════════════════════╗
║  WriteAlive Settings > MOC Detection                     ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Detection Methods:                                      ║
║    [x] YAML frontmatter (type: moc)                      ║
║    [x] Tag-based (#MOC, #moc)                            ║
║    [x] Folder patterns                                   ║
║                                                          ║
║  Custom Folder Patterns:                                 ║
║    [MOCs/, Maps/, _Maps/________________] [+ Add]        ║
║                                                          ║
║  Minimum Note Count:                                     ║
║    [5___] notes (MOCs with fewer will show warning)      ║
║                                                          ║
║  Maximum Note Count:                                     ║
║    [30___] notes (MOCs with more will show warning)      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

**Configuration Options**:
- Enable/disable each detection method
- Add custom folder patterns
- Set min/max note count thresholds
- Configure warning messages

**Acceptance Criteria**:
- [ ] All settings persist across sessions
- [ ] Settings affect detection immediately (no restart)
- [ ] Validation prevents invalid configurations
- [ ] Default settings work for 90% of users

---

#### FR-6.2: MOC Analysis Settings
**Requirement**: System SHOULD allow users to configure analysis behavior

**Settings UI**:
```
╔══════════════════════════════════════════════════════════╗
║  WriteAlive Settings > MOC Analysis                      ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Center Discovery:                                       ║
║    Minimum Centers: [2___]                               ║
║    Maximum Centers: [5___]                               ║
║    Minimum Strength: [Weak ▾] (Weak/Medium/Strong)       ║
║                                                          ║
║  Content Processing:                                     ║
║    [x] Include photo captions in analysis                ║
║    [x] Analyze backlink context (slower, more context)   ║
║    [ ] Include frontmatter tags in analysis              ║
║                                                          ║
║  Performance:                                            ║
║    Max words per note: [10,000___]                       ║
║    Max total words: [100,000___]                         ║
║    Timeout: [30___] seconds                              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

**Acceptance Criteria**:
- [ ] Settings validated (min < max, reasonable limits)
- [ ] Changes take effect immediately
- [ ] Performance settings prevent API timeouts
- [ ] Default settings optimized for quality/cost balance

---

### FR-7: Integration with Existing Features

**Priority**: P1 (Post-MVP Enhancement)

#### FR-7.1: Living MOC Integration
**Requirement**: System SHOULD integrate with Living MOC feature

**User Story**: "As a user with Living MOCs that auto-gather seeds, I want to periodically re-discover centers as my MOC grows."

**Integration Points**:

1. **Auto-Discovery Suggestion**:
   - When Living MOC updates (new seeds added), show notice:
     "Your MOC '{MOC Name}' has 5 new seeds. Discover new centers? [Discover] [Later]"

2. **Center Evolution Tracking**:
   - Compare current centers with previous discoveries
   - Show: "New center emerged: 'Sensory Feedback' (not present last month)"

3. **MOC Maturity Indicator**:
   - Track how centers strengthen over time
   - Display: "Center 'Completeness vs Approximation' strengthened from Medium to Strong"

**Acceptance Criteria**:
- [ ] Living MOC updates suggest center re-discovery
- [ ] Center evolution tracked in document frontmatter
- [ ] User can see historical center discoveries
- [ ] Opt-in feature (not forced)

---

#### FR-7.2: Snapshot Integration
**Requirement**: System SHOULD support MOC center snapshots

**Use Case**: "Save a snapshot of discovered centers before MOC grows significantly"

**Features**:
- Snapshot captures: MOC state, discovered centers, connected notes
- User can restore old center discoveries
- Compare: "How did centers change as MOC evolved?"

**Acceptance Criteria**:
- [ ] Snapshots include MOC metadata
- [ ] User can view historical center discoveries
- [ ] Diff view shows center evolution

---

## Non-Functional Requirements

### NFR-1: Performance

**NFR-1.1: MOC Detection Speed**
- **Requirement**: Detect all MOCs in vault in <500ms for 1000 files
- **Measurement**: 95th percentile latency
- **Rationale**: Users expect instant command availability

**NFR-1.2: Content Reading Speed**
- **Requirement**: Read 30 notes (50,000 words) in <2 seconds
- **Measurement**: Average time from selection to analysis start
- **Rationale**: Minimize waiting time before AI analysis

**NFR-1.3: AI Analysis Speed**
- **Requirement**: Complete analysis in <10 seconds for 95% of MOCs
- **Measurement**: Time from analysis start to result display
- **Rationale**: User attention span; competitive with manual synthesis

**NFR-1.4: Modal Responsiveness**
- **Requirement**: MOC selection modal renders in <100ms
- **Requirement**: Search/filter responds in <100ms
- **Measurement**: Time to interactive
- **Rationale**: Perceived performance; professional feel

---

### NFR-2: Scalability

**NFR-2.1: Vault Size**
- **Support**: Up to 10,000 notes in vault
- **Support**: Up to 100 MOCs in vault
- **Graceful Degradation**: Virtual scrolling for >50 MOCs

**NFR-2.2: MOC Size**
- **Optimal**: 10-25 notes per MOC
- **Support**: Up to 30 notes per MOC
- **Warning**: 30-50 notes ("consider splitting")
- **Hard Limit**: 50 notes (performance protection)

**NFR-2.3: Content Volume**
- **Optimal**: 10,000-25,000 words total
- **Support**: Up to 100,000 words total
- **Hard Limit**: 100,000 words (cost protection)

---

### NFR-3: Cost Efficiency

**NFR-3.1: Average Cost Targets**
- **Target**: $0.020-0.025 per analysis (typical MOC)
- **Range**: $0.015 (small MOC) - $0.035 (large MOC)
- **Monthly Budget**: $5-10 for active user (10-20 analyses/month)

**NFR-3.2: Cost Transparency**
- **Requirement**: Always display estimated cost before analysis
- **Requirement**: Display actual cost after analysis
- **Requirement**: Monthly cost tracking in settings

**NFR-3.3: Cost Protection**
- **Warning**: Show warning for analyses >$0.05
- **Confirmation**: Require confirmation for analyses >$0.10
- **Hard Limit**: Block analyses >$0.50 (likely configuration error)

---

### NFR-4: Reliability

**NFR-4.1: Error Recovery**
- **Requirement**: Gracefully handle all API failures
- **Requirement**: Retry failed requests (3 attempts with backoff)
- **Requirement**: Offline detection (fail fast with helpful message)

**NFR-4.2: Data Integrity**
- **Requirement**: Never corrupt MOC files
- **Requirement**: Never lose user data during analysis
- **Requirement**: Atomic document creation (success or rollback)

**NFR-4.3: API Limits**
- **Requirement**: Respect Claude API rate limits
- **Requirement**: Queue requests during rate limit periods
- **Requirement**: Show wait time to user ("rate limited, retry in 30s")

---

### NFR-5: Usability

**NFR-5.1: Discoverability**
- **Requirement**: Feature discoverable within 2 clicks from any entry point
- **Requirement**: Command appears in Command Palette auto-complete
- **Requirement**: Ribbon button context menu shows all commands

**NFR-5.2: Learnability**
- **Requirement**: First-time users complete flow without documentation
- **Requirement**: UI provides contextual help and suggestions
- **Requirement**: Error messages explain what went wrong and how to fix

**NFR-5.3: Accessibility**
- **Requirement**: Full keyboard navigation support
- **Requirement**: ARIA labels for screen readers
- **Requirement**: High contrast mode support
- **Requirement**: Respects system font size preferences

---

### NFR-6: Security and Privacy

**NFR-6.1: Data Minimization**
- **Requirement**: No file paths sent to AI
- **Requirement**: No vault names or folder structures exposed
- **Requirement**: Frontmatter excluded (may contain personal data)

**NFR-6.2: API Key Security**
- **Requirement**: API keys encrypted at rest
- **Requirement**: Keys never logged or exposed in UI
- **Requirement**: Keys scoped to minimum required permissions

**NFR-6.3: User Consent**
- **Requirement**: First-time users see data usage disclosure
- **Requirement**: Users can preview content before sending to AI
- **Requirement**: Opt-out option for all AI features

---

### NFR-7: Maintainability

**NFR-7.1: Code Quality**
- **Requirement**: 80%+ test coverage for new code
- **Requirement**: All public APIs documented with JSDoc
- **Requirement**: TypeScript strict mode enabled

**NFR-7.2: Architecture**
- **Requirement**: MOC feature follows existing Transformation-Centered patterns
- **Requirement**: No breaking changes to existing Gather Seeds workflow
- **Requirement**: Clear separation: MOC detection → Content extraction → AI analysis → Document creation

**NFR-7.3: Monitoring**
- **Requirement**: Log all API calls (timestamp, cost, success/failure)
- **Requirement**: Track feature usage metrics (anonymized)
- **Requirement**: Error reporting with context (no PII)

---

## Comparison: Gather Seeds vs Find Centers from MOC

### Feature Comparison Matrix

| Aspect | Gather Seeds | Find Centers from MOC |
|--------|--------------|----------------------|
| **Input** | Scattered notes with tags | Organized MOC with links |
| **Entry Barrier** | Very Low (just tag notes) | Medium (need existing MOC) |
| **Note Count** | 5-15 typical | 10-25 typical |
| **Organization** | No pre-organization needed | Pre-organized with headings |
| **Use Case** | Exploratory, creative writing | Academic, structured writing |
| **Center Quality** | Variable (depends on seed diversity) | Higher (benefits from organization) |
| **Cross-Domain** | High (unexpected connections) | Medium (scoped to MOC topic) |
| **Time Investment** | Low (quick tag + discover) | Medium (MOC creation time) |
| **Output Type** | Essays, blog posts, reflections | Papers, reports, theses |
| **User Type** | All users (beginner-friendly) | Advanced users (PKM practitioners) |
| **Mobile-Friendly** | Yes (capture seeds on mobile) | No (MOC creation desktop-focused) |

### When to Use Each Method

**Use Gather Seeds When**:
- Starting with spontaneous ideas
- Writing blog posts, personal essays, journals
- Seeds are diverse and scattered
- Want unexpected creative connections
- Low friction quick start needed
- Mobile capture workflow

**Use Find Centers from MOC When**:
- Synthesizing organized research
- Writing academic papers, technical docs
- MOC already exists with 10+ notes
- Need structured, coherent thesis
- Professional/academic context
- Desktop-focused writing session

### Synergy Between Features

**Complementary Usage Patterns**:

1. **Sequential Flow**:
   - Month 1-4: Gather seeds, tag notes, explore ideas
   - Month 5: Organize seeds into thematic MOC
   - Month 6: Discover centers from MOC, write paper

2. **Parallel Exploration**:
   - Use Gather Seeds for weekly blog posts (exploratory)
   - Use MOC discovery for quarterly research papers (structured)

3. **Iterative Refinement**:
   - Discover centers from scattered seeds
   - Write initial draft
   - Organize related notes into MOC
   - Re-discover stronger centers from MOC
   - Write polished version

**Target Metrics**:
- 60% of MOC discovery users also use Gather Seeds
- 30% of Gather Seeds users progress to MOC discovery
- Average user uses both methods 3:1 ratio (Gather:MOC)

---

## Edge Cases and Error Scenarios

### EC-1: Insufficient MOC Content

**Scenario**: MOC has only 3 notes, all <50 words each

**Error Handling**:
- Detection Phase: Show warning in MOC selection modal
  - "⚠️ Only 3 notes - may produce weak centers"
- Analysis Phase: Proceed but set expectations
  - "Analyzing 3 short notes. Centers may be weak."
- Result Phase: If only weak centers found
  - Error: "Unable to find strong centers. Try adding more notes with detailed content."
- Suggested Actions:
  - "Add at least 5 notes to MOC"
  - "Expand existing notes to 100+ words each"
  - "Use Gather Seeds instead for scattered notes"

**Acceptance Criteria**:
- [ ] Warning shown before analysis
- [ ] User can proceed with warning
- [ ] Helpful suggestions provided
- [ ] No cost charged if analysis fails

---

### EC-2: MOC Too Large

**Scenario**: MOC has 45 notes, 75,000 words total

**Error Handling**:
- Detection Phase: Show warning in modal
  - "⚠️ 45 notes - consider splitting for better results"
- Pre-Analysis Confirmation:
  - "This MOC is very large (45 notes, ~$0.08 cost). Continue? [Yes] [Cancel]"
- Analysis Phase: Process with timeout protection
  - Show progress: "Analyzing 45 notes... (this may take 15-20 seconds)"
- Result Phase: May timeout or produce diluted centers
  - If timeout: "Analysis timed out. Try splitting MOC into smaller topic-focused MOCs."

**Suggested Actions**:
- "Split into 2-3 smaller MOCs by topic"
- "Use MOC sections: analyze 'Theory' section separately from 'Practice'"
- "Remove tangential notes to focus MOC"

**Acceptance Criteria**:
- [ ] Warning shown for >30 notes
- [ ] Cost estimate shown for >30 notes
- [ ] Timeout protection at 30 seconds
- [ ] Helpful suggestions for splitting

---

### EC-3: Heterogeneous MOC

**Scenario**: MOC mixes unrelated topics (music, programming, gardening, finance)

**Error Handling**:
- Analysis Phase: AI detects topic diversity
- Result Phase: Centers are weak or contradictory
  - Warning: "Notes cover 5+ unrelated topics. Centers may lack coherence."
  - Show centers anyway, but mark as "Diverse"
- Suggested Actions:
  - "Split MOC by topic (create Music MOC, Programming MOC, etc.)"
  - "Accept diverse centers for creative cross-domain writing"
  - "Use Gather Seeds instead for unexpected connections"

**Acceptance Criteria**:
- [ ] AI detects topic heterogeneity
- [ ] Warning shown with topic breakdown
- [ ] User can proceed or cancel
- [ ] Cost refunded if user cancels after seeing warning

---

### EC-4: All Broken Links

**Scenario**: MOC has 10 links, but all target notes have been deleted

**Error Handling**:
- Link Extraction Phase: Detect 0 valid links
- Show error immediately (no API call):
  - Error: "No valid notes found in MOC. All 10 links are broken."
  - List broken links: "[[Deleted Note 1]], [[Deleted Note 2]], ..."
- Suggested Actions:
  - "Fix broken links in MOC"
  - "Remove broken links"
  - "Use Gather Seeds to find related notes"

**Acceptance Criteria**:
- [ ] Detects broken links before API call
- [ ] Shows list of broken links
- [ ] No cost charged
- [ ] Helpful recovery suggestions

---

### EC-5: MOC is Actually Empty

**Scenario**: MOC file exists but has no content (0 bytes) or only frontmatter

**Error Handling**:
- Detection Phase: File detected as MOC
- Link Extraction Phase: No links found
- Show error:
  - Error: "MOC file is empty or has no linked notes."
- Suggested Actions:
  - "Add wikilinks to notes"
  - "Check if MOC file is corrupted"

**Acceptance Criteria**:
- [ ] Handles empty files gracefully
- [ ] No crash or API call
- [ ] Suggests next steps

---

### EC-6: Notes Have Only Frontmatter

**Scenario**: Linked notes exist but have 0 content after excluding frontmatter

**Error Handling**:
- Content Reading Phase: Detect empty content
- Show warning:
  - Warning: "3/10 notes have no content (only frontmatter). Analyzing remaining 7 notes."
- If all notes empty:
  - Error: "No content found in linked notes. Add content to notes before analysis."

**Acceptance Criteria**:
- [ ] Detects empty notes
- [ ] Proceeds with valid notes
- [ ] Shows which notes were excluded
- [ ] Suggests adding content

---

### EC-7: API Failure Mid-Analysis

**Scenario**: API call times out or returns error after 5 seconds

**Error Handling**:
- Show error with retry option:
  - Error: "AI analysis failed: [error message]"
  - "This may be a temporary issue. Retry? [Retry] [Cancel]"
- Retry Logic:
  - Attempt 1: Immediate retry
  - Attempt 2: 5-second delay
  - Attempt 3: 10-second delay
  - After 3 failures: Show permanent error
- Suggested Actions:
  - "Check internet connection"
  - "Verify API key in settings"
  - "Try again in a few minutes"

**Acceptance Criteria**:
- [ ] Graceful error display
- [ ] 3 retry attempts with backoff
- [ ] User can cancel retry
- [ ] Helpful error messages
- [ ] No duplicate charges for retries

---

### EC-8: MOC Updated During Analysis

**Scenario**: User adds/removes notes from MOC while analysis is running

**Error Handling**:
- Detection: File modification timestamp changes during read
- Options:
  1. **Ignore**: Complete analysis with old version (recommended)
  2. **Warn**: Show notice after completion
     - Notice: "MOC was modified during analysis. Results may not reflect latest changes."
- Suggested Actions:
  - "Re-run analysis to include latest changes"

**Acceptance Criteria**:
- [ ] Handles concurrent modifications gracefully
- [ ] No data corruption
- [ ] User notified of staleness
- [ ] Can re-run analysis

---

### EC-9: Very Long Note Titles

**Scenario**: Linked note has title like "This-Is-An-Extremely-Long-Note-Title-That-Goes-On-And-On-For-Many-Characters"

**Error Handling**:
- UI Display: Truncate titles in modal
  - Display: "This-Is-An-Extremely-Long-Note-Ti..."
  - Tooltip: Show full title on hover
- Seed Context: Use full title for AI (no truncation in analysis)
- Document Creation: Use truncated version in frontmatter links

**Acceptance Criteria**:
- [ ] UI remains readable
- [ ] Full title used in analysis
- [ ] Tooltips show full titles
- [ ] No layout breaking

---

### EC-10: Circular MOC References

**Scenario**: MOC links to itself or to another MOC that links back

**Error Handling**:
- Link Extraction: Detect self-references
- Exclude self-link: Don't analyze MOC file itself
- Nested MOCs:
  - If MOC links to another MOC, read the target MOC's links
  - Max depth: 1 level (don't recurse infinitely)
  - Show info: "Detected nested MOC: [[Sub-MOC]]. Analyzing its 5 linked notes."

**Acceptance Criteria**:
- [ ] Self-links excluded
- [ ] Nested MOCs handled (1 level deep)
- [ ] No infinite recursion
- [ ] User informed of nested MOC expansion

---

## Success Criteria for MVP

### Must Have (P0 - MVP Blockers)

1. ✅ **MOC Detection**: All 3 detection methods work (YAML, tag, folder)
2. ✅ **MOC Selection Modal**: Users can browse and select MOCs
3. ✅ **Content Extraction**: System reads linked notes and builds context
4. ✅ **AI Analysis**: `discoverCentersFromMOC()` returns quality centers
5. ✅ **Center Display**: Results shown in existing CenterDiscoveryModal
6. ✅ **Document Creation**: MOC-attributed documents generated correctly
7. ✅ **Error Handling**: All critical errors handled gracefully
8. ✅ **Performance**: 95% of analyses complete in <10 seconds
9. ✅ **Cost Transparency**: Costs displayed before and after analysis

### Should Have (P1 - Post-MVP)

10. ⬜ **Settings UI**: Users can configure detection and analysis behavior
11. ⬜ **Coverage Metrics**: Show "9/15 notes connected" for each center
12. ⬜ **Heading Context**: Display which MOC section notes came from
13. ⬜ **Preview Feature**: Preview MOC structure before analysis
14. ⬜ **Context Menu**: Right-click MOC file to analyze
15. ⬜ **Living MOC Integration**: Auto-suggest re-discovery when MOC grows

### Nice to Have (P2 - Future Enhancements)

16. ⬜ **Nested MOC Support**: Analyze nested MOCs (2 levels deep)
17. ⬜ **Partial MOC Analysis**: Analyze specific sections only
18. ⬜ **Center Evolution Tracking**: Compare centers over time
19. ⬜ **Batch Analysis**: Analyze multiple MOCs at once
20. ⬜ **Export Results**: Export centers as markdown report

---

## Acceptance Testing Scenarios

### Scenario 1: Academic Researcher - Literature Review

**Context**: PhD student has Chapter-2-Literature-Review MOC with 18 papers

**Test Steps**:
1. User presses Ctrl+P
2. Types "find centers from moc"
3. Selects command
4. MOC selection modal shows 8 MOCs
5. Searches for "chapter-2"
6. Selects "Chapter-2-Literature-Review-MOC"
7. Analysis begins automatically
8. Progress shown: "Analyzing 18 notes... 5s"
9. Modal displays 3 strong centers
10. User expands "Temporal Delay Problem in Feedback Loops"
11. Sees 12/18 notes connected
12. Clicks "Start Writing"
13. Document created in output folder
14. YAML includes `source_moc: [[Chapter-2-Literature-Review-MOC]]`
15. User begins writing thesis

**Expected Outcome**:
- ✅ Analysis completes in <10s
- ✅ At least 1 strong center found
- ✅ Center suitable for academic thesis
- ✅ Document links back to MOC
- ✅ Cost <$0.03

---

### Scenario 2: Product Manager - Customer Insights

**Context**: PM has Q4-Customer-Interviews MOC with 12 interview notes

**Test Steps**:
1. User right-clicks 🌱 ribbon icon
2. Selects "Find Centers from MOC"
3. Sees Q4-Customer-Interviews MOC (12 notes, modified today)
4. Clicks [Select]
5. Analysis runs (6s)
6. Modal shows 2 strong centers, 1 medium center
7. Strong center: "Integration Friction as Adoption Barrier" (9/12 notes)
8. Clicks "Start Writing"
9. Document created with 9 interview notes as seeds
10. User writes strategy proposal

**Expected Outcome**:
- ✅ Context menu access works
- ✅ Recent MOC shown at top of list
- ✅ Centers reflect customer pain points
- ✅ High note coverage (9/12)
- ✅ Document suitable for stakeholder presentation

---

### Scenario 3: Error Recovery - Weak Centers Only

**Context**: User has Monthly-Ideas MOC with 6 unrelated notes

**Test Steps**:
1. User selects Monthly-Ideas MOC
2. Warning shown: "Only 6 notes - may produce weak centers"
3. User proceeds anyway
4. Analysis completes
5. Modal shows: "Only weak centers found"
6. Error message: "Notes appear too diverse. Consider..."
7. Suggestions shown:
   - "Split by topic"
   - "Use Gather Seeds instead"
8. User clicks [Cancel]
9. Returns to selection modal

**Expected Outcome**:
- ✅ Warning shown before analysis
- ✅ Analysis completes (doesn't crash)
- ✅ Helpful error message
- ✅ Actionable suggestions
- ✅ User can retry with different MOC

---

## Roadmap and Phasing

### Phase 1: MVP (4-6 weeks)

**Goal**: Ship basic "Find Centers from MOC" feature

**Deliverables**:
- MOC detection (3 methods)
- MOC selection modal
- Content extraction and context building
- AI integration (`discoverCentersFromMOC`)
- Center display (reuse existing modal)
- Document creation with MOC attribution
- Basic error handling
- Performance optimization (<10s typical)
- Cost transparency

**Success Criteria**:
- 20% of active users try feature in first month
- 60% of trials result in document creation
- Average analysis time <8s
- 95% success rate (no crashes or API failures)

---

### Phase 2: Polish (2-3 weeks)

**Goal**: Enhance UX and fix user-reported issues

**Deliverables**:
- Settings UI for detection and analysis
- Coverage metrics ("9/15 notes")
- Heading context display
- Preview feature
- Context menu entry
- Improved error messages
- Performance tuning

**Success Criteria**:
- Feature adoption grows to 35%
- User satisfaction >80% (survey)
- Average analysis time <7s
- Support tickets <5 per week

---

### Phase 3: Integration (2-3 weeks)

**Goal**: Connect with Living MOC and advanced features

**Deliverables**:
- Living MOC integration
- Auto-suggest re-discovery
- Center evolution tracking
- Snapshot integration
- Batch analysis
- Export results

**Success Criteria**:
- 50% of Living MOC users also use center discovery
- Repeat usage >3x per month
- Cross-feature synergy demonstrated

---

### Phase 4: Advanced Features (4-6 weeks)

**Goal**: Power user features and optimizations

**Deliverables**:
- Nested MOC support (2 levels)
- Partial MOC analysis (sections only)
- Multi-MOC comparison
- Center strength trends
- Advanced filtering
- Custom AI prompts

**Success Criteria**:
- Power users (top 20%) use advanced features
- Feature adoption reaches 50%
- Retention >70% at 90 days

---

## Open Questions

### Product Questions

1. **Should we support nested MOCs?**
   - If MOC links to another MOC, do we analyze that MOC's notes too?
   - Risk: Infinite recursion, performance issues
   - Benefit: More comprehensive analysis
   - **Recommendation**: Support 1 level deep, make configurable

2. **Should we allow partial MOC analysis?**
   - User selects specific headings/sections to analyze
   - Use case: "Only analyze 'Theory' section of my MOC"
   - **Recommendation**: P2 feature, not MVP

3. **How do we price-protect large MOC analyses?**
   - Current: Show warning for >30 notes, require confirmation for >$0.10
   - Alternative: Hard limit at 30 notes, force user to split MOC
   - **Recommendation**: Soft limit (warning) for MVP

4. **Should MOC discovery cost more than Gather Seeds?**
   - MOC analysis typically 2-3x more content than seeds
   - But users expect similar cost
   - **Recommendation**: Same pricing model, but show cost prominently

5. **How do we handle MOC updates during Living MOC auto-sync?**
   - If MOC auto-updates, should we auto-re-discover centers?
   - Risk: Unexpected API costs
   - **Recommendation**: Suggest re-discovery, don't auto-run

---

### Technical Questions

1. **Cache invalidation for MOC content?**
   - MOCs change frequently (Living MOC updates)
   - When should we invalidate content cache?
   - **Recommendation**: 5-minute TTL, manual refresh option

2. **How do we handle very large notes (>10,000 words)?**
   - Current: Truncate with warning
   - Alternative: Intelligent summarization, extract key paragraphs
   - **Recommendation**: Truncate for MVP, smart extraction for P2

3. **Should we use streaming API for large MOCs?**
   - Benefit: Progressive results, lower perceived latency
   - Cost: More complex implementation
   - **Recommendation**: P2 optimization if analysis >15s common

4. **How do we test MOC-specific AI prompts?**
   - Need to ensure prompts optimized for MOC context
   - Golden dataset of MOCs for regression testing
   - **Recommendation**: Create 10-sample test suite with known good results

5. **Error recovery for partial API failures?**
   - If AI returns malformed JSON for 1 center, do we fail entire request?
   - **Recommendation**: Partial success (return valid centers, log errors)

---

### UX Questions

1. **Should we show MOC structure in center display?**
   - Benefit: Users see which section contributed to center
   - Cost: UI complexity
   - **Recommendation**: P1 feature, collapsible "View MOC Context"

2. **How do we guide users from Gather Seeds to MOC discovery?**
   - Onboarding flow: "Try MOC discovery for academic writing"
   - In-app prompts when user creates MOC
   - **Recommendation**: Contextual suggestion after 3rd Gather Seeds use

3. **Should we auto-detect "potential MOCs"?**
   - Files with 10+ links but no MOC marker
   - Show: "This note looks like a MOC. Mark as MOC? [Yes] [No]"
   - **Recommendation**: P2 feature, opt-in suggestion

4. **How do we visualize center coverage?**
   - "9/15 notes" is clear but not visual
   - Alternative: Progress bar, graph view
   - **Recommendation**: Text for MVP, visualization for P2

5. **What's the ideal MOC preview format?**
   - Full content, headings only, link list?
   - **Recommendation**: Headings + link count per section

---

## Appendices

### Appendix A: MOC Detection Specification

See existing `moc-detector.ts` service - already implements:
- ✅ YAML frontmatter detection
- ✅ Tag-based detection
- ✅ Folder pattern detection
- ✅ Link extraction with context
- ✅ Heading hierarchy parsing
- ✅ Living MOC configuration parsing
- ✅ Auto-update marker detection
- ✅ Caching (5-minute TTL)

**No changes needed** - service is production-ready for this feature.

---

### Appendix B: AI Prompt Template (Draft)

```typescript
// MOC Center Discovery Prompt Template

const mocCenterDiscoveryPrompt = `
You are analyzing a **Map of Content (MOC)** - a curated collection of ${seeds.length} notes
organized by the user around the topic: "${mocContext.title}".

**User's Organization:**
${mocContext.headings.map(h => `- ${h}`).join('\n')}

**Your Task:**
Find 2-5 **structural centers** that unify these notes into compelling writing starting points.

**MOC-Specific Criteria:**
1. **Cross-Domain Centers** (Highest Priority): Centers that span multiple MOC sections
   Example: If MOC has "Theory" and "Practice" sections, strongest centers bridge both

2. **Academic Suitability**: Centers should support thesis/argument (not just description)
   Example: "Temporal Delay Problem in Feedback Loops" (arguable thesis)

3. **Note Coverage**: Strong centers connect 50-80% of MOC notes
   Weak centers: <30% coverage

4. **Coherence**: Notes should logically support the center
   Avoid forcing connections between unrelated notes

**Output 2-5 centers in this JSON format:**
{
  "centers": [
    {
      "name": "Brief descriptive phrase",
      "explanation": "2-3 sentences explaining why this unifies the notes",
      "strength": "strong" | "medium" | "weak",
      "connectedSeeds": ["seed-1", "seed-3", ...],
      "assessment": {
        "crossDomain": true/false,
        "emotionalResonance": true/false,
        "hasConcrete": true/false,
        "structuralPivot": true/false
      },
      "recommendation": "Optional: Why this is the best starting point"
    }
  ]
}

**Notes to analyze:**
${seeds.map(seed => formatSeedForPrompt(seed)).join('\n\n')}
`;
```

**Differences from Gather Seeds Prompt**:
- Emphasizes MOC structure (headings, organization)
- Prioritizes cross-domain centers (spanning sections)
- Focuses on academic/professional writing suitability
- Uses note coverage metric
- References user's organizational intent

---

### Appendix C: Cost Estimation Formula

```typescript
// MOC Analysis Cost Estimation

function estimateMOCAnalysisCost(
  noteCount: number,
  totalWords: number
): number {
  // Claude 3.5 Sonnet pricing (as of 2025-11)
  const INPUT_COST_PER_1K = 0.003;  // $3 per million input tokens
  const OUTPUT_COST_PER_1K = 0.015; // $15 per million output tokens

  // Token estimation
  const WORDS_PER_TOKEN = 0.75; // English text ratio
  const PROMPT_OVERHEAD = 800; // System prompt + formatting
  const OUTPUT_TOKENS = 600; // Typical center discovery output

  const inputTokens = Math.ceil(totalWords / WORDS_PER_TOKEN) + PROMPT_OVERHEAD;
  const outputTokens = OUTPUT_TOKENS;

  const inputCost = (inputTokens / 1000) * INPUT_COST_PER_1K;
  const outputCost = (outputTokens / 1000) * OUTPUT_COST_PER_1K;

  return inputCost + outputCost;
}

// Example calculations:
// 10 notes, 5,000 words:
//   Input: ~6,667 tokens + 800 = 7,467 tokens = $0.022
//   Output: 600 tokens = $0.009
//   Total: $0.031

// 20 notes, 15,000 words:
//   Input: ~20,000 tokens + 800 = 20,800 tokens = $0.062
//   Output: 600 tokens = $0.009
//   Total: $0.071

// 30 notes, 30,000 words:
//   Input: ~40,000 tokens + 800 = 40,800 tokens = $0.122
//   Output: 600 tokens = $0.009
//   Total: $0.131
```

**Cost Optimization Strategies**:
1. Encourage users to keep MOCs <25 notes
2. Show cost estimate before analysis
3. Cache results (5-minute TTL)
4. Offer "quick analysis" mode (lower quality, 50% cost)

---

### Appendix D: Tutorial Integration

**Required Tutorial Updates**:

1. **Basic Tutorial** (`TUTORIAL-EN.md`):
   - Add section: "Advanced: From Scattered Seeds to Organized MOCs"
   - Cross-reference MOC tutorial
   - Show progression path

2. **MOC Tutorial** (`TUTORIAL-USING-MOC-EN.md`):
   - ✅ Already created (comprehensive)
   - No changes needed

3. **User Guide**:
   - Add "When to Use Gather Seeds vs MOC Discovery"
   - Decision tree diagram
   - Use case examples

4. **Onboarding**:
   - First-time MOC users see: "New to MOC discovery? [View Tutorial]"
   - Contextual help in selection modal
   - Link to tutorial in error messages

---

### Appendix E: Metrics and Analytics

**Telemetry Events** (Anonymized):

```typescript
// Events to track (no PII, aggregated only)

event('moc_discovery_initiated', {
  noteCount: number,
  totalWords: number,
  detectionMethod: 'yaml' | 'tag' | 'folder',
  hasHeadings: boolean
});

event('moc_analysis_completed', {
  duration: number, // seconds
  centersFound: number,
  strongCenters: number,
  cost: number,
  success: boolean,
  errorType?: string
});

event('moc_center_selected', {
  centerStrength: 'strong' | 'medium' | 'weak',
  connectedNotesCount: number,
  timeToDecision: number // seconds spent reviewing
});

event('moc_document_created', {
  wordCount: number,
  seedCount: number,
  fromMOCContext: boolean
});

event('moc_feature_abandoned', {
  abandonPoint: 'selection' | 'analysis' | 'review',
  reason?: 'cost' | 'time' | 'quality' | 'error'
});
```

**Dashboard Metrics**:
- Daily active users of MOC discovery
- Conversion rate (analysis → document creation)
- Average MOC size analyzed
- Average cost per analysis
- Feature retention (7-day, 30-day)
- Cross-feature usage (Gather Seeds + MOC)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-06 | PM Team | Initial specification |

---

## Approval

**Product Manager**: __________________ Date: __________

**Engineering Lead**: __________________ Date: __________

**UX Designer**: __________________ Date: __________

---

**End of Product Specification**
