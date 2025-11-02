# Product Specification: Center Discovery Modal

**Feature ID**: T-011 (Center Discovery UI)
**Status**: Ready for Implementation
**Priority**: P0 (Must Have - Critical User Flow)
**Effort**: Medium (5-8 story points)
**Dependencies**: T-007 (Gather Seeds), T-010 (Center Finding Logic)

---

## Product Vision Summary

The Center Discovery Modal is the pivotal moment in the Saligo Writing workflow where scattered seed notes transform into actionable writing direction. After gathering seeds (T-007), users face the critical question: "Where do I start?" This modal bridges the gap between collection and creation by:

1. **Displaying AI-discovered centers** with clear strength rankings
2. **Explaining why each center matters** in accessible language
3. **Guiding users to the strongest starting point** with confidence
4. **Making costs transparent** to build user trust
5. **Enabling immediate action** with zero-friction transitions to writing

**Design Philosophy**: Transform AI analysis from cryptic data dump into an empowering conversation that says: "Here's what's alive in your ideas. Let's start with the strongest one."

---

## Success Metrics

**Target KPIs** (from PRD US-2.1):
1. **Center Acceptance Rate**: 60%+ of users select a suggested center (strong centers: 75%+)
2. **Time-to-Write**: <2 minutes from viewing centers to writing first sentence
3. **User Confidence**: 85%+ report feeling "clear about where to start"
4. **Cost Transparency**: 100% of users see estimated cost before proceeding
5. **Error Recovery**: <1% of sessions fail due to API errors (graceful fallback)

**Success Criteria** (from PRD):
- 60%+ acceptance rate for Strong Centers (⭐⭐⭐)
- <2 minutes from seeing centers to writing first sentence
- 85% of users proceed to write after viewing centers

---

## Context: Current System State

### What's Complete (T-010)
✅ **Backend Logic**: `AIService.findCentersFromSeeds()` implemented
✅ **AI Integration**: Claude API returns structured `CenterFindingResult`
✅ **Privacy**: Anonymous seed IDs, no file paths sent to AI
✅ **Caching**: 24-hour TTL to prevent duplicate requests
✅ **Rate Limiting**: 60 req/min default via AIService

### Data Structure (from `types.ts`)
```typescript
interface CenterFindingResult {
  centers: DiscoveredCenter[];  // 2-4 centers typically
  centersByStrength: {
    strong: DiscoveredCenter[];   // ⭐⭐⭐
    medium: DiscoveredCenter[];   // ⭐⭐
    weak: DiscoveredCenter[];     // ⭐
  };
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  estimatedCost: number;  // USD
  provider: 'claude' | 'gpt' | 'gemini';
  timestamp: string;
}

interface DiscoveredCenter {
  name: string;              // "Completeness vs Approximation"
  explanation: string;       // 2-3 sentences
  strength: 'strong' | 'medium' | 'weak';
  connectedSeeds: string[];  // Seed IDs that relate to this center
  recommendation?: string;   // Only for strongest center
  confidence: number;        // 0.0-1.0 (derived from strength)
  assessment: {
    crossDomain: boolean;          // Present across multiple contexts?
    emotionalResonance: boolean;   // User expresses feeling?
    hasConcrete: boolean;          // Concrete lived experience?
    structuralPivot: boolean;      // Can expand in multiple directions?
  };
}
```

### Example API Response (from Tutorial)
```json
{
  "centers": [
    {
      "name": "Completeness vs Approximation",
      "explanation": "Core of Bill Evans' philosophy connecting guitar, programming, and natural growth patterns.",
      "strength": "strong",
      "connectedSeeds": ["seed-1", "seed-2", "seed-3", "seed-4"],
      "recommendation": "Start with this center - it's the most alive",
      "confidence": 0.9,
      "assessment": {
        "crossDomain": true,
        "emotionalResonance": true,
        "hasConcrete": true,
        "structuralPivot": true
      }
    }
  ],
  "usage": {
    "promptTokens": 1250,
    "completionTokens": 420,
    "totalTokens": 1670
  },
  "estimatedCost": 0.0153,
  "provider": "claude",
  "timestamp": "2025-11-02T10:30:00Z"
}
```

---

## User Stories

### Epic 2: AI-Assisted Center Discovery (MVP)
**Priority**: P0 (Must Have)

---

### US-2.1.1: View Center Discovery Results

**As a** writer who has gathered seeds
**I want to** see a clear, ranked list of discovered centers
**So that** I can understand which themes emerged from my notes and choose where to start writing

**Acceptance Criteria**:
1. Modal opens automatically after `findCentersFromSeeds()` completes
2. Title: "🎯 Centers Discovered" with seed count context
3. Centers displayed in **strength order**:
   - Strong Centers (⭐⭐⭐) first
   - Medium Centers (⭐⭐) second
   - Weak Centers (⭐) last (optional toggle)
4. Each center card shows:
   - Star rating visual (⭐⭐⭐, ⭐⭐, or ⭐)
   - Center name as heading (bold, 18-20px)
   - Explanation text (readable, 14-16px)
   - Connected seeds count (e.g., "Connects 4 seeds")
   - Recommendation tag (only for strongest center): "💡 Start Here"
5. Visual hierarchy: Strongest center visually dominant (larger, highlighted)
6. No centers case: Clear message with guidance
7. Error case: Graceful fallback with retry option

**UI Wireframe** (Text):
```
┌─────────────────────────────────────────────────┐
│ 🎯 Centers Discovered (from 4 seeds)        [X] │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ⭐⭐⭐ STRONG CENTER                     │   │
│  │ 💡 Start Here - Most Alive               │   │
│  ├─────────────────────────────────────────┤   │
│  │ "Completeness vs Approximation"          │   │
│  │                                           │   │
│  │ Core of Bill Evans' philosophy.          │   │
│  │ Connects guitar, programming, and        │   │
│  │ natural growth patterns.                 │   │
│  │                                           │   │
│  │ 🔗 Connects 4 seeds                      │   │
│  │ [Start Writing] [Learn More]             │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ⭐⭐ MEDIUM CENTER                       │   │
│  ├─────────────────────────────────────────┤   │
│  │ "Part to Whole Growth"                   │   │
│  │                                           │   │
│  │ Tree metaphor reinforces practice        │   │
│  │ pattern of building from foundations.    │   │
│  │                                           │   │
│  │ 🔗 Connects 2 seeds                      │   │
│  │ [Start Writing] [Learn More]             │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Show Weak Centers (1)] ▼                     │
│                                                 │
├─────────────────────────────────────────────────┤
│ 💰 Cost: $0.015 | Tokens: 1670 | Claude 3.5    │
│ [Cancel] [Save Centers to Note]                │
└─────────────────────────────────────────────────┘
```

**Measurement**:
- Track which center users select (strong > medium > weak distribution)
- Measure time from modal open to action (target: <30 seconds for 80% of users)

---

### US-2.1.2: Select Center and Start Writing

**As a** writer viewing discovered centers
**I want to** select a center and immediately start writing about it
**So that** I can maintain momentum and avoid blank-page anxiety

**Acceptance Criteria**:
1. Each center card has "Start Writing" button (primary CTA)
2. Clicking "Start Writing" on a center:
   - Creates new note OR inserts into current note (user chooses)
   - Note title: Auto-generated from center name (e.g., "Completeness vs Approximation - 2025-11-02")
   - Frontmatter includes:
     ```yaml
     writealive:
       gathered_seeds: ["seed-1", "seed-2", ...]
       selected_center:
         name: "Completeness vs Approximation"
         strength: "strong"
         connectedSeeds: ["seed-1", "seed-2", ...]
       gathered_at: "2025-11-02T10:30:00Z"
     ```
   - Initial content includes:
     - Center name as H1
     - Explanation as blockquote
     - Empty paragraph with cursor positioned: "What does this center mean to me?"
   - Seeds shown as reference at bottom (collapsible)
3. Modal closes after note creation
4. New note opens in active pane
5. User sees immediate writing prompt (not blank page)
6. Success notification: "Started writing from '[Center Name]'"

**Generated Note Example**:
```markdown
---
writealive:
  gathered_seeds:
    - "daily/2025-11-04-subway-note.md"
    - "daily/2025-11-05-lunch-idea.md"
    - "daily/2025-11-06-meeting-thought.md"
    - "daily/2025-11-07-park-walk.md"
  selected_center:
    name: "Completeness vs Approximation"
    strength: "strong"
    connectedSeeds: ["seed-1", "seed-2", "seed-3", "seed-4"]
  gathered_at: "2025-11-02T10:30:00Z"
---

# Completeness vs Approximation

> Core of Bill Evans' philosophy. This center connects guitar practice, programming, and natural growth patterns. It appears across all your seeds with strong emotional resonance.

What does this center mean to me?

[Cursor positioned here]




---
## Gathered Seeds (Reference)

> "Don't approximate the whole vaguely" was shocking.
> — [[2025-11-04-subway-note]]

> When I practiced guitar yesterday, I practiced only the first 4 bars perfectly.
> — [[2025-11-05-lunch-idea]]

> Writing one small function properly is better than roughing out the whole structure
> — [[2025-11-06-meeting-thought]]

> Trees grow from trunk to branches. Shouldn't writing work the same way?
> — [[2025-11-07-park-walk]]
```

**Measurement**:
- Track creation success rate (target: 99%+)
- Measure time from "Start Writing" click to first typed character (target: <10 seconds)
- Survey: "Did the initial prompt help you start writing?" (target: 85% yes)

---

### US-2.1.3: Understand Center Assessment

**As a** writer curious about AI reasoning
**I want to** see why the AI considers a center strong/medium/weak
**So that** I can learn to identify centers myself and make informed choices

**Acceptance Criteria**:
1. Each center card has "Learn More" button (secondary action)
2. Clicking "Learn More" expands card to show assessment criteria:
   ```
   Why is this a Strong Center?
   ✅ Cross-Domain: Present across music, code, and nature contexts
   ✅ Emotional: User expressed surprise ("shocking", "realized")
   ✅ Concrete: User has lived experiences (guitar practice, code review)
   ✅ Structural: Can expand into stories, metaphors, and principles
   ```
3. Each criterion shows:
   - ✅ (green check) if present
   - ⚠️ (yellow warning) if partial
   - ❌ (gray X) if absent
4. Tooltip on criterion names explains Saligo Writing concept
5. Can collapse back to summary view
6. Connected seeds are listed with links to original notes
7. Educational tone: Teaches methodology, not just data dump

**Expanded View Example**:
```
┌─────────────────────────────────────────────┐
│ ⭐⭐⭐ STRONG CENTER                        │
│ "Completeness vs Approximation"             │
├─────────────────────────────────────────────┤
│ Core of Bill Evans' philosophy. Connects    │
│ guitar, programming, and natural growth.    │
│                                             │
│ Why is this a Strong Center?               │
│ ✅ Cross-Domain: Present across music,      │
│    code, and nature contexts                │
│ ✅ Emotional: User expressed surprise       │
│ ✅ Concrete: User has lived experiences     │
│ ✅ Structural: Can expand in multiple ways  │
│                                             │
│ Connected Seeds:                            │
│ • [[2025-11-04-subway-note]] (Bill Evans)  │
│ • [[2025-11-05-lunch-idea]] (guitar)       │
│ • [[2025-11-06-meeting-thought]] (code)    │
│ • [[2025-11-07-park-walk]] (tree photo)    │
│                                             │
│ [Collapse] [Start Writing]                 │
└─────────────────────────────────────────────┘
```

**Measurement**:
- Track "Learn More" click rate (indicates user curiosity)
- Survey: "Did the assessment help you understand centers?" (target: 75% yes)
- Longitudinal: Users who click "Learn More" have 20% higher manual center identification rate after 2 weeks

---

### US-2.1.4: Handle Edge Cases

**As a** user in edge case scenarios
**I want** clear feedback and guidance
**So that** I can proceed confidently even when things don't go as expected

**Acceptance Criteria**:

**Edge Case 1: No Strong Centers (only weak/medium)**
```
┌─────────────────────────────────────────────┐
│ 🎯 Centers Discovered (from 4 seeds)        │
├─────────────────────────────────────────────┤
│ ⚠️ No Strong Centers Found                  │
│                                             │
│ The AI found some potential themes, but     │
│ they don't cross multiple contexts yet.     │
│                                             │
│ You can:                                    │
│ • Start with a Medium Center below          │
│ • Gather more seeds to strengthen themes    │
│ • Write freely and find centers later       │
│                                             │
│ [Medium Centers (2)] ▼                      │
└─────────────────────────────────────────────┘
```

**Edge Case 2: API Error (Rate Limit Exceeded)**
```
┌─────────────────────────────────────────────┐
│ 🎯 Center Discovery Paused                  │
├─────────────────────────────────────────────┤
│ ❌ Rate Limit Reached                       │
│                                             │
│ You've reached your hourly API limit        │
│ (100 requests/hour). This protects your     │
│ API costs.                                  │
│                                             │
│ Retry in: 42 minutes                        │
│                                             │
│ Meanwhile:                                  │
│ • Review your gathered seeds                │
│ • Start writing without AI guidance         │
│ • Adjust rate limits in Settings            │
│                                             │
│ [View Seeds] [Close]                        │
└─────────────────────────────────────────────┘
```

**Edge Case 3: Insufficient Seeds (<2)**
```
┌─────────────────────────────────────────────┐
│ 🎯 Not Enough Seeds Yet                     │
├─────────────────────────────────────────────┤
│ ⚠️ Need at least 2 seeds to find centers    │
│                                             │
│ You currently have 1 seed. Add at least     │
│ one more seed note to discover centers.     │
│                                             │
│ Tips:                                       │
│ • Tag notes with #seed or #idea             │
│ • Capture fleeting thoughts throughout day  │
│ • Include concrete observations and moments │
│                                             │
│ [Gather More Seeds] [Start Writing Anyway]  │
└─────────────────────────────────────────────┘
```

**Edge Case 4: JSON Parsing Failure (AI response malformed)**
```
┌─────────────────────────────────────────────┐
│ 🎯 Centers Analysis Incomplete              │
├─────────────────────────────────────────────┤
│ ⚠️ AI Response Format Error                 │
│                                             │
│ The AI returned an unexpected format.       │
│ This is a temporary issue.                  │
│                                             │
│ You can:                                    │
│ • Retry center discovery (no extra cost)    │
│ • Contact support if problem persists       │
│ • Start writing without AI guidance         │
│                                             │
│ Error Code: INVALID_RESPONSE                │
│                                             │
│ [Retry] [Report Issue] [Write Anyway]       │
└─────────────────────────────────────────────┘
```

**Measurement**:
- Track edge case frequency (target: <5% of sessions)
- Measure recovery rate (target: 80% of users retry successfully or proceed with alternative)
- Survey error message clarity (target: 90% understand next steps)

---

### US-2.1.5: Cost Transparency

**As a** cost-conscious user
**I want to** see estimated API costs clearly displayed
**So that** I can make informed decisions about when to use AI features

**Acceptance Criteria**:
1. Cost footer always visible at bottom of modal
2. Display format: `💰 Cost: $0.015 | Tokens: 1670 | Claude 3.5`
3. Breakdown on hover/click:
   - Prompt tokens: 1250 ($0.003)
   - Completion tokens: 420 ($0.012)
   - Total tokens: 1670
   - Provider: Claude 3.5 Sonnet
4. Cost in USD (formatted to 3-4 decimal places)
5. Link to "Understanding API Costs" help doc
6. Cached requests show: `✅ Cached (no cost)` instead
7. Settings link: "Manage API Limits"

**Cost Footer UI**:
```
├─────────────────────────────────────────────────┤
│ 💰 This analysis cost $0.015 (1670 tokens)      │
│ Provider: Claude 3.5 Sonnet                     │
│ [Cost Breakdown ▼] [Manage Limits]              │
└─────────────────────────────────────────────────┘
```

**Expanded Breakdown**:
```
┌─────────────────────────────────────────────┐
│ Cost Breakdown                              │
├─────────────────────────────────────────────┤
│ Input Tokens:  1250 × $0.003 = $0.003      │
│ Output Tokens:  420 × $0.030 = $0.012      │
│ ───────────────────────────────────────────│
│ Total:                          $0.015      │
│                                             │
│ Your monthly spend: $0.42 / $5.00 (8%)     │
│                                             │
│ [Learn About API Costs] [OK]               │
└─────────────────────────────────────────────┘
```

**Measurement**:
- Track cost acknowledgment (did user view cost before proceeding?)
- Survey: "Do you feel informed about API costs?" (target: 95% yes)
- Monitor cost-related support requests (target: <1% of users)

---

## UI/UX Requirements

### Layout & Visual Design

**Modal Dimensions**:
- Width: 700px (desktop), 95vw (mobile, max 500px)
- Height: Auto, max 85vh (scrollable)
- Positioning: Centered overlay with dimmed backdrop

**Visual Hierarchy**:
1. **Strong Centers**:
   - Larger card (120% size of medium)
   - Gold/yellow highlight border (2px, #FFD700)
   - "💡 Start Here" badge in top-right corner
   - Drop shadow for depth (box-shadow: 0 4px 12px rgba(0,0,0,0.15))
2. **Medium Centers**:
   - Standard size
   - Blue-gray border (1px, #718096)
   - No special badge
3. **Weak Centers**:
   - Collapsed by default (show toggle: "Show Weak Centers (N)")
   - Lighter background (opacity: 0.8)
   - Gray border (1px, #CBD5E0)

**Color Palette**:
- Strong: Gold accent (#FFD700)
- Medium: Blue-gray (#718096)
- Weak: Light gray (#E2E8F0)
- Background: Theme-aware (light: #FFFFFF, dark: #1A202C)
- Text: Theme-aware (light: #2D3748, dark: #E2E8F0)

**Typography**:
- Modal title: 24px, bold, sans-serif
- Center name: 18px, bold, sans-serif
- Explanation: 14px, regular, line-height 1.6
- Metadata: 12px, regular, uppercase, letter-spacing: 0.5px

**Spacing**:
- Modal padding: 24px
- Card margin: 16px between cards
- Internal card padding: 20px
- Button spacing: 8px gap

### Interactions & Animations

**Entry Animation**:
- Fade in backdrop (200ms ease-out)
- Scale modal from 95% to 100% (300ms ease-out)
- Centers fade in sequentially (100ms delay between each)

**Hover States**:
- Center card: Lift shadow (transform: translateY(-2px))
- Buttons: Brightness increase (110%)
- "Learn More": Underline appears

**Click Feedback**:
- Button: Scale down slightly (95%) on active state
- Ripple effect on "Start Writing" button

**Loading State** (during AI request):
```
┌─────────────────────────────────────────────┐
│ 🎯 Discovering Centers...                   │
├─────────────────────────────────────────────┤
│                                             │
│        [Animated spinner]                   │
│                                             │
│    Analyzing 4 seeds with Claude AI...     │
│                                             │
│    Estimated time: 3-5 seconds              │
│    Estimated cost: $0.01-0.02               │
│                                             │
└─────────────────────────────────────────────┘
```

**Success Animation** (note creation):
- Checkmark animation (green ✓ growing from small to large)
- "Created: [Note Name]" notification (3 seconds, then fade)

### Keyboard Navigation

**Shortcuts**:
- `Tab`: Cycle through center cards and buttons
- `Enter`: Activate focused button
- `Esc`: Close modal
- `1`, `2`, `3`: Quick-select first/second/third center
- `↓` / `↑`: Navigate between centers
- `Space`: Toggle "Learn More" on focused center

**Accessibility**:
- Focus indicators: 2px outline, theme-aware color
- Screen reader labels: Full center description + strength rating
- ARIA landmarks: `role="dialog"`, `aria-labelledby="modal-title"`

### Mobile Optimizations

**Responsive Breakpoints**:
- Desktop (>900px): Standard layout
- Tablet (600-900px): Single column, full width cards
- Mobile (<600px): Simplified layout, stacked buttons

**Touch Interactions**:
- Tap target size: Minimum 44x44px (WCAG 2.1 Level AAA)
- Swipe: Dismiss modal by swiping down from top
- Pull-to-refresh: Retry center discovery

**Mobile-Specific UI Changes**:
- Modal fills 95% of screen height
- Footer becomes sticky at bottom
- "Learn More" opens as bottom sheet (not inline expansion)
- Buttons stack vertically (not side-by-side)

---

## Edge Cases & Error Handling

### Scenario Matrix

| Scenario | Detection | User Feedback | Recovery Options |
|----------|-----------|---------------|------------------|
| **No seeds** | `seeds.length === 0` | "No seeds found. Add notes with #seed tag." | [Gather Seeds] [Learn About Seeds] |
| **Insufficient seeds (<2)** | `seeds.length < 2` | "Need at least 2 seeds to find centers." | [Gather More Seeds] [Write Anyway] |
| **No centers found** | `centers.length === 0` | "No clear centers yet. Try gathering more seeds." | [Add More Seeds] [Write Freely] |
| **Only weak centers** | `strong.length === 0 && medium.length === 0` | "Only weak centers found. Consider more seeds." | [Show Weak Centers] [Write Anyway] |
| **API rate limit** | `AIServiceError: RATE_LIMIT_EXCEEDED` | "Rate limit reached. Retry in [X] minutes." | [View Seeds] [Write Without AI] [Settings] |
| **API key invalid** | `AIServiceError: INVALID_API_KEY` | "API key invalid. Please check settings." | [Open Settings] [Learn About API Keys] |
| **Network error** | `AIServiceError: NETWORK_ERROR` | "Connection failed. Check your internet." | [Retry] [Write Offline] |
| **Timeout (>10s)** | `AIServiceError: TIMEOUT` | "AI took too long to respond. Try again?" | [Retry] [Use Cached] [Write Anyway] |
| **Malformed response** | `AIServiceError: INVALID_RESPONSE` | "AI response format error. Retry or report." | [Retry] [Report Bug] [Write Anyway] |
| **Cached result** | Check cache hit | "✅ Using cached analysis (no cost)" | [Use Cached] [Force Refresh] |
| **Quota exceeded** | `AIServiceError: QUOTA_EXCEEDED` | "Monthly quota exceeded. Upgrade or wait." | [View Usage] [Upgrade Plan] [Write Anyway] |

### Error Recovery Flow

1. **Detect Error**: AIService throws specific error type
2. **Log Locally**: Store error in plugin log (help with support)
3. **Show User-Friendly Message**: Translate error code to actionable guidance
4. **Offer Alternatives**: Always provide 2-3 next steps
5. **Enable Retry**: If transient error, allow immediate retry with backoff
6. **Track Metrics**: Log error frequency for monitoring

### Fallback Strategy

If AI center discovery fails completely:
```
┌─────────────────────────────────────────────┐
│ 🎯 Center Discovery Unavailable             │
├─────────────────────────────────────────────┤
│ AI analysis couldn't complete.              │
│                                             │
│ You can still start writing:               │
│ 1. Review your seeds below                  │
│ 2. Pick one that resonates emotionally      │
│ 3. Start with 1-2 sentences about it        │
│                                             │
│ [View Seeds (4)] [Start Writing Anyway]     │
└─────────────────────────────────────────────┘
```

**Degraded Mode**: Show gathered seeds list as fallback UI

---

## Technical Architecture

### Component Structure

```
CenterDiscoveryModal (Modal)
├── CenterDiscoveryHeader
│   ├── Title with seed count
│   └── Close button
├── CenterCardList
│   ├── StrongCentersSection
│   │   └── CenterCard[] (strong)
│   ├── MediumCentersSection
│   │   └── CenterCard[] (medium)
│   └── WeakCentersToggle
│       └── CenterCard[] (weak, collapsed by default)
├── CenterCard (per center)
│   ├── StrengthBadge (⭐⭐⭐)
│   ├── RecommendationBadge ("💡 Start Here") [if strongest]
│   ├── CenterName (heading)
│   ├── Explanation (text)
│   ├── ConnectedSeedsCount
│   ├── ActionButtons
│   │   ├── StartWritingButton (primary CTA)
│   │   └── LearnMoreButton (secondary)
│   └── ExpandedAssessment [if "Learn More" clicked]
│       ├── AssessmentCriteria (cross-domain, emotional, concrete, pivot)
│       └── ConnectedSeedsList (links to original notes)
└── CostFooter
    ├── CostSummary (tokens, USD, provider)
    └── ExpandedCostBreakdown [on click]
```

### Data Flow

```
1. User completes "Gather Seeds" flow (T-007)
   ↓
2. Plugin calls AIService.findCentersFromSeeds(seeds)
   ↓
3. AIService → ClaudeProvider → Claude API
   ↓
4. CenterFindingResult returned (cached 24h)
   ↓
5. Plugin instantiates CenterDiscoveryModal
   ↓
6. Modal renders centers by strength
   ↓
7. User clicks "Start Writing" on a center
   ↓
8. Modal calls createDocumentFromCenter()
   ↓
9. New note created with frontmatter + initial prompt
   ↓
10. Modal closes, new note opens, user starts writing
```

### State Management

```typescript
interface ModalState {
  // Data from AI
  result: CenterFindingResult | null;

  // UI state
  isLoading: boolean;
  error: AIServiceError | null;
  showWeakCenters: boolean;
  expandedCenters: Set<string>;  // Center IDs with "Learn More" open

  // User interaction
  hoveredCenter: string | null;
  selectedCenter: string | null;  // For keyboard navigation

  // Cost breakdown visibility
  showCostBreakdown: boolean;
}
```

### Integration Points

**With T-007 (Gather Seeds)**:
- Triggered after user selects seeds and clicks "Find Centers"
- Receives `SeedNote[]` array from GatherSeedsModal
- Can be re-invoked if user wants to analyze different seeds

**With T-010 (Center Finding Logic)**:
- Calls `AIService.findCentersFromSeeds(seeds)`
- Handles all `AIServiceError` types
- Respects rate limiting and caching

**With Document Creation**:
- Creates new markdown file with frontmatter
- Populates initial content structure
- Opens file in active pane
- Positions cursor for writing

**With Settings**:
- Respects user's AI provider preference
- Uses configured API key (decrypted at runtime)
- Honors rate limit settings
- Applies cost warning thresholds

---

## Implementation Checklist

### Phase 1: Core Modal (MVP)
- [ ] Create `src/ui/center-discovery-modal.ts`
- [ ] Implement `CenterDiscoveryModal` class extending Obsidian `Modal`
- [ ] Render center cards with strength ranking
- [ ] Display center name, explanation, and connected seeds count
- [ ] Implement "Start Writing" action (create note with center)
- [ ] Show cost footer with token usage
- [ ] Handle loading state during AI request
- [ ] Handle error states (no centers, API errors)
- [ ] Add "Cancel" and "Save Centers to Note" buttons
- [ ] Test on desktop (Obsidian 1.4.0+)

### Phase 2: Enhanced Interactions
- [ ] Implement "Learn More" expansion (show assessment criteria)
- [ ] Add "Show Weak Centers" toggle
- [ ] Implement keyboard navigation (Tab, Enter, Esc, 1/2/3)
- [ ] Add entry/exit animations
- [ ] Implement hover states and click feedback
- [ ] Add success animation on note creation
- [ ] Test with screen reader (accessibility)

### Phase 3: Edge Cases & Polish
- [ ] Handle all error scenarios (rate limit, network, invalid response)
- [ ] Implement retry logic with exponential backoff
- [ ] Add cached result indicator ("✅ Using cached analysis")
- [ ] Implement cost breakdown expansion
- [ ] Add "Report Issue" functionality
- [ ] Test with 0 seeds, 1 seed, 10+ seeds
- [ ] Test with only weak centers
- [ ] Test with malformed AI response

### Phase 4: Mobile Optimization
- [ ] Responsive layout for tablet (600-900px)
- [ ] Mobile layout (<600px)
- [ ] Touch-optimized interactions (44x44px tap targets)
- [ ] Bottom sheet for "Learn More" on mobile
- [ ] Sticky cost footer on mobile
- [ ] Test on Obsidian Mobile (iOS + Android)

### Phase 5: Documentation & Metrics
- [ ] Add JSDoc comments to all methods
- [ ] Write user guide: "Understanding Center Discovery"
- [ ] Create tutorial: "From Seeds to Centers to Writing"
- [ ] Implement analytics tracking (acceptance rate, time-to-write)
- [ ] Add error tracking (frequency, recovery rate)
- [ ] Update TRANSFORMATIONS.md with T-011 entry

---

## Open Questions

### Product Decisions Needed

1. **Center Dismissal**:
   - Q: Should users be able to permanently dismiss a center?
   - Options:
     - A) Yes, with "Dismiss" button → Center hidden forever
     - B) Yes, but show "Restore dismissed" option
     - C) No, centers always available in history
   - **Recommendation**: Option B (dismissible with restore)

2. **Multiple Center Selection**:
   - Q: Can users select multiple centers to combine?
   - Options:
     - A) No, one center per writing session (MVP)
     - B) Yes, "Start Writing with 2 Centers" option
     - C) Yes, but only for experienced users (setting)
   - **Recommendation**: Option A for MVP, Option B post-MVP

3. **Center History**:
   - Q: Should plugin remember previously discovered centers?
   - Options:
     - A) No, centers exist only during modal session
     - B) Yes, stored in frontmatter of created notes
     - C) Yes, global history across all notes
   - **Recommendation**: Option B (stored in note frontmatter)

4. **AI Provider Choice in Modal**:
   - Q: Should users be able to switch AI provider within modal?
   - Options:
     - A) No, use global setting only
     - B) Yes, dropdown in modal header
     - C) Yes, but only if initial request fails
   - **Recommendation**: Option A for MVP (simplicity)

5. **Export Options**:
   - Q: What does "Save Centers to Note" do?
   - Options:
     - A) Creates note with all centers listed (no initial prompt)
     - B) Copies centers to clipboard (markdown format)
     - C) Both options available
   - **Recommendation**: Option A (create reference note)

### Technical Questions

6. **Caching Granularity**:
   - Q: Cache by seed combination or by individual seeds?
   - Current: By seed combination (unique set)
   - Alternative: By individual seeds (more cache hits but less accurate)
   - **Recommendation**: Keep current (seed combination)

7. **Retry Strategy**:
   - Q: How many retry attempts before giving up?
   - Options:
     - A) 1 retry (user can manually retry again)
     - B) 3 retries with exponential backoff
     - C) Infinite retries until user cancels
   - **Recommendation**: Option A (1 automatic retry, then manual)

8. **Performance Threshold**:
   - Q: What's acceptable latency for modal render?
   - Target: <100ms from AI response to modal display
   - Alternative: Show modal skeleton immediately, populate async
   - **Recommendation**: Show skeleton immediately (better UX)

---

## Success Criteria (Detailed)

### Quantitative Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Center Acceptance Rate (Overall) | 60%+ | Track "Start Writing" clicks / total sessions |
| Strong Center Acceptance Rate | 75%+ | Track "Start Writing" on strong centers |
| Time from Modal Open to Action | <2 min for 85% | Log timestamp: modal open → button click |
| Error Recovery Rate | 80%+ | Track retry success / total errors |
| Cost Transparency Awareness | 95%+ | Survey: "Did you see the cost?" |
| Mobile Usability (Task Completion) | 90%+ | Test: Complete flow on mobile device |
| Accessibility Compliance | WCAG 2.1 AA | Automated + manual testing |

### Qualitative Metrics

**User Surveys** (After 1 week of usage):
1. "The center discovery modal helped me start writing confidently" (1-5 scale)
   - Target: 4.2+ average
2. "I understand why the AI recommended certain centers" (Yes/No/Partially)
   - Target: 85%+ Yes or Partially
3. "The modal feels intuitive and easy to use" (1-5 scale)
   - Target: 4.0+ average
4. "I trust the AI's center recommendations" (1-5 scale)
   - Target: 3.8+ average (trust builds over time)

**A/B Testing Opportunities**:
- Test A: Recommendation badge ("💡 Start Here") vs Test B: No badge
  - Hypothesis: Badge increases strong center selection by 10%+
- Test A: Inline "Learn More" expansion vs Test B: Modal popup
  - Hypothesis: Inline keeps users engaged 15% more

---

## Future Enhancements (Post-MVP)

### Phase 2 Features

1. **Center Evolution Tracking**:
   - Track how centers develop over multiple writing sessions
   - Show "Center Journey": seed → center → paragraph → essay
   - Metric: "This center has grown into 3 essays"

2. **Center Comparison View**:
   - Side-by-side comparison of 2 centers
   - Highlight differences in assessment criteria
   - Help users choose between equally strong centers

3. **Collaborative Center Discovery**:
   - Share centers with advisors or writing partners
   - Comment threads on specific centers
   - Voting: "Which center should I start with?"

4. **Multi-Language Support**:
   - Korean prompts for Korean seeds
   - Bilingual centers (English + Korean)
   - Language detection and auto-translation

5. **Center Strength Prediction** (No API Call):
   - Local heuristics to predict center strength
   - Pre-screen seeds before sending to AI
   - Save costs by filtering weak combinations

### Phase 3 Features

6. **Center Templates**:
   - Pre-built center patterns for common genres
   - Academic writing: Thesis, antithesis, synthesis
   - Personal essays: Experience, reflection, growth

7. **Visual Center Map**:
   - Graph visualization of centers and seed connections
   - Node size = center strength
   - Edges = shared seeds between centers

8. **Center Analytics Dashboard**:
   - "Your Most Productive Centers" (acceptance rate)
   - "Centers You Ignored" (dismissed centers)
   - "Cost Per Center" (efficiency metric)

---

## References

### Related Documents
- [PRD.md](./PRD.md) - US-2.1 (Center Identification), Lines 870-937
- [TRANSFORMATIONS.md](./TRANSFORMATIONS.md) - T-010 (Center Finding Logic), Lines 1047-1308
- [types.ts](../src/services/ai/types.ts) - `CenterFindingResult`, `DiscoveredCenter` types
- [TUTORIAL-EN.md](./TUTORIAL-EN.md) - Real-world center discovery example
- [CLAUDE.md](../CLAUDE.md) - Transformation-Centered methodology

### Design Inspirations
- Obsidian's Quick Switcher modal (keyboard navigation)
- Notion's AI suggestions (inline expansion)
- Linear's command palette (clean, focused design)
- GitHub's PR suggestions (contextual recommendations)

### Technical References
- [Obsidian Modal API](https://docs.obsidian.md/Reference/TypeScript+API/Modal)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design - Dialogs](https://m3.material.io/components/dialogs/overview)

---

## Approval Checklist

- [ ] Product Manager Review: User stories cover all required flows
- [ ] UX Designer Review: Wireframes meet accessibility and usability standards
- [ ] Technical Lead Review: Architecture is feasible and maintainable
- [ ] Saligo Writing Expert Review: Center methodology accurately represented
- [ ] Security Review: No sensitive data exposed (file paths, API keys)
- [ ] Cost Review: API cost transparency meets user expectations

---

**Document Version**: 1.0
**Last Updated**: 2025-11-02
**Author**: Claude (Product Manager Agent)
**Status**: Ready for Transformation T-011 Implementation

---

## Summary for Architect/Developer

**In 60 seconds**:

You're building a modal that shows 2-4 AI-discovered centers after users gather seeds. The modal displays centers ranked by strength (strong ⭐⭐⭐, medium ⭐⭐, weak ⭐). Each center has a name, explanation, and "Start Writing" button that creates a new note with the center as a writing prompt. The modal must handle 11 edge cases gracefully, show API costs transparently, and work on mobile. Strong centers get visual prominence (gold border, "💡 Start Here" badge). Users can expand centers to see assessment criteria (cross-domain, emotional, concrete, structural). Success means 60%+ users select a center and start writing within 2 minutes.

**Key Files**:
- New: `src/ui/center-discovery-modal.ts` (main implementation)
- Reference: `src/ui/gather-seeds-modal.ts` (similar modal structure)
- Data: `src/services/ai/types.ts` (CenterFindingResult, DiscoveredCenter)
- Backend: `src/services/ai/ai-service.ts` (findCentersFromSeeds method)

**Critical UX Principles**:
1. Strongest center is immediately obvious (size + color)
2. Every error has 2+ recovery options (never dead-end)
3. Cost is visible but not scary (transparent, not alarming)
4. Mobile feels native (large targets, swipeable)
5. Keyboard users never reach for mouse (full shortcuts)

Good luck implementing T-011!
