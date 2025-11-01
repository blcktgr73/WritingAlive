# Contributing to WriteAlive

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Obsidian app for testing
- Git

### Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/blcktgr73/writealive.git
cd writealive
```

2. Install dependencies:
```bash
npm install
```

3. Build the plugin:
```bash
npm run build
```

### Development Workflow

#### Watch Mode (Recommended)
For active development with auto-rebuild:
```bash
npm run dev
```

This will watch for file changes and automatically rebuild. You'll need to reload Obsidian to see changes.

#### Testing in Obsidian

1. Create a test vault or use an existing one
2. Create a symlink from the vault's `.obsidian/plugins/writealive` directory to this project directory:

**Windows (PowerShell as Administrator):**
```powershell
New-Item -ItemType SymbolicLink -Path "C:\path\to\vault\.obsidian\plugins\writealive" -Target "C:\Projects\WriteAlive"
```

**macOS/Linux:**
```bash
ln -s /path/to/WriteAlive /path/to/vault/.obsidian/plugins/writealive
```

3. Enable the plugin in Obsidian Settings > Community Plugins

### Code Quality

#### Linting
```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

#### Testing
```bash
npm test              # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

### Project Structure

```
src/
├── main.ts                 # Plugin entry point
├── settings/
│   ├── settings.ts         # Settings data model
│   └── settings-tab.ts     # Settings UI
└── [future directories]
    ├── services/           # Business logic services
    ├── ui/                 # React components
    └── utils/              # Helper functions

tests/
├── unit/                   # Unit tests
└── integration/            # Integration tests (future)
```

### Coding Standards

1. **TypeScript Strict Mode**: All code must pass strict type checking
2. **No `any` types**: Use proper typing or `unknown` with type guards
3. **Type Imports**: Use `import type` for type-only imports
4. **Documentation**: Public APIs must have JSDoc comments
5. **Clean Architecture**: Follow SOLID principles
6. **Testing**: New features must include tests

### Transformation-Centered Development

This project follows the Transformation-Centered methodology from CLAUDE.md:

1. **Define Transformation**: Specify which structural aspect you're improving
2. **Propose Options**: Present 2-3 design alternatives with trade-offs
3. **Implement Incrementally**: Small, focused changes
4. **Test Thoroughly**: Both positive and negative cases
5. **Update Documentation**: Keep docs synchronized

See [CLAUDE.md](./CLAUDE.md) for full methodology.

### Commit Message Format

```
T-YYYYMMDD-###: Brief description

Detailed explanation of changes and rationale.

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Pull Request Process

1. Create a feature branch from `main`
2. Implement your changes following coding standards
3. Ensure all tests pass and linting succeeds
4. Update relevant documentation
5. Submit PR with clear description and link to issue/transformation

### Getting Help

- Review [PRD.md](./docs/PRD.md) for product vision
- Check [PLAN.md](./docs/PLAN.md) for technical architecture
- Read [CLAUDE.md](./CLAUDE.md) for development philosophy
- Open an issue for questions or discussions
