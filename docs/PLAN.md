# Technical Design Document: WriteAlive

**Version**: 1.0  
**Last Updated**: 2025-11-01  
**Status**: Living Document (Evolves with Transformations)  
**Related Documents**: [PRD.md](./docs/PRD.md) | [CLAUDE.md](./CLAUDE.md)

---

## Executive Summary

This technical design document provides a comprehensive blueprint for implementing WriteAlive, an AI-assisted writing tool based on the Saligo Writing methodology inspired by Christopher Alexander's "Nature of Order" and Bill Evans' step-by-step learning philosophy.

**MVP Scope**: Obsidian plugin with Claude API integration  
**Timeline**: 8-9 weeks (30 transformations)  
**Target**: Enable low-friction writing through seed-based creation, AI-assisted center discovery, wholeness analysis, and iterative refinement

**Key Architectural Decisions**:
- Platform: Obsidian Plugin → Web App (post-MVP)
- AI Provider: Claude 3.5 Sonnet (primary)
- Storage: YAML Frontmatter + Local File System
- Architecture Pattern: Service-oriented with clean abstractions
- Development Methodology: Transformation-Centered (per CLAUDE.md)

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
- Debounced auto-save (30s)
- Incremental wholeness analysis (reanalyze only changed paragraphs)
- AI response caching (24h TTL)

---

## 6. Transformation-Based Task Breakdown

**Total**: 33 transformations over 8-9 weeks

### Summary of Phases

**Phase 0: Foundation** (Week 1) - T-001 to T-003
- Project scaffold, settings UI, encryption

**Phase 1: AI Infrastructure** (Week 2-3) - T-004 to T-010
- AI service layer, Claude provider, prompts, **seed gathering**, **MOC detection**, center finding, wholeness analysis

**Phase 2: Storage** (Week 3-4) - T-011 to T-014
- YAML frontmatter manager, snapshots, diffs, rate limiting

**Phase 3: User Interface** (Week 4-5) - T-015 to T-021
- Commands, seed modal, **MOC modal**, center modal, panels, highlighting, cost warnings

**Phase 4: Refinement Features** (Week 6) - T-022 to T-025
- Expansion prompts, read-aloud, labeling, unity checker

**Phase 5: Polish** (Week 7) - T-026 to T-028
- i18n, error handling, documentation

**Phase 6: Testing** (Week 8) - T-029 to T-031
- Unit tests, integration tests, QA checklist

**Phase 7: Release** (Week 8-9) - T-032 to T-033
- Plugin submission, living docs

### Key Transformations Detail

**T-20251101-001: Initialize Plugin Scaffold**
- Intent: Establish foundation for structural growth
- Acceptance: Plugin loads, builds, lints successfully
- Time: 1-2 hours

**T-20251101-007: Implement Seed Gathering from Vault**
- Intent: Connect scattered notes to writing initiation (zero-friction capture → creation)
- Acceptance:
  - Searches vault for `#seed` or `#writealive-seed` tags
  - Returns list with: note title, seed text, creation date, backlinks
  - Filters by date range (e.g., "this week", "this month")
  - Presents in modal with preview + selection
- Dependencies: T-004 (AI Service), T-005 (Claude Provider)
- Time: 2 hours

**T-20251101-008: Implement MOC Detection and Parsing**
- Intent: Support existing knowledge organization workflows (Zettelkasten, PARA, etc.)
- Acceptance:
  - Detects MOCs via: folder path pattern, `#moc` tag, or YAML `type: moc`
  - Parses MOC structure (headings, links, hierarchy)
  - Extracts all linked notes with metadata
  - Caches MOC index for performance
- Dependencies: T-004 (Vault access)
- Time: 2 hours

**T-20251101-009: Implement Center Finding Logic**
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

**Document Status**: Draft - Awaiting Stakeholder Review  
**Created**: 2025-11-01  
**Author**: Claude (Transformation Agent)  
**Total Transformations**: 30 over 8-9 weeks  
**PRD Version**: 1.0

> **Living Document**: This PLAN.md evolves with the project. Each transformation should reference back to this plan and update TRANSFORMATIONS.md with actual outcomes.
