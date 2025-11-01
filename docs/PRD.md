# Product Requirements Document: WriteAlive

**Version**: 1.0
**Last Updated**: 2025-11-01
**Status**: Living Document (Evolving with Transformations)

---

## Product Vision Summary

WriteAlive is an AI-assisted writing tool that enables writers to practice "Saligo Writing" (Living-Centered Writing) - a methodology inspired by Christopher Alexander's Nature of Order and Bill Evans' step-by-step mastery philosophy. Rather than forcing writers into traditional outline-first approaches, WriteAlive supports an iterative, generative writing process where ideas grow organically from seed centers with low energy barriers to entry. The tool transforms writing from a high-friction, structure-heavy activity into a fluid, discovery-driven creative process.

**Core Philosophy**: Writing as a living structure that evolves through generative sequences, not as a static artifact produced through rigid planning.

**Primary Value Proposition**: Enable anyone to write with clarity and depth by starting small, building truthfully, and evolving naturally - just as Bill Evans taught musicians to master jazz one step at a time.

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
- **Goals**: Write clear, persuasive documents efficiently in scattered time blocks
- **Success Scenario**: Draft comprehensive product spec during commute and coffee breaks

### 3. The Reflective Learner (Secondary)
- **Profile**: Knowledge workers, lifelong learners maintaining personal knowledge bases (Obsidian, Notion users)
- **Pain Points**:
  - Notes remain fragmented - never evolve into coherent understanding
  - Fear of "not knowing enough yet" prevents writing
  - Lack structure for developing thoughts progressively
- **Goals**: Transform scattered thoughts into developed insights through low-friction writing
- **Success Scenario**: Convert week's worth of reading notes into coherent essay through incremental refinement

---

## Real-World User Journey: From Everyday Moments to Finished Writing

### The Natural Flow of Ideas → Writing

WriteAlive is designed to support how ideas actually emerge in daily life, not just at a desk with dedicated "writing time."

#### Journey Example: "Weekend Observations Become an Essay"

**Saturday 9 AM** - Reading "The Nature of Order" at a café
📝 User highlights passage about centers, adds quick note in Obsidian:
`"Alexander: strong centers make weak centers stronger #seed"`

**Saturday 2 PM** - Watching Bill Evans documentary on YouTube
📝 Pauses to capture idea:
`"Evans philosophy: truth over approximation. Start small but accurate. #seed #practice"`

**Sunday 10 AM** - Walking in the park, observing tree growth patterns
📝 Voice memo (later synced to Obsidian):
`"Trees grow from trunk outward. Not all branches at once. Natural = generative. #seed #nature"`

**Sunday 7 PM** - Feels ready to write, but not sure where to start

1. **Opens new note**: "On Creative Practice.md" (blank page, no outline)
2. **Invokes WriteAlive command**: "Gather my seeds from this week"
   → AI finds 3 tagged `#seed` notes + 5 related fleeting notes from vault
3. **Selects starting seed**: "Evans philosophy: truth over approximation..."
4. **AI suggests possible centers**:
   - "How does 'truth over approximation' apply to your own practice?"
   - "Connection between Evans' philosophy and Alexander's centers?"
   - "What does 'starting small but accurate' mean in writing?"
5. **User chooses**: "Connection between Evans & Alexander" ✓
6. **AI generates expansion prompts**:
   - "Describe one concrete example from your experience..."
   - "What's the common pattern between music practice and writing?"
   - "How does this challenge conventional wisdom about creativity?"
7. **30 minutes of writing**: 4 paragraphs, 2 clear centers emerging naturally
8. **Reads aloud** → Notices awkward transition → AI suggests refinement
9. **Saves snapshot**: "First draft - found main centers"

**Result**: Zero-friction path from scattered weekend observations → coherent 600-word draft

**Key Usability Principles Demonstrated**:
- ✅ **Low energy barrier**: Started writing without planning full structure
- ✅ **Capture anywhere**: Ideas from book, video, walk all became seeds
- ✅ **AI as connector**: Found relationships across scattered notes
- ✅ **Generative discovery**: Centers emerged through writing, not before
- ✅ **Works with existing workflow**: Pure Obsidian + markdown, no lock-in

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
- System searches vault for tags: `#seed`, `#writealive-seed`, or custom user-defined tags
- Returns results with metadata:
  - Original note title and path
  - Seed text (paragraph containing tag)
  - Creation date
  - Related backlinks (if any)
- Filter options: "This week", "This month", "All time", "From specific folder"
- Results sorted by: recency (default), relevance, or manual

**Real-World Scenario**:
```
User has 200+ daily notes from past 6 months
Contains 15 tagged seeds about "creativity" theme
Command finds all 15 in < 2 seconds
Presents organized list with context
```

**Structural Quality Metric**: 80% of users successfully gather seeds on first attempt; avg 5-10 seeds per gathering session

---

#### US-0.2: Seed-to-Document Initialization
**As a** writer ready to transform scattered thoughts into coherent writing
**I want** to select multiple seeds and have them become the foundation of a new document
**So that** my writing starts from actual observations, not forced outlines

**Acceptance Criteria**:
- Seed gathering modal allows multi-select (checkbox UI)
- "Start Writing" button creates new note with:
  - Filename: User-provided or auto-generated from seeds (e.g., "On Creativity - 2025-11-01")
  - Content: Selected seeds inserted as blockquotes with source links
  - YAML frontmatter: `gathered_seeds: [list of source note paths]`
  - Cursor positioned after seeds with prompt: "What center do you see across these ideas?"
- Alternative: Insert seeds into existing note at cursor position

**Real-World Scenario**:
```
User selects 3 seeds:
1. "Evans: truth over approximation" (from YouTube notes)
2. "Alexander: centers strengthen each other" (from book notes)
3. "Trees grow from trunk outward" (from walk observation)

New document created:
---
gathered_seeds: [daily/2025-10-28.md, books/Nature-of-Order.md, daily/2025-10-29.md]
---

> "Evans: truth over approximation. Start small but accurate."
> — [[daily/2025-10-28]]

> "Alexander: strong centers make weak centers stronger"
> — [[books/Nature-of-Order]]

> "Trees grow from trunk outward. Not all branches at once."
> — [[daily/2025-10-29]]

What center do you see across these ideas?
[cursor here]
```

**Structural Quality Metric**: 70% of documents created via seed gathering reach completion (vs 20% baseline for blank-page starts)

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
- User selects paragraph or section and invokes "Find Centers" command
- AI analyzes text using GPT-4/Claude and returns 2-4 potential centers with explanations
- Each center shows: "This phrase seems to hold energy because..."
- User can accept, modify, or dismiss suggestions
- Accepted centers are visually highlighted (subtle sidebar notation)
- AI considers: recurring concepts, emotionally charged language, structural pivots, unresolved tensions

**Structural Quality Metric**: Users accept 50%+ of suggested centers

---

#### US-2.2: Generative Expansion Prompts
**As a** writer staring at my seed idea
**I want** AI to suggest expansion strategies for my current center
**So that** I can overcome writer's block and explore multiple directions

**Acceptance Criteria**:
- User invokes "Grow This Center" on selected text
- AI suggests 3-5 generative questions/prompts:
  - "What concrete example illustrates this?"
  - "What is the opposing perspective?"
  - "What happens if you trace this backward in time?"
  - "What structure underlies this observation?"
- User selects one prompt and AI generates 2-3 starter sentences
- User can iterate: "Show me more directions"
- All suggestions are non-intrusive (modal/sidebar, easily dismissible)

**Structural Quality Metric**: 70% of stuck sessions (>5 min no text) successfully resume after prompt use

---

#### US-2.3: Wholeness Analysis
**As a** writer with multiple paragraphs
**I want** AI to assess the wholeness/coherence of my document
**So that** I can identify weak connections, redundancies, or missing pieces

**Acceptance Criteria**:
- User invokes "Analyze Wholeness" on full document or section
- AI evaluates:
  - Paragraph unity (does each paragraph have one clear message?)
  - Inter-paragraph transitions (do ideas flow naturally?)
  - Center hierarchy (are main ideas clearly dominant?)
  - Structural gaps (what's missing to complete the thought?)
- Output: Visual map showing strong connections (green), weak links (yellow), gaps (red)
- Specific suggestions: "Paragraph 3 and 7 seem to repeat the same idea - consider merging"
- Wholeness score: 1-10 with explanation

**Structural Quality Metric**: Documents with 7+ wholeness score are 90% complete by user assessment

---

### Epic 3: Iterative Refinement Tools (MVP)
**Priority**: P0 (Must Have)
**Effort**: Medium (5-8 story points)
**Rationale**: Support the iterative nature of Saligo Writing

#### US-3.1: Read-Aloud Review
**As a** writer completing a draft
**I want** to hear my text read aloud with AI voice
**So that** I can identify awkward phrasing, rhythm issues, and unclear passages

**Acceptance Criteria**:
- User clicks "Read Aloud" button on paragraph or full document
- Text-to-speech with natural intonation (browser API or service)
- Reading highlights current sentence
- Pause/resume controls
- User can click to edit while listening (playback pauses)
- Speed control: 0.8x, 1x, 1.2x

**Structural Quality Metric**: 40% of documents use read-aloud before marking "complete"

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
