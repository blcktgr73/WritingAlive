# OutcomeDefinitionModal UI Specification

## Visual Layout

```
╔═══════════════════════════════════════════════════════════════════╗
║  🎯 Define Writing Outcome                                        ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Use Template: [Select template... ▼]                            ║
║                                                                   ║
║  ───────────────────────────────────────────────────────────────  ║
║                                                                   ║
║  What do you want to write? *                                    ║
║  Write a clear and specific goal (50-500 characters)             ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ e.g., "Write a REST API tutorial for beginners"            │ ║
║  │                                                             │ ║
║  │                                                             │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                           125 / 50-500 characters ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ 💡 Good example: "Q4 Product Retrospective covering wins   │ ║
║  │    and lessons for team and VP"                            │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  ───────────────────────────────────────────────────────────────  ║
║                                                                   ║
║  Who will read this?                                             ║
║  Target audience (optional)                                      ║
║  [e.g., "Team members and leadership"                         ]  ║
║                                                                   ║
║  ───────────────────────────────────────────────────────────────  ║
║                                                                   ║
║  What topics to cover?                                           ║
║  Comma-separated list of topics (optional)                       ║
║  [e.g., "wins, challenges, lessons, actions"                  ]  ║
║                                                                   ║
║  ───────────────────────────────────────────────────────────────  ║
║                                                                   ║
║  Document Length                                                 ║
║  Estimated time: Short(10-20min), Medium(30-45min), Long(60min+) ║
║  ┌───────────┐  ┌──────────┐  ┌──────────┐                      ║
║  │ ○ Short   │  │ ● Medium │  │ ○ Long   │                      ║
║  └───────────┘  └──────────┘  └──────────┘                      ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║                                      [Cancel]  [Generate Structure]║
╚═══════════════════════════════════════════════════════════════════╝
```

## State Examples

### 1. Initial State (Empty)

**Description**: Empty, no validation
**Character Count**: `0 / 50-500 characters` (red/error state)
**Generate Button**: Disabled

### 2. Typing State (Too Short)

**Description**: "Q4 Product Retrospective" (22 chars)
**Character Count**: `22 / 50-500 characters` (red/error state)
**Validation**: ❌ Errors: Outcome description too short (22 chars). Minimum: 50 chars.
**Generate Button**: Disabled

### 3. Valid State (Just at Minimum)

**Description**: "Q4 Product Retrospective for engineering team" (51 chars)
**Character Count**: `51 / 50-500 characters` (yellow/warning state - just above minimum)
**Validation**: ⚠️ Warnings: Outcome seems vague. Consider specifying document type.
**Generate Button**: Enabled

### 4. Ideal State (Well-formed)

**Description**: "Q4 Product Retrospective for engineering team covering wins, challenges, and key learnings" (95 chars)
**Character Count**: `95 / 50-500 characters` (green/valid state)
**Validation**: None (clean, no messages shown)
**Generate Button**: Enabled

### 5. Template Selected State

**Template**: "Project Retrospective"
**Description**: Auto-filled from template
**Audience**: "Team members and stakeholders"
**Topics**: "executive summary, wins and achievements, challenges faced, lessons learned"
**Length**: Medium (pre-selected)
**Generate Button**: Enabled

### 6. Loading State (Generating)

**Form**: Dimmed (opacity: 0.5, pointer-events: none)
**Loading Message**: "🎯 AI is generating document structure... (Est. cost: $0.005-0.010)"
**Generate Button**: Disabled, text changes to "🎯 Generating Structure..."

### 7. Validation Error State

**Description**: "Write something about products" (30 chars + vague keyword)
**Character Count**: `30 / 50-500 characters` (red/error)
**Validation Box**:
```
┌─────────────────────────────────────────────────────────────┐
│ ❌ Errors:                                                  │
│   • Outcome description too short (30 chars). Minimum: 50  │
│                                                             │
│ ⚠️ Warnings:                                                │
│   • Contains vague keyword(s): 'something'                 │
│   • Outcome seems vague. Consider specifying document type │
│                                                             │
│ 💡 Suggestions:                                             │
│   • Try: 'Q4 retrospective for team covering wins and      │
│     challenges'                                             │
│   • Try: 'API tutorial for beginners using REST endpoints' │
└─────────────────────────────────────────────────────────────┘
```
**Generate Button**: Disabled

---

## Component Interactions

### Template Selection Flow

```
User selects template from dropdown
  ↓
Modal applies template using TemplateLibrary.applyTemplate()
  ↓
Form fields auto-populate:
  - Description → template.defaultOutcome.description
  - Audience → template.defaultOutcome.audience
  - Topics → template.defaultOutcome.topics (joined with ", ")
  - Length → template.defaultOutcome.lengthPreference
  ↓
Form refreshes to show new values
  ↓
Validation runs automatically
  ↓
Generate button enables if valid
```

### Character Counter Update Flow

```
User types in description textarea
  ↓
handleDescriptionChange() fires on every keystroke
  ↓
Character count calculated: description.length
  ↓
Visual state determined:
  - 0-49 chars → Error (red)
  - 50-59 chars → Warning (yellow)
  - 60-500 chars → Valid (green)
  - 501+ chars → Error (red)
  ↓
Counter updates with color
  ↓
If length > 0: validateCurrentOutcome()
  ↓
Generate button state updates
```

### Generate Structure Flow

```
User clicks "Generate Structure" button
  ↓
Modal validates outcome using OutcomeManager.validateOutcome()
  ↓
If invalid:
  - Show validation errors/warnings
  - Keep modal open
  - Return early
  ↓
If valid:
  - Set isGenerating = true
  - Disable generate button
  - Show loading state (dim form + message)
  ↓
Call options.onGenerate(outcome) callback
  ↓
Parent component handles:
  - StructureGenerator.generateStructure(outcome)
  - Open StructurePreviewModal with result
  ↓
On success: Modal closes
On error: Show error notice, reset loading state
```

---

## Accessibility Features

### ARIA Labels

1. **Description Textarea**
   - `aria-label="Writing outcome"`
   - `aria-required="true"`

2. **Radio Group**
   - `role="radiogroup"`
   - `aria-label="Document length"`

3. **Validation Feedback**
   - `role="alert"`
   - `aria-live="assertive"`

### Keyboard Navigation

1. **Tab Order**
   - Template dropdown → Description → Audience → Topics → Length radios → Cancel → Generate

2. **Radio Buttons**
   - Arrow keys to navigate between options
   - Space to select

3. **Buttons**
   - Enter/Space to activate

### Screen Reader Support

- Validation errors announced immediately
- Character count announced on focus
- Loading state announced when generation starts
- Button state changes announced

---

## Responsive Design

### Desktop (> 768px)

- Modal width: 600px
- Radio buttons: horizontal layout
- Full padding: 24px

### Mobile (≤ 768px)

- Modal width: 90% of viewport
- Radio buttons: vertical layout (stacked)
- Reduced padding: 16px
- Touch-friendly button sizes

---

## Visual States Summary

| State | Description Chars | Char Count Color | Validation | Generate Button |
|-------|-------------------|------------------|------------|-----------------|
| Empty | 0 | Red | None | Disabled |
| Too Short | 1-49 | Red | Error | Disabled |
| Just Valid | 50-59 | Yellow | Warning | Enabled |
| Valid | 60-500 | Green | None | Enabled |
| Too Long | 501+ | Red | Error | Disabled |
| Vague | Any | Varies | Warning | Varies |
| Loading | Any | Varies | None | Disabled |

---

## Color Palette

### Text Colors
- Normal text: `var(--text-normal)`
- Muted text: `var(--text-muted)`
- Error text: `var(--text-error)`
- Warning text: `var(--text-warning)`
- Success text: `var(--text-success)`

### Background Colors
- Primary: `var(--background-primary)`
- Secondary: `var(--background-secondary)`
- Error modifier: `var(--background-modifier-error)`
- Warning modifier: `var(--background-modifier-warning)`
- Success modifier: `var(--background-modifier-success)`

### Interactive Colors
- Accent: `var(--interactive-accent)`
- Accent hover: `var(--interactive-accent-hover)`
- Border: `var(--background-modifier-border)`

---

## Animations

### Loading State
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

### Transitions
- Border color change: 0.2s ease
- Background color change: 0.2s ease
- Button hover: 0.2s ease
- Character counter color: 0.2s ease

---

## Example User Scenarios

### Scenario 1: First-time User (No Template)

1. Opens modal, sees empty form
2. Reads placeholder: "e.g., Write a REST API tutorial..."
3. Starts typing, sees char counter turn red
4. Continues typing, counter turns green at 60 chars
5. Fills audience: "Beginner developers"
6. Selects "Medium" length
7. Clicks "Generate Structure"
8. Sees loading message
9. Modal closes, structure preview opens

### Scenario 2: Experienced User (With Template)

1. Opens modal
2. Selects "Project Retrospective" from dropdown
3. All fields auto-populate instantly
4. Tweaks description to match their project
5. Changes length from "Medium" to "Short"
6. Clicks "Generate Structure" immediately
7. Modal closes, structure preview opens

### Scenario 3: User Catches Validation Error

1. Opens modal
2. Types "Write something about products" (30 chars)
3. Sees validation box with errors and suggestions
4. Reads suggestion: "Try: 'Q4 retrospective...'"
5. Rewrites description following example
6. Validation clears, button enables
7. Clicks "Generate Structure"
8. Success

---

## Implementation Notes

### Why 50-500 Characters?

- **Minimum 50**: Forces users to be specific (eliminates "Write docs")
- **Maximum 500**: Prevents over-specification (save details for sections)
- **Sweet spot 60-200**: Most outcomes fall in this range

### Why Template-first?

- Reduces friction for new users
- Provides examples of good outcomes
- Pre-fills tedious fields (audience, topics)
- Maintains consistency across documents

### Why Real-time Validation?

- Immediate feedback prevents frustration
- Character counter helps users hit target
- Warnings guide without blocking
- Suggestions teach best practices

---

This UI specification provides the complete visual and interaction design for the OutcomeDefinitionModal component.
