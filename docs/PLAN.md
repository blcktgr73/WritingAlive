# Technical Design Document: WriteAlive

**Version**: 1.0
**Last Updated**: 2025-11-03
**Status**: Living Document (Evolves with Transformations)
**Related Documents**: [PRD.md](./docs/PRD.md) | [CLAUDE.md](./CLAUDE.md)

---

## Current Implementation Status (2025-11-03)

### ✅ Completed Transformations

**Foundation (Phase 0)**:
- T-001: Plugin scaffold with TypeScript, esbuild, tests ✅
- Settings infrastructure and encryption ✅

**Core Workflow (Phase 1-3)**:
- T-007: Seed Gathering with tag filtering, photo support ✅
- T-008: MOC Detection and parsing ✅
- T-009: Living MOC auto-update system ✅
- T-010: Center Finding Logic (AI service) ✅
- T-011a: DocumentCreator Service (note generation) ✅
- T-011b: Center Discovery Modal (UI) ✅
- T-013: Complete workflow integration ✅

**Technical Components**:
- AI Service Layer with Claude 3.5 Sonnet ✅
- Tag filtering and statistics (emoji + multilingual) ✅
- Relationship detection across notes ✅
- Comprehensive test suite (unit + integration) ✅

**Performance Achieved**:
- Seed gathering: <5s ✅ (target: <5s)
- AI center finding: 3-5s ✅ (target: 3-5s)
- Document creation: <2s ✅ (target: <2s)
- End-to-end workflow: ~10-15s ✅ (target: <90s)

### 📝 Next Transformations

**Phase 4: Refinement Features**:
- T-023: Expansion prompts (generative suggestions)
- T-024: Read-aloud feedback
- T-025: Wholeness scoring system
- T-026: Version snapshots and comparison

**Phase 5: Polish**:
- T-027: i18n framework (Korean + English)
- T-028: Error handling and recovery
- T-029: User documentation

### 📊 Progress Summary

- **Completed**: 8 major transformations
- **Phase completion**: Phase 0 (100%), Phase 1-3 Core Features (70%)
- **Timeline**: Week 3 of 8-9 week plan
- **On track**: Yes - core workflow complete ahead of schedule

---

## Executive Summary

This technical design document provides a comprehensive blueprint for implementing WriteAlive, an AI-assisted writing tool based on the Saligo Writing (살리고 글쓰기) methodology developed by June Kim (김창준), inspired by Christopher Alexander's "The Nature of Order" and Bill Evans' step-by-step learning philosophy.

**MVP Scope**: Obsidian plugin with Claude API integration + Mobile support
**Timeline**: 8-9 weeks (34 transformations)
**Target**: Enable low-friction writing through seed-based creation, AI-assisted center discovery, wholeness analysis, and iterative refinement

**Key Architectural Decisions**:
- Platform: Obsidian Plugin (Desktop + Mobile) → Web App (post-MVP)
- AI Provider: Claude 3.5 Sonnet (primary)
- Storage: YAML Frontmatter + Local File System
- Architecture Pattern: Service-oriented with clean abstractions
- Development Methodology: Transformation-Centered (per CLAUDE.md)
- **Mobile-First**: Core features (seed capture, MOC viewing) optimized for mobile from day 1

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Technology Stack Decisions](#2-technology-stack-decisions)
3. [Data Models & Storage Architecture](#3-data-models--storage-architecture)
4. [API Design & AI Integration](#4-api-design--ai-integration)
5. [Security & Performance Architecture](#5-security--performance-architecture)
6. [Transformation-Based Task Breakdown](#6-transformation-based-task-breakdown)
7. [Testing Strategy](#7-testing-strategy)
8. [Deployment & Release Strategy](#8-deployment--release-strategy)
9. [Open Technical Decisions](#9-open-technical-decisions)

---

## 1. System Architecture Overview

### 1.1 High-Level Component Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    User Environment                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐        │
│  │  Obsidian   │  │  Markdown   │  │    Local     │        │
│  │    Vault    │  │    Files    │  │   Storage    │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘        │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                WriteAlive Plugin Core                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Plugin Main (Lifecycle, Commands, Settings)         │  │
│  └────┬─────────────────────┬─────────────────────┬─────┘  │
│       │                     │                     │         │
│  ┌────▼─────┐   ┌──────────▼────────┐   ┌────────▼─────┐  │
│  │    UI    │   │  Service Layer    │   │   Storage    │  │
│  │Components│◄──┤  - AIService      │◄──┤   Manager    │  │
│  │  (React) │   │  - CenterAnalyzer │   │  (Frontmatter│  │
│  │          │   │  - Wholeness Eval │   │   + Snapshots│  │
│  └──────────┘   │  - RateLimiter    │   └──────────────┘  │
│                 │  - CacheService   │                      │
│                 └───────────┬───────┘                      │
└─────────────────────────────┼───────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────┐
│              External Services (AI Providers)                │
│         ┌────────────┐      │      ┌────────────┐           │
│         │   Claude   │◄─────┴─────►│ GPT (Later)│           │
│         │   3.5      │              │            │           │
│         │  Sonnet    │              │  Gemini    │           │
│         │  (MVP)     │              │  (Later)   │           │
│         └────────────┘              └────────────┘           │
└──────────────────────────────────────────────────────────────┘
\`\`\`

### 1.2 Core Components

#### 1.2.1 Plugin Core (\`src/main.ts\`)
**Responsibility**: Obsidian plugin lifecycle, command registration, settings management

**Key Interfaces**:
\`\`\`typescript
interface WriteAlivePlugin extends Plugin {
  settings: WriteAliveSettings;
  aiService: AIServiceLayer;
  storageManager: StorageManager;
  
  onload(): Promise<void>;
  onunload(): void;
  registerCommands(): void;
  registerUI(): void;
}
\`\`\`

#### 1.2.2 AI Service Layer (\`src/services/ai/\`)
**Responsibility**: Abstract AI provider interactions, manage API calls, handle rate limiting/caching

**Key Interfaces**:
\`\`\`typescript
interface AIService {
  findCenters(text: string, context?: string): Promise<Center[]>;
  suggestExpansions(center: Center): Promise<ExpansionPrompt[]>;
  analyzeWholeness(document: string): Promise<WholenessAnalysis>;
  checkParagraphUnity(paragraph: string): Promise<UnityCheck>;
}

interface AIProvider {
  name: 'claude' | 'gpt' | 'gemini';
  makeRequest(prompt: PromptTemplate, params: any): Promise<AIResponse>;
  estimateCost(tokens: number): number;
}
\`\`\`

#### 1.2.3 Storage Manager (\`src/services/storage/\`)
**Responsibility**: Manage document metadata, snapshots, versioning via YAML frontmatter

**Key Interfaces**:
\`\`\`typescript
interface StorageManager {
  readMetadata(file: TFile): Promise<DocumentMetadata>;
  updateMetadata(file: TFile, metadata: Partial<DocumentMetadata>): Promise<void>;
  createSnapshot(file: TFile, name: string): Promise<Snapshot>;
  listSnapshots(file: TFile): Promise<Snapshot[]>;
  compareSnapshots(snap1: Snapshot, snap2: Snapshot): Diff;
}
\`\`\`

#### 1.2.4 Center Analyzer (\`src/services/analysis/center-analyzer.ts\`)
**Responsibility**: Process AI responses for center identification, validate suggestions

**Key Interfaces**:
\`\`\`typescript
interface Center {
  id: string;
  text: string;
  position: { start: number; end: number };
  paragraph: number;
  confidence: number;
  timestamp: string;
  source: 'ai-suggested' | 'user-identified';
  accepted: boolean;
  explanation?: string;
}
\`\`\`

#### 1.2.5 Wholeness Evaluator (\`src/services/analysis/wholeness-evaluator.ts\`)
**Responsibility**: Calculate wholeness metrics, identify structural gaps

**Key Interfaces**:
\`\`\`typescript
interface WholenessAnalysis {
  score: number; // 1-10
  paragraphUnity: UnityScore[];
  transitions: TransitionStrength[];
  centerHierarchy: CenterNode[];
  gaps: Gap[];
  suggestions: string[];
}
\`\`\`

### 1.3 Data Flow: Seed → Center Discovery

\`\`\`
User writes seed → Select text → "Find Centers" command
  ↓
Plugin extracts text + context (±2 paragraphs)
  ↓
AIService.findCenters(text, context)
  ↓
ClaudeProvider constructs prompt with Saligo Writing context
  ↓
POST to Claude API /v1/messages
  ↓
Parse JSON response → Center[]
  ↓
Display in CenterFinderModal (Accept/Dismiss)
  ↓
User accepts → StorageManager.updateMetadata()
  ↓
YAML frontmatter updated → Centers highlighted in editor
\`\`\`



---

## 5. Security & Performance Architecture

### 5.1 API Key Encryption
- Web Crypto API with AES-GCM (256-bit)
- Device-specific key via PBKDF2 (100k iterations)
- Random IV per encryption
- Stored in Obsidian LocalStorage (encrypted)

### 5.2 Performance Optimizations
- Lazy loading React components
- Debounced auto-save (30s desktop, 2s mobile)
- Incremental wholeness analysis (reanalyze only changed paragraphs)
- AI response caching (24h TTL)
- **Mobile-specific**:
  - Image compression before upload (max 1MB)
  - Aggressive request batching
  - Reduced animation/transitions
  - Local-first architecture (offline queue)

### 5.3 Mobile-Specific Considerations

#### Platform Support
- **Android**: Obsidian Mobile 1.4.0+ (API Level 24+, Android 7.0+)
- **iOS**: Obsidian Mobile 1.4.0+ (iOS 14.0+)
- **Touch Optimization**: Min tap target 44x44px (Apple HIG, Material Design)
- **Screen Sizes**:
  - Mobile: 360x640 (small) to 414x896 (large)
  - Tablet: 768x1024 to 1024x1366

#### Mobile UI Constraints
**What Works Well on Mobile** (MVP):
- ✅ Quick seed capture (voice + text + photo)
- ✅ Browsing MOCs (read-only)
- ✅ Reviewing gathered seeds
- ✅ Tagging and organizing
- ✅ Sync status visibility

**What Doesn't Work on Mobile** (Desktop Only):
- ❌ AI center discovery (requires extended focus + screen space)
- ❌ Document editing with AI suggestions (complex UI)
- ✅ Wholeness analysis visualization (too complex)
- ❌ Multi-column layouts
- ❌ Drag-and-drop reordering

#### Mobile-Specific Tech Stack
- **No React on Mobile UI**: Use native Obsidian Mobile components (lighter)
- **Voice Input**: Platform-native Speech Recognition API
  - Android: `SpeechRecognizer`
  - iOS: `SFSpeechRecognizer`
- **Photo Capture**: Obsidian's file attachment API
- **Offline Storage**: IndexedDB + LocalForage (cross-platform)
- **Touch Gestures**: Hammer.js or native touch events

#### Offline-First Architecture
```typescript
interface OfflineQueue {
  queueSeed(seed: Seed): void;
  syncWhenOnline(): Promise<void>;
  getQueueStatus(): { pending: number, synced: number };
}
```

**Sync Strategy**:
1. User captures seed on mobile → Saved to local IndexedDB immediately
2. Background sync attempts every 30s (if online)
3. On app resume: force sync attempt
4. Show clear indicators: "3 seeds pending sync"

#### Performance Targets (Mobile)
- **Cold Start**: < 2s to app ready
- **Seed Capture**: < 5s from tap to saved
- **Voice Input**: < 500ms to start recording
- **Photo Attach**: < 3s to compress + attach
- **Sync**: < 5 min for 95% of seeds
- **Battery**: < 2% drain per hour of idle sync

#### Testing Strategy (Mobile)
- **Real Device Testing**:
  - Android: Samsung Galaxy S21 (mid-range)
  - iOS: iPhone 12 (mid-range)
- **Emulator Testing**: Android Studio + Xcode Simulator
- **Network Conditions**: Test on 3G, 4G, WiFi, Offline
- **Battery Testing**: Monitor battery drain during sync

---

## 6. Transformation-Based Task Breakdown

**Total**: 34 transformations over 8-9 weeks

### Summary of Phases

**Phase 0: Foundation** (Week 1) - T-001 to T-003
- Project scaffold, settings UI, encryption

**Phase 1: AI Infrastructure** (Week 2-3) - T-004 to T-011
- AI service layer, Claude provider, prompts, **seed gathering**, **MOC detection**, **Living MOC auto-update**, center finding, wholeness analysis

**Phase 2: Storage** (Week 3-4) - T-012 to T-015
- YAML frontmatter manager, snapshots, diffs, rate limiting

**Phase 3: User Interface** (Week 4-5) - T-016 to T-022
- Commands, seed modal, **MOC modal**, center modal, panels, highlighting, cost warnings

**Phase 4: Refinement Features** (Week 6) - T-023 to T-026
- Expansion prompts, read-aloud, labeling, unity checker

**Phase 5: Polish** (Week 7) - T-027 to T-029
- i18n, error handling, documentation

**Phase 6: Testing** (Week 8) - T-030 to T-032
- Unit tests, integration tests, QA checklist

**Phase 7: Release** (Week 8-9) - T-033 to T-034
- Plugin submission, living docs

### Key Transformations Detail

**T-20251101-001: Initialize Plugin Scaffold**
- Intent: Establish foundation for structural growth
- Acceptance: Plugin loads, builds, lints successfully
- Time: 1-2 hours

**T-20251101-007: Implement Seed Gathering from Vault** ✅ COMPLETED (2025-11-02)
- Intent: Connect scattered notes to writing initiation (zero-friction capture → creation)
- Acceptance:
  - Searches vault for configurable seed tags (Settings: #seed, #idea, #💡, etc.)
  - Returns list with: note title, seed text, creation date, backlinks, photos, matched tags
  - Filters by date range ("today", "this week", "this month", "all time")
  - Presents in modal with preview + multi-select + "Select All" button
  - Photo seeds display thumbnail previews with 📷 indicator
  - Creates new document with gathered seeds in clean list format
  - Auto-triggers AI center discovery after document creation
- Implementation:
  - File: `src/ui/gather-seeds-modal.ts` (480 lines)
  - Service: `src/services/vault/seed-gatherer.ts`
  - UI: Modal with filters, seed list, checkbox selection, action buttons
  - Features: Date filters, sort options, photo thumbnail display, "Start Writing" workflow
  - Build: Successfully compiled to main.js (58KB)
- Dependencies: Completed - T-004 (AI Service), T-005 (Claude Provider)
- Actual Time: ~4 hours (including UI polish and testing)

**T-20251101-008: Implement MOC Detection and Parsing**
- Intent: Support existing knowledge organization workflows (Zettelkasten, PARA, etc.)
- Acceptance:
  - Detects MOCs via: folder path pattern, `#moc` tag, or YAML `type: moc`
  - Parses MOC structure (headings, links, hierarchy)
  - Extracts all linked notes with metadata
  - Caches MOC index for performance
- Dependencies: T-004 (Vault access)
- Time: 2 hours

**T-20251101-009: Implement Living MOC Auto-Update System**
- Intent: Make MOCs living documents that evolve with daily note-taking
- Acceptance:
  - Vault file watcher monitors new/modified notes with `#seed` tags
  - Detects MOCs with `writealive.auto_gather_seeds: true` in frontmatter
  - Matches seed tags against MOC's `seed_tags` list
  - Parses MOC to find `<!-- BEGIN WRITEALIVE-AUTO -->` markers
  - Inserts new seed links in auto-section (sorted by recency)
  - Three update modes: realtime, daily notification, manual suggestion
  - Never modifies content outside markers
  - Undo/revert support for last auto-update
- Dependencies: T-008 (MOC Detection)
- Time: 2-3 hours

**T-20251101-010: Implement Center Finding Logic**
- Intent: Enable AI-assisted center discovery (core capability)
- Acceptance: Extracts context, calls AI, parses centers with positions
- Time: 2 hours

**T-20251101-015: Create Seed Gathering Modal**
- Intent: User-friendly interface for selecting seeds from vault
- Acceptance:
  - Modal displays gathered seeds with metadata
  - Preview pane shows full note context
  - Multi-select capability
  - "Start writing with selected seeds" action
- Time: 2 hours

**T-20251101-016: Create MOC Selection Modal**
- Intent: User-friendly interface for starting writing from MOC
- Acceptance:
  - Modal displays available MOCs with metadata (title, link count, last modified)
  - Preview pane shows MOC structure and linked notes
  - "Start Writing" creates document with MOC context
  - Option to expand full note content or use excerpts
  - Settings to configure MOC detection patterns
- Time: 2 hours

**T-20251101-017: Create Center Selection Modal**
- Intent: User-friendly center review interface
- Acceptance: Modal shows suggestions, accept/dismiss, keyboard nav
- Time: 2 hours

**T-20251101-026: Implement i18n**
- Intent: Bilingual accessibility (Korean/English)
- Acceptance: i18next setup, translations complete, auto-detection
- Time: 2 hours

(See full task details in original PLAN.md sections above)

---

## 7. Testing Strategy

### Testing Pyramid
- Unit Tests: ~100+ cases (Vitest), 80% coverage
- Integration Tests: ~15 cases (optional, real API calls)
- Manual QA: ~10 test scenarios

### Unit Test Example
```typescript
describe('ClaudeProvider', () => {
  it('finds centers', async () => {
    const provider = new ClaudeProvider('test-key');
    const centers = await provider.findCenters('text');
    expect(centers).toHaveLength(1);
  });
});
```

---

## 8. Deployment & Release Strategy

### Development
```bash
npm install && npm run dev
# Edit → Save → Auto-rebuild → Reload Obsidian
git commit -m "T-YYYYMMDD-###: Description"
```

### Versioning
- 0.1.0: Alpha
- 1.0.0: MVP release

### Release Process
1. Beta via BRAT (20+ testers, 2 weeks)
2. Submit to Obsidian community plugins
3. Wait for review (1-4 weeks)
4. Public release

---

## 9. Open Technical Decisions

### Needs Investigation
1. **CodeMirror vs React for UI**: Hybrid approach recommended
2. **Large document handling**: Sliding window + 20k word limit
3. **Local LLM support**: Post-MVP if demand exists
4. **Snapshot sync**: Store in vault (.writealive/ folder)

### Trade-offs for Discussion
1. **AI Quality vs Cost**: Claude-only MVP
2. **Telemetry**: None for MVP (privacy first)
3. **Monetization**: Free BYOK, evaluate later

### Technical Risks
1. **Obsidian API changes**: Pin version, monitor changelog
2. **Claude pricing changes**: Multi-provider support, caching
3. **Prompt degradation**: Versioning, A/B testing

---

## Summary & Next Steps

### Key Deliverables
- PLAN.md, TRANSFORMATIONS.md, BACKLOG.md, DECISIONS.md, ARCHITECTURE.md
- QA_CHECKLIST.md, USER_GUIDE.md
- Complete plugin codebase with 80%+ test coverage

### Project Structure
```
src/
├── main.ts
├── services/ (ai, storage, analysis)
├── ui/ (React components)
├── models/ (TypeScript types)
└── utils/

tests/
├── unit/
└── integration/
```

### Immediate Next Steps
1. Review this PLAN.md with stakeholders
2. Validate against PRD requirements
3. Begin T-20251101-001 (project scaffold)
4. Set up weekly transformation review meetings
5. Update living documentation with each milestone

---

**Document Status**: In Progress - T-007 Gather Seeds Completed
**Created**: 2025-11-01
**Last Updated**: 2025-11-02
**Author**: Claude (Transformation Agent)
**Total Transformations**: 34 over 8-9 weeks
**PRD Version**: 1.1
**Completed Transformations**: 1/34 (T-007)

## Document History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-01 | 1.0 | Initial comprehensive technical design based on PRD 1.0 |
| 2025-11-02 | 1.1 | Updated T-007 with completion status and implementation details. Gather Seeds feature fully implemented with photo support, emoji tags, and enhanced UI (480 lines). Build successful (main.js 58KB). |

> **Living Document**: This PLAN.md evolves with the project. Each transformation should reference back to this plan and update TRANSFORMATIONS.md with actual outcomes.
