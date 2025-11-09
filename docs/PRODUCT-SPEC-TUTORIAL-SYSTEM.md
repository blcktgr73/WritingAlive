# Product Specification: Top-Down Tutorial System

**Feature ID**: TUTORIAL-SYSTEM-TOPDOWN
**Version**: 1.0
**Status**: Ready for Implementation Planning
**Target**: All WriteAlive users (new and existing)
**Last Updated**: 2025-11-08

---

## Product Vision Summary

Create an integrated, top-down tutorial system that guides users through WriteAlive's core features using progressive disclosure and hands-on learning. The system provides bilingual (EN/KR) tutorials that help users understand the Outcome-Driven writing mode, Seed-Based writing mode, and overall system architecture through contextual, just-in-time learning experiences.

**Innovation**: Tutorial-as-Transformation
- Not static documentation - tutorials evolve with user progress
- Not separate from workflow - tutorials integrate into actual usage
- Not one-size-fits-all - adaptive paths based on user goals and context
- **Best of both**: Comprehensive coverage with personalized, incremental delivery

**Top-Down Approach**:
1. **Vision Level**: "Why WriteAlive?" (philosophy, benefits, modes overview)
2. **Strategy Level**: "Which mode for which goal?" (decision framework)
3. **Tactical Level**: "How to use this feature?" (step-by-step workflows)
4. **Practice Level**: "Try it yourself" (interactive exercises with real vault)

---

## Success Metrics

### Primary KPIs (Must-Have)

1. **Tutorial Completion Rate**: 60%
   - Users who start tutorial complete at least one full workflow
   - Measured via tutorial progress tracking
   - Target: 60% for first tutorial, 40% for advanced tutorials

2. **Feature Discovery Rate**: 80%
   - New users discover and try core features within first week
   - Measured via feature usage analytics after tutorial exposure
   - Target: 80% try Seed Gathering, 60% try Center Discovery, 40% try Outcome-Driven mode

3. **Time to First Success**: <20 minutes
   - From plugin installation to first document created using WriteAlive
   - Measured via tutorial session timestamps
   - Includes: tutorial completion + first real document creation

4. **Tutorial Helpfulness Score**: 8.5/10
   - User self-reported rating after tutorial completion
   - Measured via optional feedback prompt
   - Target: 85% satisfaction minimum

### Secondary KPIs (Should-Have)

5. **Language Preference Balance**: 40/60 EN/KR split
   - Track which language tutorials are used more
   - Validates bilingual investment
   - Target: At least 30% usage for each language

6. **Context Help Usage**: 50%
   - Users invoke context-sensitive help during actual feature use
   - Measured via help button clicks in modals/workflows
   - Indicates tutorial system aids real workflows, not just onboarding

7. **Tutorial Revisit Rate**: 25%
   - Users return to tutorials after initial completion
   - Measured via repeat tutorial access
   - Indicates tutorials serve as ongoing reference, not just onboarding

---

## Core User Stories (Priority Order)

### US-1: Understand "Why WriteAlive?" (P0 - MVP Blocker)

**As a** new Obsidian user exploring writing plugins,
**I want** to quickly understand what makes WriteAlive different and whether it fits my needs,
**So that** I can decide if it's worth investing time to learn.

**Acceptance Criteria**:
- [ ] Tutorial system launches automatically after first plugin activation
- [ ] Welcome screen shows 3-minute overview video/animation
- [ ] Clear comparison: "Traditional writing vs Saligo Writing vs Outcome-Driven"
- [ ] Use case selector: "What do you want to write?" (blog/academic/professional/creative)
- [ ] Based on selection, recommended tutorial path highlighted
- [ ] Option to skip tutorial and access later via command palette
- [ ] Tutorial progress saved (can pause and resume)

**User Flow**:
```
First Activation → Welcome Modal → 3-min Overview → "What do you write?"
→ Recommended Path → [Start Tutorial] or [Skip for Now]
```

**Content Structure** (Top-Down):
1. **Vision**: "WriteAlive helps ideas become writing through structural centers"
2. **Problem**: "Traditional writing has high energy barriers and blank-page paralysis"
3. **Solution**: "Three modes adapt to your starting point: seeds, outcomes, or both"
4. **Benefits**: "Write faster, with less energy, maintaining structural quality"

---

### US-2: Choose Right Mode for My Goal (P0 - MVP Blocker)

**As a** user ready to start writing,
**I want** clear guidance on which mode (Seed-Based, Outcome-Driven, Hybrid) to use,
**So that** I don't waste time with the wrong workflow for my context.

**Acceptance Criteria**:
- [ ] Tutorial presents decision framework as interactive quiz
- [ ] 3-5 questions about: goal clarity, time constraints, existing materials, document type
- [ ] Each mode gets detailed explanation with examples
- [ ] Video demonstrations for each mode (30-60 seconds each)
- [ ] After mode selection, tutorial adapts to show relevant workflow
- [ ] Can revisit decision quiz anytime via command palette
- [ ] Quiz results saved and used to pre-select mode in future workflows

**Decision Framework Questions**:
1. "Do you have a clear writing goal or deadline?" (Yes → Outcome-Driven)
2. "Do you have scattered notes/ideas on this topic?" (Yes + No Goal → Seed-Based)
3. "Do you have both a goal and research materials?" (Yes → Hybrid)
4. "What type of document?" (Essay/Blog → Seed, Report/Proposal → Outcome, Paper → Hybrid)
5. "How much time do you have?" (<1 hour → Outcome, Flexible → Seed)

**Mode Explanations** (Bilingual):

**Seed-Based Mode** (-EN/-KR versions):
```
When to use:
✅ You have scattered ideas but no clear thesis
✅ Writing exploratory essays or creative pieces
✅ You want to discover what to write through writing
✅ No tight deadline

Example: "I have 10 notes about learning, but I'm not sure what angle to take for my blog post."
```

**Outcome-Driven Mode**:
```
When to use:
✅ You know what you need to write
✅ Tight deadline or structured deliverable
✅ Professional reports, proposals, specifications
✅ You face blank-page paralysis despite clear goals

Example: "I need to write Q4 retrospective by Friday for my team and VP."
```

**Hybrid Mode** (Future):
```
When to use:
✅ Academic papers requiring both thesis and research synthesis
✅ You have a goal AND existing materials to integrate
✅ Complex documents where discovery meets intention

Example: "I need to write a literature review chapter integrating 20 papers."
```

---

### US-3: Learn Through Interactive Walkthrough (P0 - MVP Blocker)

**As a** user committed to learning WriteAlive,
**I want** to follow a hands-on tutorial using real features in my vault,
**So that** I build muscle memory and confidence through practice, not passive reading.

**Acceptance Criteria**:
- [ ] Tutorial creates temporary practice vault or uses user's vault with safety markers
- [ ] Step-by-step interactive walkthrough with progress indicators
- [ ] Each step requires user action before advancing (click, select, type)
- [ ] Real-time validation: green checkmarks for correct actions
- [ ] Contextual hints if user gets stuck (wait 15 seconds → show hint)
- [ ] Can pause tutorial and resume from same step later
- [ ] Undo/restart tutorial section without losing overall progress
- [ ] Success celebration after completing each major milestone

**Interactive Elements**:
1. **Practice Seeds**: Tutorial provides 4-5 sample seed notes to gather
2. **Guided Actions**: Highlight specific UI elements to click
3. **Typing Practice**: Guide user to write 2-3 sentences in tutorial document
4. **AI Interaction**: Show loading states and explain what AI is doing
5. **Result Preview**: Show expected outcomes and compare with user's results

**Tutorial Scaffolding Levels**:
- **Level 1** (Heavy): Click-by-click guidance with arrows and highlights
- **Level 2** (Medium): Task description with hints available on demand
- **Level 3** (Light): "Try to do X yourself" with validation only

**Progress Tracking**:
```yaml
tutorial_progress:
  current_tutorial: "seed-based-quickstart-EN"
  current_step: 7
  steps_completed: [1, 2, 3, 4, 5, 6]
  total_steps: 12
  started_at: "2025-11-08T10:30:00Z"
  last_accessed: "2025-11-08T10:45:00Z"
  completed: false
  completion_percentage: 58
```

---

### US-4: Access Context-Sensitive Help During Real Use (P0 - MVP Blocker)

**As a** user performing an actual WriteAlive workflow,
**I want** quick access to relevant help without leaving my current context,
**So that** I can solve specific questions without disrupting my writing flow.

**Acceptance Criteria**:
- [ ] Every modal/UI has "?" help button in top-right corner
- [ ] Help button opens context-specific tutorial section in sidebar panel
- [ ] Help content explains current feature with 2-3 sentence summary
- [ ] Link to full tutorial section for deeper learning
- [ ] Video snippet (15-30 seconds) demonstrating current action
- [ ] "Try Again" button restarts current workflow with tutorial hints
- [ ] Help panel closable without losing workflow progress
- [ ] Analytics track which help sections are accessed most

**Context Help Triggers**:
- Seed Gathering Modal → "How to select seeds effectively"
- Center Discovery Results → "Understanding center strength indicators"
- Outcome Definition Modal → "Writing a good outcome description"
- Section Writing View → "Using AI next steps suggestions"
- Template Selection → "Choosing the right template"

**Help Content Format**:
```markdown
# [Feature Name] Quick Help

**What you're doing**: [1 sentence explanation]

**How it works**: [2-3 sentences, numbered steps]

**Tips**:
- [Tip 1]
- [Tip 2]

**Common issues**:
- [Issue 1] → [Solution 1]

[📺 Watch 30-second demo] [📖 Read full tutorial] [❌ Close]
```

---

### US-5: Learn Advanced Features When Ready (P1 - Post-MVP)

**As a** user who mastered basic workflows,
**I want** to discover advanced features through progressive disclosure,
**So that** I'm not overwhelmed initially but can grow my skills over time.

**Acceptance Criteria**:
- [ ] Basic tutorial completed → "Advanced features unlocked" notification
- [ ] Advanced tutorial list shows: MOC integration, Snapshots, Wholeness analysis
- [ ] Each advanced tutorial has prerequisite indicator
- [ ] "What's New" section highlights recently added features/tutorials
- [ ] Feature discovery prompts appear contextually (e.g., after 5 documents, suggest Snapshots)
- [ ] Can mark tutorials as "completed" or "skip" to hide from list
- [ ] Advanced tutorials available in both EN and KR

**Advanced Tutorial Topics**:
1. **MOC Integration** (Prerequisite: Basic Seed Gathering)
   - Finding centers from organized note collections
   - Living MOC auto-updates
   - MOC-based workflows for academic writing

2. **Version Snapshots** (Prerequisite: Complete one document)
   - Saving transformation checkpoints
   - Comparing versions to see structural improvements
   - Safe experimentation with rollback

3. **Wholeness Analysis** (Prerequisite: Center Discovery)
   - Understanding wholeness scores
   - Iterative refinement guidance
   - Tracking document evolution

4. **Template Library** (Prerequisite: Outcome-Driven mode)
   - Using built-in professional templates
   - Creating custom templates
   - Template sharing (future)

5. **Hybrid Mode** (Prerequisite: Both Seed and Outcome modes)
   - Combining research with writing goals
   - Academic paper workflows
   - Literature review synthesis

---

### US-6: Switch Tutorial Language Seamlessly (P0 - MVP Blocker)

**As a** bilingual user or Korean-primary user,
**I want** to choose tutorial language and switch anytime,
**So that** I can learn in my preferred language without barriers.

**Acceptance Criteria**:
- [ ] Language selector in tutorial welcome screen
- [ ] Language preference saved in plugin settings
- [ ] All tutorials available in both EN and KR versions (100% parity)
- [ ] Language switch button in tutorial panel header
- [ ] Switching language preserves current tutorial progress
- [ ] UI text, video subtitles, and practice content all localized
- [ ] Consistent terminology across all tutorial content per language

**Bilingual Content Strategy**:

| Content Type | EN Version | KR Version | Notes |
|-------------|-----------|-----------|-------|
| Tutorial Text | 100% | 100% | Full translation parity |
| Video Demos | EN audio + KR subs | KR audio + EN subs | Dual production |
| Practice Seeds | EN examples | KR examples | Culturally relevant |
| UI Labels | English | 한국어 | Obsidian i18n format |
| Success Messages | EN | KR | Positive reinforcement |

**Language File Structure**:
```
tutorials/
  en/
    TUTORIAL-QUICKSTART-SEED-EN.md
    TUTORIAL-OUTCOME-DRIVEN-EN.md
    TUTORIAL-MOC-ADVANCED-EN.md
  kr/
    TUTORIAL-QUICKSTART-SEED-KR.md
    TUTORIAL-OUTCOME-DRIVEN-KR.md
    TUTORIAL-MOC-ADVANCED-KR.md
```

---

### US-7: Track and Resume Tutorial Progress (P1 - Post-MVP)

**As a** user who paused during tutorial,
**I want** the system to remember my progress and let me resume where I left off,
**So that** I don't have to restart from the beginning or feel lost.

**Acceptance Criteria**:
- [ ] Tutorial progress saved automatically after each completed step
- [ ] Resume prompt appears when reopening incomplete tutorial
- [ ] Progress indicator shows: "Step 5 of 12 (42% complete)"
- [ ] Can jump back to any completed step for review
- [ ] Can restart tutorial from beginning if desired
- [ ] Progress syncs across Obsidian instances (via vault settings)
- [ ] Completed tutorials marked with checkmark in tutorial library

**Resume Experience**:
```
Welcome back!

You were in the middle of:
📚 "Seed-Based Writing Quickstart"

Progress: Step 5/12 (42% complete)
Last step: "Gathering Seeds from Vault"

[Resume Tutorial] [Restart from Beginning] [Skip Tutorial]
```

---

## Functional Requirements

### FR-1: Tutorial System Architecture

**Tutorial Engine Components**:

1. **TutorialManager.ts**
   - Load tutorial definitions from markdown files
   - Track user progress per tutorial
   - Manage tutorial state (active, paused, completed)
   - Handle step validation and advancement
   - Sync progress to vault settings

2. **TutorialRenderer.tsx**
   - Render tutorial content in sidebar panel or modal
   - Highlight active step with visual emphasis
   - Show progress indicators and navigation
   - Handle language switching
   - Embed video players and interactive elements

3. **StepValidator.ts**
   - Validate user actions match tutorial expectations
   - Provide real-time feedback (checkmarks, hints)
   - Detect when user is stuck and offer help
   - Track validation failures for analytics

4. **ContextHelpProvider.ts**
   - Map UI contexts to help content sections
   - Inject help buttons into modals/views
   - Render help content in sidebar without disrupting workflow
   - Track help access patterns

**Tutorial Definition Format** (Markdown-based DSL):
```markdown
---
tutorial_id: "seed-based-quickstart-EN"
title: "Seed-Based Writing Quickstart"
language: "en"
duration_minutes: 15
difficulty: "beginner"
prerequisites: []
version: "1.0"
---

# Seed-Based Writing Quickstart

## Step 1: Understanding Seeds
**type**: explanation
**duration**: 2 minutes

[Content explaining what seeds are...]

**validation**: user_clicked_next

---

## Step 2: Open Seed Gathering Modal
**type**: action
**duration**: 1 minute

Instructions:
1. Click the ribbon icon (🌱) in left sidebar
2. Or use Command Palette: `WriteAlive: Gather Seeds`

**validation**:
  - type: modal_opened
  - modal_id: "gather-seeds-modal"
  - timeout: 30
  - hint_after_timeout: "Look for the 🌱 icon in your left sidebar"

---

## Step 3: Select Practice Seeds
**type**: interaction
**duration**: 2 minutes

Select at least 3 of the practice seeds we created for you.

**validation**:
  - type: seeds_selected
  - minimum_count: 3
  - timeout: 60
  - hint_after_timeout: "Click the checkbox next to each seed note"

---
```

**Step Types**:
- **explanation**: Text/video content, user just reads/watches
- **action**: User must perform specific action (click button, run command)
- **interaction**: User interacts with UI (select items, type text)
- **practice**: User performs workflow step independently
- **checkpoint**: Progress save point, can resume from here

---

### FR-2: Tutorial Content Library

**Tutorial Hierarchy** (Top-Down Structure):

```
📚 Tutorial Library
│
├── 🌟 Getting Started (Required)
│   ├── Welcome to WriteAlive (5 min) [EN/KR]
│   ├── Choosing Your Writing Mode (8 min) [EN/KR]
│   └── Your First Document (10 min) [EN/KR]
│
├── 🌱 Seed-Based Writing
│   ├── Seed Gathering Quickstart (15 min) [EN/KR]
│   ├── Understanding Centers (12 min) [EN/KR]
│   ├── Using Next Steps AI (10 min) [EN/KR]
│   └── Advanced: MOC Integration (20 min) [EN/KR]
│
├── 🎯 Outcome-Driven Writing
│   ├── Defining Writing Outcomes (10 min) [EN/KR]
│   ├── Working with AI Structure (15 min) [EN/KR]
│   ├── Section-by-Section Writing (12 min) [EN/KR]
│   └── Using Templates (10 min) [EN/KR]
│
├── 🔄 Document Management
│   ├── Version Snapshots (8 min) [EN/KR]
│   ├── Wholeness Analysis (10 min) [EN/KR]
│   └── Iterative Refinement (12 min) [EN/KR]
│
├── 🔧 System Features
│   ├── Plugin Settings (5 min) [EN/KR]
│   ├── AI Provider Configuration (8 min) [EN/KR]
│   └── Cost Management (6 min) [EN/KR]
│
└── 📖 Philosophy & Background
    ├── Saligo Writing Principles (15 min) [EN/KR]
    ├── Bill Evans Practice Philosophy (10 min) [EN/KR]
    └── Christopher Alexander Centers (12 min) [EN/KR]
```

**Tutorial Metadata**:
```yaml
tutorial:
  id: "seed-based-quickstart-EN"
  title: "Seed-Based Writing Quickstart"
  language: "en"
  alternate_language_version: "seed-based-quickstart-KR"
  category: "seed-based"
  difficulty: "beginner"
  duration_minutes: 15
  prerequisites: ["welcome-to-writealive-EN"]
  learning_objectives:
    - "Understand what seeds are and how to identify them"
    - "Successfully gather seeds from vault"
    - "Discover centers using AI"
    - "Create first document from centers"
  completion_criteria:
    - "All interactive steps validated"
    - "Practice document created"
    - "User confirms understanding"
```

---

### FR-3: Video Tutorial Production

**Video Content Requirements**:

1. **Overview Videos** (3-5 minutes each)
   - Welcome to WriteAlive
   - Three Writing Modes Explained
   - Choosing the Right Mode

2. **Workflow Demos** (30-90 seconds each)
   - Gathering Seeds
   - Center Discovery Modal
   - Outcome Definition
   - Section Writing View
   - Template Selection
   - Next Steps Suggestions
   - Snapshot Creation

3. **Feature Deep-Dives** (5-10 minutes each)
   - MOC Integration Workflow
   - Wholeness Analysis Explained
   - Cost Management Best Practices

**Video Production Specs**:
- **Format**: MP4, H.264 codec
- **Resolution**: 1920x1080 (1080p)
- **Frame Rate**: 30fps
- **Audio**: 44.1kHz stereo, clear narration
- **Captions**: SRT files for both EN and KR
- **File Size**: Optimized for web (<10MB per minute)
- **Hosting**: Embedded in tutorial system (local files or CDN)

**Bilingual Production Strategy**:
- **Tier 1** (Critical): Dual audio production (EN voice + KR voice)
  - Welcome video, Mode selection, First document creation
- **Tier 2** (Important): Single audio + dual subtitles
  - All workflow demos
- **Tier 3** (Optional): EN audio + KR subtitles only
  - Philosophy and background videos

**Video Embedding**:
```markdown
## Video Demo: Gathering Seeds

<video-player
  src="tutorials/videos/seed-gathering-demo-EN.mp4"
  subtitles-en="tutorials/videos/seed-gathering-demo-EN.srt"
  subtitles-kr="tutorials/videos/seed-gathering-demo-KR.srt"
  duration="60"
  autoplay="false"
  controls="true"
/>

[Download Video] [Watch in Browser]
```

---

### FR-4: Interactive Tutorial Elements

**Practice Vault Setup**:

When user starts interactive tutorial, system can:
1. **Option A**: Create temporary practice vault
   - Isolated sandbox environment
   - Pre-populated with sample notes
   - Safe for experimentation
   - Deleted after tutorial completion

2. **Option B**: Use user's existing vault with safety markers
   - Creates `_writealive_tutorial/` folder
   - All practice notes tagged `#writealive-tutorial`
   - Easy cleanup after completion
   - User can keep practice documents

**Sample Tutorial Content** (Created automatically):

For Seed-Based Tutorial:
```
_writealive_tutorial/
  practice-seeds/
    seed-1-bill-evans-quote.md (#seed #practice)
    seed-2-guitar-practice-insight.md (#idea #practice)
    seed-3-programming-learning.md (#seed #programming)
    seed-4-tree-growth-observation.md (#seed #nature)
  README.md (explains these are tutorial materials)
```

For Outcome-Driven Tutorial:
```
_writealive_tutorial/
  outcome-practice/
    sample-outcome-project-retro.md
    sample-outcome-tech-spec.md
  README.md
```

**Interactive Validation Examples**:

```typescript
// Example: Validate user gathered seeds
const validateSeedGathering: StepValidator = {
  type: 'seeds_selected',
  validate: (context) => {
    const selectedSeeds = context.gatherSeedsModal.selectedSeeds;
    return selectedSeeds.length >= 3;
  },
  successMessage: "Great! You've selected seeds successfully.",
  failureHint: "Select at least 3 seeds to continue. Click checkboxes next to seed notes.",
  timeoutSeconds: 60
};

// Example: Validate center discovery completed
const validateCenterDiscovery: StepValidator = {
  type: 'center_discovery_completed',
  validate: (context) => {
    return context.centerDiscoveryModal.centersFound.length > 0;
  },
  successMessage: "Excellent! AI discovered centers from your seeds.",
  failureHint: "Click 'Find Centers' button to analyze your seeds with AI.",
  timeoutSeconds: 120
};
```

**Progress Indicators**:
```
Tutorial Progress: Seed-Based Writing Quickstart

[✅ 1. Understanding Seeds]
[✅ 2. Opening Seed Modal]
[▶️ 3. Selecting Seeds] ← You are here
[⏸️ 4. Discovering Centers]
[⏸️ 5. Creating Document]
[⏸️ 6. Writing First Paragraph]

Step 3 of 6 (50% complete)
Estimated time remaining: 8 minutes

[Previous Step] [Hint] [Skip Tutorial]
```

---

### FR-5: Tutorial Search and Navigation

**Tutorial Discovery**:

1. **Tutorial Library Panel**
   - Accessible via Command Palette: `WriteAlive: Open Tutorial Library`
   - Accessible via Ribbon Button: Right-click → "Tutorial Library"
   - Categorized view with filters (Beginner/Intermediate/Advanced)
   - Search bar for finding specific topics
   - Completion badges shown on finished tutorials

2. **Smart Tutorial Suggestions**
   - After installing plugin: "Start with Welcome Tutorial"
   - After completing seed tutorial: "Try Outcome-Driven mode"
   - After creating 5 documents: "Learn about Snapshots"
   - After 10 AI calls: "Optimize AI costs with templates"
   - After 30 days: "Explore advanced MOC integration"

3. **Context-Sensitive Tutorial Links**
   - Error messages link to relevant tutorial sections
   - Feature discovery prompts link to tutorials
   - Settings page has tutorial links per feature
   - Help button in each modal

**Tutorial Search Index**:
```typescript
interface TutorialSearchIndex {
  keywords: string[];  // "seed", "gather", "center", "outcome", "template"
  categories: string[];  // "seed-based", "outcome-driven", "advanced"
  difficulty: string;  // "beginner", "intermediate", "advanced"
  duration: number;  // minutes
  relatedFeatures: string[];  // Feature IDs this tutorial covers
  commonQuestions: string[];  // "How to gather seeds?", "What is a center?"
}
```

**Search Experience**:
```
Tutorial Library Search: "how to use centers"

📚 Found 4 tutorials matching "centers":

⭐ Understanding Centers (12 min) - Beginner
   "Learn what centers are and how they structure your writing"
   [Start Tutorial]

🔍 Finding Centers from MOC (20 min) - Advanced
   "Discover centers in organized note collections"
   [Start Tutorial]

📊 Center Strength Indicators (8 min) - Intermediate
   "Interpret center discovery results"
   [Start Tutorial]

🎯 Center-Based Expansion (10 min) - Intermediate
   "Use centers to guide next steps"
   [Start Tutorial]
```

---

## Non-Functional Requirements

### NFR-1: Performance

1. **Tutorial Load Time**: <500ms
   - Tutorial content loads from local markdown files
   - Video thumbnails lazy-loaded
   - No blocking network requests for initial display

2. **Step Transition**: <200ms
   - Smooth animations between tutorial steps
   - No perceptible lag when clicking "Next"
   - Progress saves asynchronously without blocking UI

3. **Video Playback**: Smooth streaming
   - Videos pre-buffered when tutorial step loads
   - Support for offline playback (local files)
   - Fallback to lower quality if needed

4. **Search Performance**: <100ms
   - Tutorial search returns results instantly
   - Fuzzy matching for typo tolerance
   - Indexed content for fast lookups

### NFR-2: Maintainability

1. **Tutorial Content Updates**
   - Tutorials stored as markdown files in `/docs/tutorials/` directory
   - Non-developers can edit tutorial content without code changes
   - Version control for tutorial content alongside code
   - Tutorial schema validation on build

2. **Bilingual Sync**
   - Clear mapping between EN and KR tutorial versions
   - Automated checks for translation parity
   - Build warnings if EN/KR content drift detected
   - Translation workflow documented

3. **Video Asset Management**
   - Videos stored in `/docs/tutorials/videos/` directory
   - Naming convention: `[tutorial-id]-[language].mp4`
   - Subtitle files: `[tutorial-id]-[language].srt`
   - Video production guidelines documented

4. **Tutorial Testing**
   - Automated validation of tutorial step progression
   - Mock validators for testing without full plugin context
   - Visual regression testing for tutorial UI
   - User testing scripts for each tutorial

### NFR-3: Accessibility

1. **Keyboard Navigation**
   - All tutorial interactions keyboard-accessible
   - Tab navigation through tutorial steps
   - Keyboard shortcuts: Space (next), Shift+Space (previous), Esc (close)
   - Focus indicators clearly visible

2. **Screen Reader Support**
   - Tutorial content semantic HTML
   - ARIA labels for all interactive elements
   - Alt text for all images and diagrams
   - Video transcripts available

3. **Visual Clarity**
   - Tutorial text minimum 14px font size
   - High contrast between text and background (WCAG AA)
   - Color not the only indicator (icons + text)
   - Highlight boxes for active UI elements clearly visible

4. **Language Support**
   - Complete EN/KR parity (100% translation coverage)
   - RTL language support architecture (future: Japanese, Arabic)
   - Unicode emoji support in both languages
   - Locale-aware date/time formatting

### NFR-4: Compatibility

1. **Obsidian Version**
   - Minimum: Obsidian 1.4.0+
   - Tested on: Latest 3 major releases
   - Mobile compatibility: Android 7.0+, iOS 14.0+

2. **Vault Structure**
   - Works with any vault structure (PARA, Zettelkasten, etc.)
   - Respects user's folder organization
   - No destructive modifications to existing notes
   - Tutorial practice content clearly isolated

3. **Plugin Conflicts**
   - Compatible with major community plugins
   - No conflicts with: Dataview, Templater, Calendar
   - Graceful degradation if conflicting plugins detected

4. **Cross-Device Sync**
   - Tutorial progress syncs via Obsidian Sync or Git
   - Mobile tutorial experience optimized for smaller screens
   - Responsive layouts for tablet/desktop
   - Offline tutorial access (all content local)

---

## Tutorial Content Specifications

### TC-1: Tutorial Structure Template

Each tutorial follows this structure:

```markdown
---
[Tutorial Metadata YAML]
---

# [Tutorial Title]

## Overview
- **Duration**: [X minutes]
- **Difficulty**: [Beginner/Intermediate/Advanced]
- **What you'll learn**: [3-5 bullet points]
- **Prerequisites**: [Links to required tutorials]

## Background Context (Top-Down Level 1: Vision)
[Why this feature exists, what problem it solves]
[Philosophical grounding in Saligo Writing principles]

## When to Use This Feature (Top-Down Level 2: Strategy)
[Use cases and decision framework]
[Examples of situations where this feature excels]

## Step-by-Step Walkthrough (Top-Down Level 3: Tactical)

### Step 1: [Action Name]
**What you're doing**: [1-2 sentences]
**How to do it**: [Numbered instructions]
**Expected result**: [What user should see]
**Validation**: [How user knows they succeeded]

[Repeat for each step]

## Practice Exercise (Top-Down Level 4: Practice)
[Hands-on task user performs independently]
[Criteria for successful completion]

## Summary
[Key takeaways, 3-5 bullet points]
[Links to related tutorials]
[Next recommended tutorial]

## FAQ
[Common questions and troubleshooting]

## Feedback
[Optional: Rate this tutorial 1-10]
[Link to provide detailed feedback]
```

### TC-2: Writing Style Guidelines

**Tone**:
- Friendly and encouraging, not condescending
- Active voice ("Click the button" not "The button should be clicked")
- Direct address ("You will see..." not "The user will see...")
- Celebrate small wins ("Great job!" after completing steps)

**Clarity**:
- Short sentences (max 20 words average)
- One concept per paragraph
- Bullet points for lists, not long prose
- Visual examples (screenshots, diagrams) for complex concepts

**Bilingual Equivalence**:
- EN and KR versions convey identical meaning
- Cultural adaptation where needed (examples, metaphors)
- Consistent terminology mapping (maintain glossary)
- Both versions reviewed by native speakers

**Terminology Consistency**:

| English Term | Korean Term | Notes |
|--------------|-------------|-------|
| Seed | 씨앗 (Ssiat) | Core concept |
| Center | 센터 (Center) / 중심 (Jungsim) | Use 센터 in UI, 중심 in explanations |
| Wholeness | 전체성 (Jeonchaeseong) | From Alexander's theory |
| Outcome | 결과물 (Gyeolgwamul) / 목표 (Mokpyo) | Context-dependent |
| Template | 템플릿 (Template) | Loanword acceptable |
| MOC | MOC / 지식지도 (Jisikjido) | Both used |

---

## Edge Cases and Error Handling

### EC-1: User Skips Tutorial

**Scenario**: User closes tutorial modal without completing, never returns

**Handling**:
- Tutorial progress saved up to last completed step
- Non-intrusive reminder 3 days later: "Continue your tutorial?"
- Reminder can be dismissed permanently: "Don't show again"
- Tutorial always accessible via command palette
- No penalties or feature locks for skipping tutorials

**Recovery Options**:
```
⏸️ You paused "Seed-Based Quickstart" tutorial at Step 3.

[Resume Tutorial] [Start Over] [Dismiss]

☑️ Don't remind me about this tutorial
```

---

### EC-2: Tutorial Content Out of Sync with Plugin

**Scenario**: Plugin updated to v2.0, tutorial still references v1.0 UI

**Prevention**:
- Tutorial version field in metadata
- Build-time validation: Tutorial version ≤ Plugin version
- Automated screenshots update with UI changes (future)
- Tutorial review checklist for every minor release

**Detection**:
- Tutorial references feature that doesn't exist → Warning banner
- Tutorial references old UI element → Fallback to text instructions
- Version mismatch detected → "This tutorial may be outdated"

**User Experience**:
```
⚠️ Tutorial Version Notice

This tutorial was written for WriteAlive v1.5.
You are using WriteAlive v2.0.

Some screenshots may not match the current UI.
We're updating tutorials soon.

[Continue Anyway] [Report Issue] [Skip Tutorial]
```

---

### EC-3: Video Fails to Load

**Scenario**: Network offline, video file missing, or playback error

**Fallback Strategy**:
1. **Show static thumbnail** with "Video unavailable" overlay
2. **Provide text alternative**: Detailed step descriptions
3. **Offer download option**: "Download video for offline viewing"
4. **Continue tutorial**: Video not blocking, user can proceed

**Error Display**:
```
📹 Video Demo: Gathering Seeds

⚠️ Video could not load.

[Retry] [Download Video] [Continue with Text Instructions]

Text Alternative:
1. Click the 🌱 ribbon icon in the left sidebar
2. Or use Command Palette: Ctrl/Cmd + P → "WriteAlive: Gather Seeds"
3. The Seed Gathering modal will open...
```

---

### EC-4: User's Vault Has No Seeds

**Scenario**: New user starts Seed-Based tutorial but vault has no tagged notes

**Handling**:
- Tutorial auto-creates 4-5 practice seed notes in `_writealive_tutorial/`
- Clear explanation: "We created practice seeds for this tutorial"
- After tutorial: "Now try gathering seeds from your own notes"
- If vault truly empty: Suggest creating first seed note manually

**Setup Flow**:
```
🌱 Setting up tutorial environment...

Your vault doesn't have any seed notes yet.
We'll create some practice seeds for you.

✅ Created 4 practice seed notes
✅ Tagged with #seed and #writealive-tutorial
✅ Added to _writealive_tutorial/ folder

These practice seeds will help you learn.
After the tutorial, you can delete them or keep them.

[Continue Tutorial]
```

---

### EC-5: Language Mismatch with Obsidian

**Scenario**: Obsidian set to Korean, but tutorial defaults to English

**Handling**:
- Auto-detect Obsidian language on first launch
- Default tutorial language matches Obsidian language
- User can override in tutorial library
- Language preference saved per-user

**Language Detection**:
```typescript
function detectTutorialLanguage(): 'en' | 'kr' {
  const obsidianLang = moment.locale(); // Obsidian's language setting
  const userPreference = this.settings.tutorialLanguage;

  if (userPreference) {
    return userPreference; // User explicitly set preference
  }

  if (obsidianLang.startsWith('ko')) {
    return 'kr';
  }

  return 'en'; // Default fallback
}
```

**First-Run Language Selector**:
```
Welcome to WriteAlive!

Choose your tutorial language:

( ) English
( ) 한국어 (Korean)

You can change this anytime in settings.

[Continue]
```

---

### EC-6: Tutorial Validation Fails Unexpectedly

**Scenario**: User performed correct action but validator doesn't recognize it

**Handling**:
- After 3 failed validations: "Skip this validation" button appears
- User can manually confirm: "I completed this step"
- Log validation failures for debugging
- Provide manual override without penalty

**Override UI**:
```
⚠️ We couldn't detect that you completed this step.

Did you click the Gather Seeds button?

If yes, click "I did this" to continue.
If no, try again or watch the demo video.

[I did this - Continue] [Try Again] [Watch Demo] [Get Help]
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal**: Core tutorial system infrastructure

**Tasks**:
- [ ] TutorialManager service (load, track, save progress)
- [ ] Tutorial markdown parser and schema validator
- [ ] TutorialRenderer component (sidebar panel)
- [ ] Progress tracking data model
- [ ] Language selection UI
- [ ] Basic step validation framework

**Deliverables**:
- [ ] Can load and display markdown tutorial
- [ ] Track progress through tutorial steps
- [ ] Switch between EN/KR versions
- [ ] Validate user actions for basic step types

**Success Criteria**:
- [ ] Display first tutorial end-to-end
- [ ] Progress saves and resumes correctly
- [ ] Language switching works seamlessly

---

### Phase 2: Content Development (Week 3-4)

**Goal**: Create core tutorial content (EN versions first)

**Tasks**:
- [ ] Write "Welcome to WriteAlive" tutorial (EN)
- [ ] Write "Choosing Your Writing Mode" tutorial (EN)
- [ ] Write "Seed-Based Quickstart" tutorial (EN)
- [ ] Write "Outcome-Driven Quickstart" tutorial (EN)
- [ ] Create practice vault content (seeds, outcomes)
- [ ] Screenshot production for all tutorials
- [ ] Tutorial content review and editing

**Deliverables**:
- [ ] 4 core tutorials in English, fully tested
- [ ] Practice content auto-generated for tutorials
- [ ] Tutorial library UI with categorization

**Success Criteria**:
- [ ] 5 beta users complete tutorials with 80%+ satisfaction
- [ ] Average completion time within estimated range
- [ ] No blocking bugs in tutorial progression

---

### Phase 3: Bilingual Content (Week 5)

**Goal**: Complete Korean translations and video production

**Tasks**:
- [ ] Translate all tutorial markdown to Korean
- [ ] Terminology consistency review (EN/KR glossary)
- [ ] Korean content review by native speaker
- [ ] Record video demos (EN audio versions)
- [ ] Create Korean subtitles for all videos
- [ ] Test language switching with real users

**Deliverables**:
- [ ] 100% EN/KR parity for core tutorials
- [ ] Video demos with dual-language subtitles
- [ ] Bilingual user testing completed

**Success Criteria**:
- [ ] Korean users rate tutorials 8+/10
- [ ] No translation errors or confusing terminology
- [ ] Videos play correctly in both languages

---

### Phase 4: Advanced Tutorials (Week 6)

**Goal**: Create advanced feature tutorials

**Tasks**:
- [ ] Write "MOC Integration Advanced" tutorial (EN/KR)
- [ ] Write "Version Snapshots" tutorial (EN/KR)
- [ ] Write "Wholeness Analysis" tutorial (EN/KR)
- [ ] Write "Template Library" tutorial (EN/KR)
- [ ] Create advanced practice scenarios
- [ ] Progressive disclosure logic (unlock after prerequisites)

**Deliverables**:
- [ ] 4 advanced tutorials fully bilingual
- [ ] Tutorial tree with prerequisites enforced
- [ ] Feature discovery prompts implemented

**Success Criteria**:
- [ ] Advanced users find and complete advanced tutorials
- [ ] 60%+ of basic tutorial completers try at least 1 advanced tutorial
- [ ] Clear progression path from beginner to advanced

---

### Phase 5: Context Help Integration (Week 7)

**Goal**: Embed help into actual workflows

**Tasks**:
- [ ] Add help buttons to all modals
- [ ] Create context help content for each UI element
- [ ] Implement sidebar help panel (non-blocking)
- [ ] Link error messages to tutorial sections
- [ ] Feature discovery prompts at usage milestones
- [ ] Analytics for help usage patterns

**Deliverables**:
- [ ] Context-sensitive help in every major UI
- [ ] Help content accessible without leaving workflow
- [ ] Usage analytics dashboard for tutorial team

**Success Criteria**:
- [ ] 40%+ of users access context help during first week
- [ ] Help content reduces support questions by 30%
- [ ] No complaints about intrusive help

---

### Phase 6: Polish and Launch (Week 8)

**Goal**: Final testing and documentation

**Tasks**:
- [ ] Full tutorial regression testing
- [ ] Accessibility audit (keyboard, screen readers)
- [ ] Performance optimization (load times, video buffering)
- [ ] Tutorial content final editing pass
- [ ] Create tutorial maintenance documentation
- [ ] User acceptance testing with 20+ users

**Deliverables**:
- [ ] All tutorials pass QA
- [ ] Tutorial system documentation complete
- [ ] Launch announcement materials ready

**Success Criteria**:
- [ ] 0 critical bugs in tutorial system
- [ ] 70%+ UAT completion rate
- [ ] 8.5+/10 average tutorial rating
- [ ] Ready for public release

---

## Success Validation

### Validation Metrics (Post-Launch)

**Month 1 Targets**:
- 70% of new users start at least one tutorial
- 50% complete "Welcome to WriteAlive"
- 40% complete at least one mode-specific tutorial
- 8+/10 average tutorial helpfulness rating
- <5% tutorial-related support tickets

**Month 3 Targets**:
- 60% tutorial completion rate sustained
- 30% of users access advanced tutorials
- 25% tutorial revisit rate
- Context help used in 50% of sessions
- Tutorial content updated based on user feedback

**Analytics to Track**:
```typescript
interface TutorialAnalytics {
  // Engagement
  tutorialsStarted: number;
  tutorialsCompleted: number;
  averageCompletionRate: number;
  averageTimePerTutorial: number;

  // Language
  languagePreference: { en: number, kr: number };
  languageSwitches: number;

  // Progress
  stepsCompletedPerTutorial: { [tutorialId: string]: number };
  abandonmentPoints: { step: number, count: number }[];

  // Help Usage
  contextHelpAccessed: number;
  helpTopicsViewed: { [topic: string]: number };
  videoPlays: number;

  // Quality
  userRatings: number[];
  feedbackSubmissions: number;

  // Outcomes
  documentsCreatedAfterTutorial: number;
  featureAdoptionPostTutorial: { [feature: string]: number };
}
```

---

## Dependencies and Constraints

### Technical Dependencies

1. **Existing WriteAlive Features**
   - Seed Gathering workflow (must be stable)
   - Center Discovery modal (tutorial references it)
   - Outcome Definition modal (tutorial demonstrates it)
   - Document Creator service (tutorials create real documents)

2. **Obsidian API**
   - Sidebar panel API (for tutorial renderer)
   - Command palette integration (tutorial access)
   - Settings API (language preference, progress storage)
   - Workspace API (for highlighting UI elements)

3. **External Tools**
   - Video production software (for demos)
   - Subtitle generation tools (for bilingual captions)
   - Markdown renderer (for tutorial content)

### Resource Constraints

1. **Content Production**
   - 8 core tutorials × 2 languages = 16 tutorial files
   - ~20 video demos × 2 audio versions = 40 video files
   - Screenshot updates required per UI change
   - Estimated: 80-100 hours content creation

2. **Translation**
   - Professional Korean translation or native speaker review
   - Terminology glossary maintenance
   - Ongoing sync between EN/KR versions

3. **Maintenance**
   - Tutorials must update with every UI change
   - Video re-recording for major redesigns
   - Screenshot refresh automation desired

### User Constraints

1. **Learning Time**
   - Users expect quick value (<10 min to first success)
   - Cannot assume technical expertise
   - Must accommodate interrupted learning (pause/resume)

2. **Vault Variability**
   - Users have different vault structures
   - Some vaults empty, some with thousands of notes
   - Tutorial must work in any scenario

3. **Device Diversity**
   - Desktop: Windows, macOS, Linux
   - Mobile: Android, iOS (smaller screens, touch input)
   - Tablets: iPad, Android tablets (hybrid experience)

---

## Out of Scope (Future Enhancements)

The following features are **explicitly NOT part of MVP** and deferred to future iterations:

1. **Interactive Tutorial Builder**
   - Allowing users to create custom tutorials
   - Community tutorial marketplace
   - Deferred to: Phase 2 (after 6 months of user feedback)

2. **AI-Generated Tutorial Personalization**
   - Tutorials adapt based on user's writing patterns
   - Custom tutorial paths generated by AI
   - Deferred to: Phase 3 (requires substantial user data)

3. **Live Tutorial Sessions**
   - Scheduled live walkthroughs with instructors
   - Q&A sessions for cohort learning
   - Deferred to: Enterprise/Education tier (future)

4. **Gamification**
   - Achievement badges for tutorial completion
   - Leaderboards or completion challenges
   - Deferred to: Post-MVP (validate if users want this)

5. **Additional Languages**
   - Beyond EN/KR: Japanese, Chinese, Spanish
   - Deferred to: Based on user demographic data

6. **Advanced Video Features**
   - Interactive video (clickable elements in video)
   - Video quizzes and comprehension checks
   - Deferred to: Phase 2 (resource-intensive)

7. **Tutorial Analytics Dashboard**
   - User-facing analytics: "You've completed 5/12 tutorials"
   - Progress visualization and recommendations
   - Deferred to: Phase 2 (nice-to-have)

---

## Appendix: Sample Tutorial Outline

### Tutorial: "Seed-Based Writing Quickstart" (EN Version)

```markdown
---
tutorial_id: "seed-based-quickstart-EN"
title: "Seed-Based Writing Quickstart"
language: "en"
alternate_version: "seed-based-quickstart-KR"
category: "seed-based"
difficulty: "beginner"
duration_minutes: 15
prerequisites: ["welcome-to-writealive-EN"]
version: "1.0"
---

# Seed-Based Writing Quickstart

## Overview
- **Duration**: 15 minutes
- **Difficulty**: Beginner
- **What you'll learn**:
  - What seeds are and how to identify them
  - How to gather seeds from your vault
  - How AI discovers centers from seeds
  - How to create your first document from a center
- **Prerequisites**: Welcome to WriteAlive tutorial

## Why Seed-Based Writing? (Vision)

Traditional writing starts with an outline. You need to know your thesis, structure, and main points before writing a single word. This creates a high energy barrier.

**Seed-Based Writing** reverses this: you start with small, truthful observations (seeds), discover patterns (centers), and let structure emerge naturally.

**When to use**:
✅ You have scattered ideas but no clear thesis
✅ Creative or exploratory writing
✅ No tight deadline
✅ You want to discover what to write through writing

**Example**: "I have 10 notes about learning methods, but I'm not sure what angle to take for my blog post."

## What Are Seeds? (Strategy)

**Seeds** are small notes containing one idea, observation, or insight.

**Good seeds**:
- ✅ One clear thought per note
- ✅ Tagged for discoverability (#seed, #idea, #💡)
- ✅ Honest and specific (not vague)
- ✅ Can be very short (even one sentence)

**Examples**:
```markdown
# 2025-11-08 Bill Evans Quote
"Don't approximate the whole vaguely. Get a small part entirely true."
#seed #practice
```

```markdown
# Guitar Practice Insight
When I practiced just the first 4 bars perfectly, the rest followed easily.
#idea #music
```

## Step-by-Step Walkthrough (Tactical)

### Step 1: Open the Seed Gathering Modal
**type**: action
**duration**: 1 minute

**What you're doing**: Launch WriteAlive's seed gathering interface

**How to do it**:
1. Look for the 🌱 icon in your left sidebar (ribbon)
2. Click the 🌱 icon

   OR

3. Press Ctrl/Cmd + P to open Command Palette
4. Type "WriteAlive: Gather Seeds"
5. Press Enter

**Expected result**: A modal titled "🌱 Gather Seeds" appears

**Validation**: Modal opened successfully
**Hint**: If stuck, look for the plant icon (🌱) in the left sidebar

---

### Step 2: Explore Practice Seeds
**type**: explanation
**duration**: 2 minutes

For this tutorial, we created 4 practice seed notes in your vault:

📁 `_writealive_tutorial/practice-seeds/`
- seed-1-bill-evans-quote.md
- seed-2-guitar-practice-insight.md
- seed-3-programming-learning.md
- seed-4-tree-growth-observation.md

The Seed Gathering modal should show these 4 notes.

**If you see your own seeds too**: Great! You can include them or focus on just the practice seeds for now.

---

### Step 3: Select Seeds
**type**: interaction
**duration**: 2 minutes

**What you're doing**: Choose which seeds to analyze for centers

**How to do it**:
1. Review the list of seeds in the modal
2. Click checkboxes next to seeds you want to include
3. Select **at least 3 seeds** (recommend all 4 practice seeds)

**Expected result**: Checkmarks appear next to selected seeds

**Validation**: At least 3 seeds selected
**Hint**: Click the checkbox on the left side of each seed note

---

### Step 4: Find Centers with AI
**type**: action
**duration**: 1 minute (+ 5 sec AI processing)

**What you're doing**: Ask AI to discover structural centers in your seeds

**How to do it**:
1. After selecting seeds, find the "🎯 Find Centers" button
2. Click "🎯 Find Centers"
3. Wait 3-5 seconds while AI analyzes (loading indicator appears)

**Expected result**: Center Discovery Results modal opens showing 2-3 centers

**Validation**: Centers discovered and displayed
**Hint**: Button is at the bottom of the Seed Gathering modal

---

### Step 5: Review Center Discovery Results
**type**: explanation
**duration**: 3 minutes

The Center Discovery modal shows centers ranked by strength:

**⭐⭐⭐ Strong Centers**:
- Cross multiple domains (music + programming + nature)
- Emotionally resonant
- Have concrete examples
- Can serve as structural pivots for writing

**⭐⭐ Medium Centers**:
- Connect fewer seeds
- Still useful but narrower scope

**⭐ Weak Centers**:
- Single domain or vague
- Might need more seeds to strengthen

**For practice seeds, you should see**:
- Center 1: "Completeness vs Approximation" (Strong)
- Center 2: "Part-to-Whole Growth" (Medium)

**Take a moment to**:
- Read center descriptions
- See which seeds connect to each center
- Notice strength indicators

---

### Step 6: Start Writing from a Center
**type**: action
**duration**: 1 minute

**What you're doing**: Create a new document based on discovered center

**How to do it**:
1. Choose the **strongest center** (⭐⭐⭐)
2. Click "Start Writing" button on that center card
3. Wait for document to be created

**Expected result**:
- Center Discovery modal closes
- New note opens in editor
- Note title based on center name
- Cursor positioned in writing area
- Success notification appears

**Validation**: Document created and opened
**Hint**: Look for the "Start Writing" button on the center card

---

### Step 7: Observe the Generated Structure
**type**: explanation
**duration**: 2 minutes

Your new document contains:

**Frontmatter (metadata)**:
- Links to original seed notes
- Center information (name, strength)
- Timestamp of creation

**Main Writing Area**:
- Center title as heading
- Center description
- Writing prompt to get started
- Blank space for your writing

**Seed References Section**:
- Excerpts from connected seeds
- Links back to original notes
- Quick reference while writing

**Take a moment to**:
- Read the center description
- Review the seed excerpts at bottom
- Notice the writing prompt

---

### Step 8: Write Your First Paragraph
**type**: practice
**duration**: 3 minutes

**What you're doing**: Write 2-3 sentences starting from this center

**How to do it**:
1. Position cursor in writing area (after the prompt)
2. Write 2-3 sentences responding to the center
3. Don't worry about perfection - remember Bill Evans: "small part, entirely true"

**Example**:
```markdown
Bill Evans said "Don't approximate the whole vaguely."
When I practiced guitar, I proved this myself.
Perfect 4 bars led to the whole song flowing naturally.
```

**Validation**: At least 2 sentences written
**Hint**: Reference the seed excerpts at the bottom for inspiration

---

## Practice Exercise

**Your turn!**

Now that you've completed the tutorial with practice seeds:

1. Create 2-3 of your own seed notes on a topic you care about
2. Tag them with #seed or #idea
3. Gather seeds again and find centers
4. Compare: Are centers from your real seeds stronger than practice seeds?

**Success criteria**:
- You created real seed notes
- You ran center discovery on your own content
- You started a document from your own center

---

## Summary

You've learned:
✅ What seeds are (small, truthful notes tagged for discovery)
✅ How to gather seeds from your vault
✅ How AI discovers structural centers across seeds
✅ How to create documents from centers
✅ The basics of Seed-Based Writing workflow

**Key insight**:
Writing doesn't start with an outline. It starts with **seeds** that reveal their own **centers** which generate **structure**.

---

## Next Steps

**Continue your learning**:
- [Using Next Steps AI](tutorial-next-steps-EN.md) - Get AI expansion suggestions
- [Understanding Wholeness](tutorial-wholeness-EN.md) - Measure writing quality
- [Advanced: MOC Integration](tutorial-moc-integration-EN.md) - Find centers in organized notes

**Try it yourself**:
- Spend 1 week creating seed notes (aim for 10-15)
- Run center discovery next weekend
- Write your first real document!

---

## FAQ

**Q: How many seeds do I need?**
A: Minimum 3, optimal 5-15. Too few = weak centers. Too many = scattered centers.

**Q: My seeds are in different topics. Is that okay?**
A: Yes! Cross-domain seeds often create the strongest centers (e.g., music + coding + nature).

**Q: What if AI doesn't find strong centers?**
A: Try gathering more seeds on related topics, or try Outcome-Driven mode instead.

**Q: Can I edit centers after discovery?**
A: Not the AI-discovered centers, but you can edit the document title and content after creation.

**Q: Do seeds have to be in English?**
A: No! Seeds work in Korean, English, or mixed languages.

---

## Feedback

**How helpful was this tutorial?**

[Rate 1-10] [Provide detailed feedback]

Your feedback helps us improve tutorials for everyone!

---

**End of Tutorial**
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-08 | Product Management | Initial specification for top-down tutorial system |

---

**End of Specification**
