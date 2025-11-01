# WriteAlive (살리고 글쓰기 도우미)

> **AI-Assisted Writing Tool Based on Christopher Alexander's "Nature of Order"**

WriteAlive is an Obsidian plugin that helps you practice **Saligo Writing (살리고 글쓰기)** — a generative, iterative approach to writing inspired by Christopher Alexander's concepts of Wholeness, Centers, and Generative Sequence, combined with Bill Evans' philosophy of deliberate practice.

## 🌱 Core Philosophy

### The Problem with Traditional Writing
- High energy barrier: Need complete outline before starting
- Ideas scattered across notes never become coherent writing
- Writer's block from facing blank pages
- Rigid structure kills creative discovery

### The Saligo Writing Solution
- **Low energy start**: Begin with a single seed idea
- **Generative growth**: Discover structure through writing, not before
- **Center-based evolution**: Let strong ideas naturally strengthen weak ones
- **Iterative refinement**: Small, truthful steps > vague approximations

### Inspired by Bill Evans' Practice Philosophy
> "Don't approximate the whole vaguely. Take a small part and be entirely true, entirely real, entirely accurate about it."

## ✨ Key Features (MVP)

### 🌱 Seed Gathering & MOC Integration
- **Seed Gathering**: Automatically collect tagged ideas (`#seed`) from your entire vault
- **MOC Integration**: Start writing from your Map of Contents notes
- Transform scattered daily observations OR structured knowledge maps into writing
- Zero-friction path: "note while reading" → "coherent essay"
- Works with existing Zettelkasten, PARA, and other PKM workflows

### 🎯 AI-Assisted Center Discovery
- Identify the strongest "centers" in your writing
- Get suggestions for where your writing naturally wants to grow
- Powered by Claude, GPT, or Gemini

### 🌿 Generative Expansion
- AI suggests multiple directions to develop your ideas
- Choose paths that feel most alive
- Maintain wholeness while growing complexity

### 📊 Wholeness Analysis
- Quantify structural coherence (1-10 scale)
- Track how your writing's "life" improves through iterations
- Visual feedback on document evolution

### 🔄 Version Snapshots
- Save transformation checkpoints
- Compare versions to see structural improvements
- Safe experimentation with rollback capability

### 🎓 Academic Writing Support
- Optional paragraph labeling ([Claim], [Evidence], [Analysis])
- Unity checking for coherent paragraph structure
- Bridge between generative freedom and academic rigor

## 📚 Documentation

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

- **[CLAUDE.md](CLAUDE.md)** - Development Philosophy
  - Transformation-Centered AI Pair Programming principles
  - Generative Sequence-based development loop
  - Coding standards and deliverable structure

### Reference Materials
- **[WriteAlive 개요](docs/WriteAlive-살리고 글쓰기 도우미.md)** - Original concept document (Korean)
- **[Bill Evans - Creative Process](docs/20251101%20Universal%20Mind%20of%20Bill%20Evans%20-%20Creative%20Process%20and%20Self-Teaching.md)** - Practice philosophy inspiration
- **[Bill Evans - 연습 방법](docs/20251101%20성공의%20단계에%20이르는%20빌%20에반스의%20연습%20방법.md)** - Korean summary

## 🛠️ Technology Stack

- **Platform**: Obsidian Plugin
- **Language**: TypeScript
- **UI Framework**: React
- **AI Integration**: Claude 3.5 Sonnet (primary), extensible to GPT/Gemini
- **Build Tool**: esbuild
- **Testing**: Vitest
- **i18n**: Korean + English

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
1. Copy `dist/` contents to `.obsidian/plugins/writealive/` in your test vault
2. Enable "WriteAlive" in Obsidian Settings → Community Plugins
3. Configure AI API key in plugin settings

## 📖 Usage Example

### Method 1: Seed Gathering (Spontaneous Ideas)

**Weekend**: Reading, watching videos, observing nature
```markdown
<!-- In daily/2025-11-01.md -->
"Alexander: strong centers make weak centers stronger" #seed

<!-- In daily/2025-11-02.md -->
"Evans: start small but truthful, not vague approximation" #seed

"Trees grow from trunk outward, not all at once" #seed
```

**Sunday Evening**: Ready to write
1. Command: `WriteAlive: Gather Seeds`
2. Select 3 seeds from this weekend
3. AI suggests centers → 30 min → 600-word draft

### Method 2: MOC Integration (Structured Knowledge)

**Existing MOC**: "Creativity and Practice.md"
```markdown
# Creativity and Practice

## Foundational Concepts
- [[Christopher Alexander - Centers]]
- [[Bill Evans - Truth over Approximation]]

## Personal Observations
- [[2025-10-28 - Reading Nature of Order]]
- [[2025-10-29 - Walk observations]]
```

**Ready to write**:
1. Command: `WriteAlive: Start from MOC`
2. Select "Creativity and Practice"
3. All 7 linked notes pulled in as context
4. AI: "Your MOC has 3 themes. Which to explore first?"

**Key Benefit**: Works with your existing workflow. No reorganization needed.

## 🗺️ Roadmap

### Phase 0: Foundation (Week 1) - Current
- [x] PRD and technical design
- [ ] Project scaffold
- [ ] Settings UI with API key encryption

### Phase 1: AI Infrastructure (Week 2-3)
- [ ] Seed gathering from vault
- [ ] MOC detection and parsing
- [ ] Center finding logic
- [ ] Wholeness analysis

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

- **Kim Changjon (김창준)** - Creator of Saligo Writing methodology
- **Christopher Alexander** - "The Nature of Order" concepts
- **Bill Evans** - Practice philosophy and creative process insights
- **Obsidian Community** - Platform and plugin ecosystem

## 📬 Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/WriteAlive/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/WriteAlive/discussions)

---

> **살리고 (Saligo)** = "Making Alive" — Not just writing, but bringing ideas to life through structural enhancement.

**Status**: 🚧 Active Development (MVP Phase 0)
**Version**: 0.1.0-alpha
**Last Updated**: 2025-11-01
