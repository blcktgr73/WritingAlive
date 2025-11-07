# WriteAlive (살리고 글쓰기 도우미)

> **AI-Assisted Writing Tool Based on Saligo Writing Methodology**

WriteAlive is an Obsidian plugin that helps you practice **Saligo Writing (살리고 글쓰기)** — a generative, iterative approach to writing developed by **June Kim (김창준)**, inspired by Christopher Alexander's concepts of Wholeness, Centers, and Generative Sequence from "The Nature of Order", combined with Bill Evans' philosophy of deliberate practice.

## 🌱 Core Philosophy

### The Problem with Traditional Writing
- High energy barrier: Need complete outline before starting
- Ideas scattered across notes never become coherent writing
- Writer's block from facing blank pages
- Rigid structure kills creative discovery

### The Saligo Writing Solution: Three Complementary Modes

WriteAlive supports **three writing modes** that maintain Saligo principles while adapting to different contexts:

#### 1. **Seed-Based Writing** (Bottom-Up Discovery)
- Start with scattered seed notes → Discover centers → Write from emerging patterns
- **Best for**: Exploratory essays, creative writing, personal reflection
- **Centers evolve**: From weak connections to strong structural pivots through iterative writing
- **Wholeness**: Measured by how centers unify disparate seeds into coherent narrative

#### 2. **Outcome-Driven Writing** (Top-Down with Generative Steps)
- Define writing goal → AI suggests gentle structure → Write section-by-section using small steps
- **Best for**: Professional reports, proposals, deadline-driven documents
- **Centers evolve**: Each section develops its own micro-centers that serve the overall outcome
- **Wholeness**: Measured by how well sections contribute to unified outcome while maintaining internal coherence

#### 3. **Hybrid Writing** (Discovery + Intention)
- Define outcome + Gather seeds → AI finds outcome-aligned centers → Write with intentional direction grounded in existing insights
- **Best for**: Academic papers, literature reviews, thesis chapters
- **Centers evolve**: Seeds crystallize into centers that both serve your thesis AND reveal unexpected insights
- **Wholeness**: Measured by alignment (center serves outcome) × depth (center reveals new understanding)

**Core Principles Across All Modes**:
- **Low energy start**: Begin with small, truthful steps (never full outlines)
- **Generative growth**: Structure evolves through writing, not dictated beforehand
- **Center-based evolution**: Strong ideas naturally strengthen weak ones through iterative refinement
- **Wholeness tracking**: Continuous feedback on structural coherence (1-10 scale)

### Inspired by Bill Evans' Practice Philosophy
> "Don't approximate the whole vaguely. Take a small part and be entirely true, entirely real, entirely accurate about it."

This philosophy applies whether you're discovering centers from seeds, writing toward an outcome, or synthesizing existing knowledge with new goals.

## ✨ Key Features

### 🎯 Three Writing Modes (New in Epic 5)

**Choose your starting point based on context**:

1. **Seed-Based Mode** (✅ Available Now)
   - Gather scattered notes → Discover centers → Write organically
   - Perfect for exploratory essays and creative writing

2. **Outcome-Driven Mode** (📋 Planned - Epic 5)
   - Define writing goal → AI generates structure → Write section-by-section
   - Perfect for professional reports and deadline-driven work

3. **Hybrid Mode** (📋 Planned - Epic 5)
   - Define outcome + Select seeds → AI finds aligned centers → Write with purpose
   - Perfect for academic papers and thesis chapters

**All modes maintain**: Low energy start, center evolution, wholeness tracking

See [PRODUCT-SPEC-OUTCOME-HYBRID-WRITING.md](docs/PRODUCT-SPEC-OUTCOME-HYBRID-WRITING.md) for detailed specification.

---

### 🌱 Seed Gathering & MOC Integration (Seed-Based & Hybrid Modes)

- **Seed Gathering**: Automatically collect tagged ideas from your entire vault
  - Configurable seed tags: `#seed`, `#idea`, `#💡`, `#씨앗`, or your custom tags
  - Support for multiple tags (finds notes matching any configured tag)
  - Bilingual support: Korean and English tags work seamlessly
  - **Quick Start Mode**: Auto-select recent 10 seeds for instant center discovery

- **MOC Integration**: Start writing from your Map of Contents notes
  - Works with `#moc` tag, folder patterns, or YAML frontmatter
  - **NEW: Find Centers from MOC** - Discover structural centers from organized note collections
    - AI analysis of 10-30 linked notes in your MOCs
    - MOC structure awareness (headings, cross-domain patterns)
    - Validation warnings for optimal MOC quality
    - Cost-transparent analysis ($0.020-0.035 per MOC)
    - Documents include MOC source attribution
  - See tutorials: [English](docs/TUTORIAL-USING-MOC-EN.md) | [한국어](docs/TUTORIAL-USING-MOC-KR.md)

- **Living MOCs**: Auto-update your MOCs with new seeds matching specific themes
  - Set tags per MOC: e.g., `seed_tags: [creativity, practice, 창의성]`
  - Three modes: realtime, daily notifications, or manual
  - Never overwrites your manual content

- Zero-friction path: "note while reading" → "coherent essay"
- Works with existing Zettelkasten, PARA, and other PKM workflows

### 🎯 AI-Assisted Center Discovery (All Modes)

**Centers are the structural pivots that give your writing "life"**. WriteAlive helps centers evolve and strengthen through iterative writing.

- **Three Discovery Workflows**:
  1. **From Scattered Seeds** (Seed-Based): Discover patterns across 5-15 tagged notes
  2. **From Organized MOCs** (Seed-Based): Synthesize 10-30 linked notes into thesis statements
  3. **From Outcome + Seeds** (Hybrid): Find centers that serve your goal while revealing insights

- **Center Evolution Tracking**:
  - Visual strength indicators: ⭐⭐⭐ Strong, ⭐⭐ Medium, ⭐ Weak
  - Watch centers strengthen as you write and refine
  - See how centers connect to seeds and support overall structure

- **Outcome-Driven Center Development** (Planned):
  - Each section develops micro-centers that serve the whole
  - AI suggests where to deepen or expand based on wholeness metrics

- Powered by Claude 3.5 Sonnet, GPT-4, or Gemini Pro

### 🌿 Generative Expansion (All Modes)

- AI suggests multiple directions to develop your ideas
- Choose paths that feel most alive and strengthen wholeness
- **Seed-Based**: Expand from discovered centers
- **Outcome-Driven**: Expand sections while maintaining outcome alignment
- **Hybrid**: Balance discovery and intention

### 📊 Wholeness Analysis (All Modes)

**Wholeness measures how well your writing holds together as a unified living structure**:

- **Quantify structural coherence**: 1-10 scale across all writing modes
- **Track center evolution**: See how centers strengthen through iterations
- **Mode-specific metrics**:
  - **Seed-Based**: How well centers unify disparate seeds
  - **Outcome-Driven**: How well sections contribute to unified outcome
  - **Hybrid**: Alignment (serves outcome) × Depth (reveals insight)
- Visual feedback on document evolution
- Iterative refinement guidance based on wholeness scores

### 🔄 Version Snapshots
- Save transformation checkpoints
- Compare versions to see structural improvements
- Safe experimentation with rollback capability

### 🎓 Academic Writing Support
- Optional paragraph labeling ([Claim], [Evidence], [Analysis])
- Unity checking for coherent paragraph structure
- Bridge between generative freedom and academic rigor

## 📚 Documentation

### Getting Started
- **[TUTORIAL (English)](docs/TUTORIAL-EN.md)** - Hands-on tutorial with concrete examples
  - Experience Saligo Writing step-by-step
  - Learn through realistic scenarios
  - Practice with Bill Evans' philosophy

- **[튜토리얼 (한국어)](docs/TUTORIAL-KO.md)** - 구체적 사례로 배우는 실습 가이드
  - 살리고 글쓰기를 단계별로 체험
  - 실제 시나리오로 학습
  - 빌 에반스 철학 적용 연습

### Essential Reading
- **[PRD.md](docs/PRD.md)** - Product Requirements Document
  - Product vision and goals
  - User personas and journeys
  - Core user stories (Epic 0-7)
  - Success metrics and acceptance criteria

- **[PLAN.md](docs/PLAN.md)** - Technical Design & Implementation Plan
  - System architecture and data models
  - Technology stack decisions
  - 31 transformation tasks (8-9 week roadmap)
  - Testing and deployment strategy

- **[TRANSFORMATIONS.md](docs/TRANSFORMATIONS.md)** - Transformation Log
  - All completed transformations
  - Implementation details and rationale
  - Design decisions and trade-offs

- **[CLAUDE.md](CLAUDE.md)** - Development Philosophy
  - Transformation-Centered AI Pair Programming principles
  - Generative Sequence-based development loop
  - Coding standards and deliverable structure

### Reference Materials
- **[WriteAlive 개요](docs/reference/WriteAlive-살리고%20글쓰기%20도우미.md)** - Original concept document (Korean)
- **[Bill Evans - Creative Process](docs/reference/20251101%20Universal%20Mind%20of%20Bill%20Evans%20-%20Creative%20Process%20and%20Self-Teaching.md)** - Practice philosophy inspiration
- **[Bill Evans - 연습 방법](docs/reference/20251101%20성공의%20단계에%20이르는%20빌%20에반스의%20연습%20방법.md)** - Korean summary

### Implementation Details
- **[docs/implementation/](docs/implementation/)** - Phase implementation summaries and verification checklists
- **[docs/transformations/](docs/transformations/)** - Individual transformation records (T-YYYYMMDD-###)

## 🛠️ Technology Stack

- **Platform**: Obsidian Plugin (Desktop + Mobile)
  - Desktop: Windows, macOS, Linux
  - Mobile: Android 7.0+, iOS 14.0+
- **Language**: TypeScript
- **UI Framework**: React (Desktop), Native Obsidian Components (Mobile)
- **AI Integration**: Claude 3.5 Sonnet (primary), extensible to GPT/Gemini
- **Build Tool**: esbuild
- **Testing**: Vitest
- **i18n**: Korean + English
- **Mobile-Specific**: Voice input, offline queue, photo capture

## 🚀 Getting Started (For Developers)

### Prerequisites
- Node.js 18+
- Obsidian 1.4.0+

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/WriteAlive.git
cd WriteAlive

# Install dependencies
npm install

# Build plugin
npm run build

# Development mode (watch)
npm run dev
```

### Testing in Obsidian
1. Build the plugin (creates the following files):
   - `main.js` - Plugin code
   - `manifest.json` - Plugin metadata
   - `styles.css` - Plugin styles
2. Copy these 3 files to `.obsidian/plugins/writealive/` in your test vault
3. Enable "WriteAlive" in Obsidian Settings → Community Plugins
4. Configure AI API key in plugin settings

**Note**: Only these 3 files are needed for the plugin to work in Obsidian.

## 🚀 Quick Start

### Accessing WriteAlive Commands

**Two Ways to Access**:

1. **🌱 Ribbon Button (Visual Entry Point)**
   - Look for the 🌱 icon in the left sidebar
   - **Left-click**: Opens Gather Seeds (most common action)
   - **Right-click**: Shows menu with all commands:
     - 🌱 Gather Seeds
     - 💡 Suggest Next Steps
     - 📊 Create Snapshot
     - 📂 List Snapshots
     - ⏮️ Restore Latest Snapshot

2. **⌨️ Command Palette (Keyboard Access)**
   - Press `Cmd+P` (Mac) or `Ctrl+P` (Windows/Linux)
   - Type "WriteAlive" to see all commands
   - Select any command to run

**Tip**: Use ribbon button for quick mouse access, command palette for keyboard-centric workflow!

## 📖 Usage Example

### Method 1: Seed Gathering (Spontaneous Ideas)

**Weekend - Mobile + Desktop Workflow**:

📱 **Saturday Morning** (Subway, reading on phone):
- See inspiring quote in book
- Open Obsidian Mobile → Tap "Quick Seed"
- Snap photo of page + speak: "Alexander centers concept"
- Auto-tagged: `#seed #reading` → Saved in 5 seconds

📱 **Saturday Afternoon** (Coffee shop, watching video):
- Hear Bill Evans quote
- Quick note: "Truth over approximation" `#idea #practice`
- Offline mode → Queued for sync

📱 **Sunday Morning** (Walk in park):
- Observe trees growing → Voice memo
- "나무는 줄기에서 바깥으로 자란다" `#씨앗 #자연관찰`

💻 **Sunday Evening** (Desktop, ready to write):
1. All 3 mobile seeds synced automatically
2. Command: `WriteAlive: Gather Seeds`
3. Finds all seeds (even Korean `#씨앗` + photos!)
4. Select seeds → AI suggests centers → 30 min → 600-word draft

**Settings**: Configured tags: `seed, idea, 씨앗, 💡`
**Cross-Device**: Seeds captured on mobile available instantly on desktop

### Method 2: MOC Integration (Structured Knowledge)

**Existing MOC**: "Creativity and Practice.md"
```markdown
---
writealive:
  auto_gather_seeds: true
  seed_tags: [creativity, practice, 창의성]
  update_frequency: daily
---

# Creativity and Practice

## Foundational Concepts (Manual)
- [[Christopher Alexander - Centers]]
- [[Bill Evans - Truth over Approximation]]

## Recent Seeds (Auto-updated)
<!-- BEGIN WRITEALIVE-AUTO -->
- [[2025-11-01]] - "Alexander: centers" #creativity #seed
- [[2025-11-02]] - "Evans: truth" #practice #idea
- [[2025-11-03]] - "자연스러운 성장" #창의성 #씨앗
<!-- END WRITEALIVE-AUTO -->
```

**What happened automatically**:
- Monday-Wednesday: User creates 3 notes with relevant tags
- WriteAlive detects matches and updates AUTO section
- Thursday notification: "3 new seeds for 'Creativity' MOC"

**Ready to write**:
1. Command: `WriteAlive: Start from MOC`
2. Select "Creativity and Practice"
3. All manual links + auto-gathered seeds pulled in
4. AI: "Your MOC has grown this week. I notice bilingual themes..."

**Key Benefit**: MOC stays current automatically. Zero manual organization.

## 🗺️ Roadmap

### Phase 0: Foundation (Week 1) - Current
- [x] PRD and technical design
- [ ] Project scaffold
- [ ] Settings UI with API key encryption

### Phase 1: AI Infrastructure (Week 2-3)
- [ ] Seed gathering with custom/multiple tag support
- [ ] **Mobile quick capture UI** (voice + photo + text)
- [ ] MOC detection and parsing
- [ ] Living MOC auto-update system
- [ ] **Offline queue and sync**
- [ ] Center finding logic (desktop only)
- [ ] Wholeness analysis (desktop only)

### Phase 2: User Interface (Week 4-5)
- [ ] Command palette integration
- [ ] Seed selection modal
- [ ] MOC selection modal
- [ ] Center highlighting

### Phase 3: Refinement (Week 6-7)
- [ ] Expansion prompts
- [ ] Read-aloud feedback
- [ ] i18n (Korean/English)

### Phase 4: Release (Week 8-9)
- [ ] Testing and QA
- [ ] Documentation
- [ ] Obsidian community plugin submission

**See [PLAN.md](PLAN.md) for detailed transformation breakdown.**

## 🤝 Contributing

This project follows **Transformation-Centered Development** principles:

1. All changes are **Transformations** (T-YYYYMMDD-###)
2. Each transformation enhances **structural life**, not just adds features
3. Small, testable improvements with clear acceptance criteria
4. Living documentation that evolves with code

See [CLAUDE.md](CLAUDE.md) for development guidelines.

## 📄 License

MIT License - See [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- **June Kim (김창준)** - Creator of Saligo Writing (살리고 글쓰기) methodology
- **Christopher Alexander** - "The Nature of Order" concepts: Wholeness, Centers, Generative Sequence
- **Bill Evans** - Practice philosophy: truth over approximation, step-by-step mastery
- **Obsidian Community** - Platform and plugin ecosystem

## 📬 Contact

- **Issues**: [GitHub Issues](https://github.com/blcktgr73/WritingAlive/issues)
- **Discussions**: [GitHub Discussions](https://github.com/blcktgr73/WritingAlive/discussions)

---

> **살리고 (Saligo)** = "Making Alive" — Not just writing, but bringing ideas to life through structural enhancement.

**Status**: 🚧 Active Development (MVP Phase 0)
**Version**: 0.1.0-alpha
**Last Updated**: 2025-11-01
