# Section Writing View - Architecture Documentation

## Overview

The **SectionWritingView** is the main writing interface for WriteAlive's Outcome-Driven Writing feature. It provides a focused, section-by-section writing experience with real-time progress tracking, auto-save functionality, and outcome-aware AI assistance.

## Design Principles (SOLID)

### Single Responsibility Principle
- **SectionWritingView**: Handles ONLY writing UI and user interactions
- **OutcomeManager**: Handles ONLY outcome metadata operations
- **SectionManager**: Handles ONLY section state and progress tracking

### Open/Closed Principle
- Extensible through service layer integration (AI suggestions, word counting)
- New features can be added without modifying core view logic
- Configuration through options interface

### Liskov Substitution
- Follows Obsidian Modal contract consistently
- Service dependencies use abstractions (Vault, managers)

### Interface Segregation
- Focused public API: `onOpen()`, `onClose()`
- Clear options interface for initialization
- Callback-based completion notification

### Dependency Inversion
- Depends on service abstractions, not implementations
- Injected dependencies (OutcomeManager, SectionManager)
- No direct file system access (uses Vault)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  SectionWritingView                     │
│                      (Modal)                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Progress Header                       │   │
│  │  "섹션 2/4 (189/400 단어) • 45% 완료"          │   │
│  │  [████████████░░░░░░░░░░░░] 45%                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Section Context                         │   │
│  │  🎯 섹션 2: 잘된 점                            │   │
│  │  목적: 팀 성과 축하 및 임팩트 보여주기        │   │
│  │  💡 작성 프롬프트: ...                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Markdown Editor                         │   │
│  │  [User writes content here...]                  │   │
│  │                                                 │   │
│  │  189 / 400 단어 | 오후 2:34에 자동 저장됨     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [💡 다음 단계 제안] [✅ 완료] [💾 저장]              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                 Section Sidebar                         │
│  ✅ 섹션 1: 요약 (200 단어)                            │
│  ▶️  섹션 2: 잘된 점 (189/400 단어)                    │
│  ⏸️  섹션 3: 도전과제 (0 단어)                         │
│  ⏸️  섹션 4: 교훈 (0 단어)                             │
└─────────────────────────────────────────────────────────┘

         ▲              ▲              ▲
         │              │              │
    OutcomeManager  SectionManager  AIService
```

## Component Structure

### 1. Core Components

#### **SectionWritingView** (Main Modal)
- **Responsibility**: Orchestrate writing session UI
- **State Management**: Centralized `ViewState` object
- **Lifecycle**: `onOpen()` → `renderView()` → `onClose()`

#### **ViewState** (State Management)
```typescript
interface ViewState {
    // Document data
    file: TFile;
    metadata: OutcomeDocumentMetadata;
    outcome: OutcomeDefinition;
    structure: DocumentStructure;

    // Current section
    currentSectionIndex: number;
    currentSection: DocumentSection;
    sectionContent: string;
    wordCount: number;

    // UI state
    isSaving: boolean;
    isSuggestingNextSteps: boolean;
    isValidating: boolean;
    lastSaveTime: Date | null;

    // Auto-save tracking
    isDirty: boolean;
    autoSaveInterval: number | null;
}
```

### 2. UI Components

#### **Progress Header**
- Shows: "섹션 N/M (words/target) • X% 완료"
- Real-time progress bar with color coding:
  - Green: 80%+ complete
  - Yellow: 50-80% complete
  - Red: <50% complete
- Updates on word count change

#### **Section Context**
- Displays: title, purpose, estimate, writing prompt
- Read-only (provides context, not editable)
- Clear visual hierarchy for focus

#### **Markdown Editor**
- Full markdown editing (textarea)
- Real-time word counter (debounced 500ms)
- Auto-save status indicator
- Keyboard shortcuts:
  - `Ctrl/Cmd+S`: Manual save
  - `Ctrl/Cmd+Enter`: Mark complete
  - `Ctrl/Cmd+N`: AI suggestions

#### **Action Buttons**

**[💡 다음 단계 제안]**:
- Triggers outcome-aware AI suggestions
- Shows loading state: "🌿 섹션과 목표 분석 중..."
- Appends suggestions to document

**[✅ 완료]**:
- Validates section (80% words, purpose, outcome)
- Shows validation result with checkmarks
- Moves to next section automatically

**[💾 저장]**:
- Manual save trigger
- Updates last save time
- Shows notification

#### **Section Navigation Sidebar**
- Lists all sections with status:
  - ✅ Completed (show word count)
  - ▶️ In-progress (show current/target)
  - ⏸️ Not started (show "0 단어")
- Click to navigate (with confirmation if dirty)
- Always visible for quick navigation

### 3. Service Layer Integration

#### **OutcomeManager**
- `getOutcome(file)`: Load document metadata
- `updateProgress(file, progress)`: Update frontmatter

#### **SectionManager**
- `startSection(file, sectionId)`: Mark section in-progress
- `completeSection(file, sectionId, content)`: Mark section completed
- `autoSaveSection(file, sectionId, content)`: Auto-save without completion
- `calculateProgress(file)`: Calculate completion percentage

#### **AIService** (Future Integration)
- `generateNextSteps(outcome, section, content)`: Outcome-aware suggestions
- Returns: `AISuggestion[]` with title, direction, rationale, hints

## Key Features

### 1. Word Counting (Markdown-Aware)

The word counter excludes markdown syntax to count only actual content words:

```typescript
// Excluded from count:
- YAML frontmatter (--- ... ---)
- Markdown headers (# ## ###)
- Markdown formatting (** __ * _)
- Links syntax ([text](url)) - keeps link text
- Images (![alt](url))
- Code blocks (``` ```)
- Inline code (` `)
- HTML tags (<tag>)
- List markers (- * + 1.)
```

**Algorithm**: (O(n) complexity)
1. Strip frontmatter
2. Remove code blocks
3. Remove images
4. Extract link text (keep text, remove URL)
5. Remove HTML tags
6. Remove list markers
7. Remove headers (keep header text)
8. Remove formatting markers
9. Split on whitespace
10. Count non-empty words

### 2. Auto-Save Mechanism

**Strategy**: Save every 30 seconds if content changed

```typescript
// Auto-save flow:
1. User types → handleEditorInput()
2. Set isDirty = true
3. Every 30 seconds → saveSection() if isDirty
4. Save via SectionManager.autoSaveSection()
5. Update lastSaveTime, reset isDirty
6. Show "자동 저장됨" notification
```

**Characteristics**:
- Non-blocking (doesn't interrupt typing)
- Silent failures (no error notices for auto-save)
- Preserves cursor position
- Only saves if content changed (dirty flag)

### 3. Section Validation

**Validation Criteria**:
1. **Word Count** (80% minimum)
   - Target: 200 words → Minimum: 160 words
   - Calculated using markdown-aware counter

2. **Purpose Check** (keyword matching)
   - Extracts keywords from section purpose/prompt
   - Content must contain 50%+ of keywords
   - Case-insensitive matching

3. **Outcome Alignment** (keyword matching)
   - Extracts keywords from outcome description
   - Content must contain 30%+ of outcome keywords
   - Ensures section serves document goal

**Validation Result**:
```typescript
interface SectionValidationResult {
    valid: boolean;           // Overall pass/fail
    errors: string[];         // Blockers (fail validation)
    warnings: string[];       // Soft issues (allow completion)
    wordCountMet: boolean;    // 80% minimum
    purposeMet: boolean;      // Section purpose addressed
    outcomeMet: boolean;      // Aligned with outcome
}
```

### 4. Outcome-Aware AI Suggestions

**Prompting Strategy**:
```typescript
const prompt = `
DOCUMENT OUTCOME: "${outcome.description}"
AUDIENCE: "${outcome.audience}"

CURRENT SECTION: "${section.title}"
SECTION PURPOSE: "${section.purpose}"
SECTION PROGRESS: ${currentWords} / ${targetWords} words

CURRENT CONTENT:
${sectionContent}

TASK: Suggest 2-3 next steps that:
1. Continue this section toward completion
2. Serve the overall document outcome
3. Align with section purpose
4. Enable low-energy iteration (Saligo principles)

Identify if content is drifting from outcome and suggest realignment.

FORMAT:
### ⭐⭐⭐ [Title]
**Direction**: [What to write about]
**Why Important**: [How this serves the outcome]
**Content Hints**: [Specific examples/questions]
**Estimated**: +[N] words
`;
```

**Suggestion Structure**:
```typescript
interface AISuggestion {
    title: string;           // "깊이 더하기 - 임팩트 지표 추가"
    direction: string;       // "리더십을 위해 임팩트를 정량화하세요"
    rationale: string;       // "VP는 숫자를 중요하게 생각합니다"
    contentHints: string;    // "• 사용자 참여도 증가?\n• 매출 임팩트?"
    estimatedWords: number;  // 70
    priority: number;        // 1-3 stars
}
```

### 5. Progress Tracking

**Weighted Progress Calculation**:
```typescript
// Progress is weighted by section word estimates, not just section count
// Example: 2/4 sections ≠ 50% if sections have different word counts

For each section:
  - If completed: weight = estimatedWords
  - If in-progress: weight = min(actualWords, estimatedWords)
  - If not-started: weight = 0

Progress % = (total weight / total estimated words) * 100
```

**Real-Time Updates**:
- Word count changes → debounced update (500ms)
- Progress percentage recalculated
- Progress bar and header updated
- Frontmatter metadata updated on save

## State Management Flow

### Initialization Flow
```
onOpen()
  ├─> Load metadata from file
  ├─> Find current section (in-progress or first not-started)
  ├─> Initialize ViewState
  ├─> Mark section as in-progress (if not started)
  ├─> renderView()
  └─> startAutoSave()
```

### Editing Flow
```
User types
  ├─> handleEditorInput()
  ├─> Set isDirty = true
  ├─> Debounced updateWordCount() (500ms)
  │     ├─> Count words (markdown-aware)
  │     ├─> Update state.wordCount
  │     ├─> Update UI (word counter)
  │     └─> Recalculate progress percentage
  └─> Auto-save (every 30s if dirty)
        ├─> saveSection()
        ├─> SectionManager.autoSaveSection()
        ├─> Update lastSaveTime
        └─> Reset isDirty
```

### Completion Flow
```
User clicks [✅ 완료]
  ├─> handleCompleteSection()
  ├─> Validate section
  │     ├─> Check word count (80% minimum)
  │     ├─> Check purpose addressed
  │     └─> Check outcome alignment
  ├─> Show validation result
  ├─> If valid:
  │     ├─> SectionManager.completeSection()
  │     ├─> Update metadata
  │     └─> moveToNextSection()
  │           ├─> Find next incomplete section
  │           ├─> Load section content
  │           ├─> Re-render view
  │           └─> If all complete → showCompletionDialog()
  └─> If invalid:
        └─> Show errors/warnings (stay on section)
```

### Navigation Flow
```
User clicks section in sidebar
  ├─> handleSectionNavigation(sectionId)
  ├─> If isDirty:
  │     ├─> confirmNavigation()
  │     └─> saveSection()
  ├─> Load target section
  ├─> Update currentSectionIndex
  ├─> Mark as in-progress (if not started)
  └─> Re-render view
```

## Performance Considerations

### 1. Efficient Rendering
- **Targeted DOM Updates**: Only update changed elements (word counter, progress bar)
- **Avoid Full Re-renders**: Don't re-render entire view on every keystroke
- **Debounced Operations**:
  - Word counting: 500ms delay
  - Progress updates: Triggered by word count

### 2. Auto-Save Strategy
- **30-Second Interval**: Balance between data safety and performance
- **Dirty Flag**: Only save if content changed
- **Silent Failures**: Don't interrupt user with auto-save errors
- **Efficient Updates**: Use `SectionManager.autoSaveSection()` (partial update)

### 3. Word Counting Optimization
- **O(n) Complexity**: Single pass through content
- **Regex Caching**: Compile regex patterns once
- **Debounced Execution**: Only count after user stops typing (500ms)

## Error Handling

### 1. File System Errors
```typescript
try {
    await this.outcomeManager.getOutcome(file);
} catch (error) {
    console.error('Failed to load metadata:', error);
    new Notice('문서를 열 수 없습니다.');
    this.close();
}
```

### 2. Auto-Save Failures
```typescript
try {
    await this.saveSection();
} catch (error) {
    console.error('Auto-save failed:', error);
    // Silent failure - don't interrupt user
}
```

### 3. AI Service Failures
```typescript
try {
    const suggestions = await this.generateAISuggestions();
} catch (error) {
    console.error('AI suggestions failed:', error);
    new Notice('AI 제안 생성 실패');
}
```

## Testing Strategy

### 1. Unit Tests (31 tests)

**Word Counting Tests** (10 tests):
- Plain text counting
- Markdown syntax exclusion (headers, bold, links, code)
- Edge cases (empty content, whitespace only)

**Section Validation Tests** (7 tests):
- Word count validation (80% minimum)
- Purpose check (keyword matching)
- Outcome alignment check
- Valid/invalid scenarios

**Progress Calculation Tests** (6 tests):
- 0% progress (no sections started)
- Partial progress (in-progress sections)
- 50% progress (half completed)
- 100% progress (all completed)
- Over-writing cap at 100%

**Section Navigation Tests** (4 tests):
- Find in-progress section
- Find first not-started section
- All completed (-1 return)
- No sections started (0 return)

**Keyword Extraction Tests** (4 tests):
- Extract meaningful keywords
- Filter stop words
- Filter short words (<4 chars)
- Remove duplicates

### 2. Integration Testing (Future)
- Full user workflow (open → write → complete → next)
- Auto-save mechanism (30-second intervals)
- AI suggestion integration
- Section navigation with dirty state

## Usage Example

```typescript
import { SectionWritingView } from './ui/views/section-writing-view';
import { OutcomeManager } from './services/outcome/outcome-manager';
import { SectionManager } from './services/outcome/section-manager';

// Initialize services
const outcomeManager = new OutcomeManager(app.vault);
const sectionManager = new SectionManager(app.vault);

// Open writing view
const view = new SectionWritingView(
    app,
    outcomeManager,
    sectionManager,
    {
        file: documentFile,
        language: 'ko',
        onComplete: (file) => {
            console.log('Document completed:', file.path);
            // Navigate to document view or export
        }
    }
);

view.open();
```

## Future Enhancements

### 1. AI Integration
- [ ] Integrate real AIService (replace mock suggestions)
- [ ] Streaming AI responses for suggestions
- [ ] AI-powered section validation

### 2. Advanced Features
- [ ] Section templates (pre-fill common patterns)
- [ ] Export to multiple formats (PDF, Markdown, HTML)
- [ ] Collaborative editing (multi-user sessions)
- [ ] Writing analytics (words per minute, time per section)

### 3. UX Improvements
- [ ] Drag-and-drop section reordering
- [ ] Inline markdown preview toggle
- [ ] Focus mode (hide sidebar and progress)
- [ ] Dark mode optimizations

### 4. Performance
- [ ] Virtual scrolling for large documents (100+ sections)
- [ ] Incremental auto-save (only changed sections)
- [ ] Background sync (IndexedDB cache)

## Dependencies

```
SectionWritingView
├── Obsidian APIs
│   ├── Modal (base class)
│   ├── App (application instance)
│   ├── TFile (file reference)
│   ├── Notice (user notifications)
│   └── Component (markdown rendering)
├── Services
│   ├── OutcomeManager
│   │   ├── getOutcome()
│   │   └── updateProgress()
│   └── SectionManager
│       ├── startSection()
│       ├── completeSection()
│       ├── autoSaveSection()
│       └── calculateProgress()
└── Types
    ├── OutcomeDefinition
    ├── DocumentStructure
    ├── DocumentSection
    └── OutcomeDocumentMetadata
```

## File Locations

```
src/
├── ui/
│   └── views/
│       └── section-writing-view.ts        (1,400+ lines)
├── services/
│   └── outcome/
│       ├── outcome-manager.ts
│       ├── section-manager.ts
│       └── types.ts
styles/
└── section-writing-view.css               (400+ lines)
tests/
└── unit/
    └── section-writing-view.test.ts       (800+ lines, 31 tests)
docs/
└── SECTION-WRITING-VIEW-ARCHITECTURE.md   (this file)
```

## Summary

The **SectionWritingView** is a sophisticated writing interface that:

1. **Follows SOLID Principles**: Clean separation of concerns, dependency injection, focused responsibilities
2. **Provides Rich UX**: Progress tracking, auto-save, AI suggestions, section navigation
3. **Ensures Data Quality**: Markdown-aware word counting, section validation, outcome alignment
4. **Performs Efficiently**: Debounced operations, targeted updates, O(n) algorithms
5. **Handles Errors Gracefully**: Try-catch blocks, user-friendly notices, silent auto-save failures
6. **Is Well-Tested**: 31 unit tests covering word counting, validation, progress calculation

The component serves as the centerpiece of WriteAlive's Outcome-Driven Writing feature, enabling users to write high-quality documents section by section with continuous guidance and progress tracking.
