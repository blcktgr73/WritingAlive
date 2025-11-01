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

### 🌱 Seed Gathering
- Automatically collect tagged ideas (`#seed`) from your entire vault
- Transform scattered daily observations into writing foundations
- Zero-friction path from "note while reading" to "coherent essay"

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

- **[PRD.md](docs/PRD.md)** - Complete product requirements and user stories
- **[PLAN.md](PLAN.md)** - Technical architecture and implementation roadmap
- **[CLAUDE.md](CLAUDE.md)** - Development philosophy and transformation principles

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

### Weekend Observations → Coherent Essay

**Saturday**: Reading, watching videos, observing nature
```markdown
<!-- In daily/2025-11-01.md -->
"Alexander: strong centers make weak centers stronger" #seed

<!-- In daily/2025-11-02.md -->
"Evans: start small but truthful, not vague approximation" #seed

<!-- In daily/2025-11-02.md -->
"Trees grow from trunk outward, not all at once" #seed
```

**Sunday Evening**: Ready to write
1. Create new note: "On Creative Practice.md"
2. Command: `WriteAlive: Gather Seeds`
3. Select 3 seeds from this weekend
4. AI suggests centers: *"Connection between natural growth and practice?"*
5. 30 minutes → Coherent 600-word draft

**Key Benefit**: Zero manual organization. Ideas → Writing with minimal friction.

## 🗺️ Roadmap

### Phase 0: Foundation (Week 1) - Current
- [x] PRD and technical design
- [ ] Project scaffold
- [ ] Settings UI with API key encryption

### Phase 1: AI Infrastructure (Week 2-3)
- [ ] Seed gathering from vault
- [ ] Center finding logic
- [ ] Wholeness analysis

### Phase 2: User Interface (Week 4-5)
- [ ] Command palette integration
- [ ] Seed selection modal
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
