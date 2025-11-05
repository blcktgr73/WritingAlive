# T-20251106-024 — Ribbon Button & Next Steps Suggestion

**Date**: 2025-11-06
**Status**: ✅ Completed
**Time Spent**: 4 hours

## Intent (Structural Improvement Goal)

Enhance the plugin's discoverability and usability by adding a **unified ribbon button** as the main entry point for all WriteAlive commands. Additionally, extend the writing workflow with **AI-powered next steps suggestion**, enabling writers to discover expansion directions after completing their initial writing.

This transformation improves structural life by:
- **Cohesion**: Consolidates all WriteAlive actions behind a single, discoverable ribbon icon
- **Consistency**: Maintains dual access patterns (ribbon + command palette) for different user preferences
- **Wholeness**: Completes the writing loop by connecting "Start Writing" to "Continue Writing" through AI suggestions

**Problem**:
1. No visual entry point for WriteAlive commands (users must know to use command palette)
2. After initial writing, users face "blank page syndrome" - unsure how to expand their work
3. Command discovery relies solely on command palette searching

**Context**:
- WriteAlive currently has 4 commands (Gather Seeds, Create Snapshot, List Snapshots, Restore Snapshot) accessible only via command palette
- Users write initial content from centers but have no guidance on next structural improvements
- Need to support both keyboard-centric (command palette) and mouse-centric (ribbon) users

**Solution**:
1. Add WriteAlive ribbon button (🌱 icon) with right-click context menu showing all commands
2. Implement "Suggest Next Steps" feature that analyzes current document and suggests expansion directions
3. Maintain backward compatibility by keeping command palette access

## Change

**Files to Create**:
1. `src/ui/modals/next-steps-modal.ts` - Modal for displaying AI-suggested next steps (Phase 2)

**Files to Modify**:
1. `src/main.ts` - Add ribbon button with context menu, register "Suggest Next Steps" command
2. `src/services/ai/ai-service.ts` - Add `suggestNextSteps()` method (Phase 2)
3. `src/services/ai/prompts.ts` - Add next steps prompt template (Phase 2)
4. `src/services/ai/types.ts` - Add `NextStepSuggestion` and `NextStepsResult` types (Phase 2)
5. `docs/PRD.md` - Update feature list and workflow diagram
6. `styles.css` - Add styles for next-steps-modal (Phase 2)

## Constraints

- Must not break existing command palette workflow
- Ribbon button behavior must be intuitive (left-click = primary action, right-click = menu)
- Next steps suggestions must complete within 5-7 seconds
- Must handle documents without WriteAlive metadata gracefully

## Design Options

### Ribbon Button Design

**(A) Single Action Button**
- Left-click always opens Gather Seeds
- No context menu
- Pros: Simple, predictable
- Cons: Poor command discoverability, doesn't scale

**(B) Dropdown Menu Button**
- Left-click opens dropdown menu
- Pros: All commands visible immediately
- Cons: Requires extra click for common actions, cluttered

**(C) Context Menu Button (Chosen)** ✅
- Left-click: Primary action (Gather Seeds)
- Right-click: Context menu with all commands
- Pros: Fast access to primary action, scalable, Obsidian-native pattern
- Cons: Requires user discovery of right-click behavior

### Next Steps Output Format

**(A) Inline Suggestions**
- Insert suggestions directly into document
- Pros: Low friction
- Cons: Clutters document, not dismissable

**(B) Modal with Structured Cards (Chosen)** ✅
- Show suggestions in dedicated modal
- User chooses to "Apply to Document" or "Create New Note"
- Pros: User control, clean document, matches existing "Find Centers" pattern
- Cons: Requires extra click

## Chosen & Rationale

**Ribbon Button: Option C (Context Menu)**
- Aligns with Obsidian's design patterns (other plugins use context menus)
- Balances speed (left-click for common action) with discoverability (right-click for all)
- Keyboard users unaffected (command palette still primary)

**Next Steps: Option B (Modal with Cards)**
- Maintains consistency with existing "Center Discovery Modal" (T-011b)
- Gives user control over whether/how to apply suggestions
- Preserves document cleanliness

## Acceptance Criteria

**Phase 1: Ribbon Button + Command Registration**
- ✅ Ribbon button appears in left sidebar with 🌱 icon
- ✅ Left-click on ribbon button opens Gather Seeds modal
- ✅ Right-click on ribbon button shows context menu with all commands
- ✅ Context menu shows: Gather Seeds, Suggest Next Steps, Create Snapshot, List Snapshots, Restore Snapshot
- ✅ "Suggest Next Steps" command appears in command palette
- ✅ All existing commands remain functional

**Phase 2: Next Steps Implementation**
- ✅ Suggest Next Steps analyzes current document and returns 2-4 suggestions
- ✅ Each suggestion includes strength indicator (⭐⭐⭐, ⭐⭐, ⭐)
- ✅ Suggestions display "Why this matters" rationale
- ✅ Content hints provided for each suggestion
- ✅ Wholeness score and key themes analyzed
- ✅ Suggestions appended directly to document (inline implementation)
- ✅ Cost transparency ($0.01-0.03 per analysis)

## Impact

**API Impact**:
- New public method: `AIService.suggestNextSteps(content, file)` (Phase 2)
- Backward compatible: No breaking changes

**UX Impact**:
- Ribbon button provides visual entry point
- "Suggest Next Steps" adds 4th phase to workflow: Gather → Find → Write → **Expand**

**Documentation Impact**:
- README.md: Add ribbon button usage section
- PRD.md: Update workflow diagram to include Phase 4

## Implementation Summary

### Phase 1: Ribbon Button + Command Registration ✅
1. ✅ Added ribbon button to [main.ts](../src/main.ts:754-815)
2. ✅ Implemented right-click context menu with all commands
3. ✅ Registered "Suggest Next Steps" command
4. ✅ Updated documentation

### Phase 2: AI Integration ✅
1. ✅ Added `NextStepSuggestion` and `NextStepsResult` types to [types.ts](../src/services/ai/types.ts:740-842)
2. ✅ Implemented `AIService.suggestNextSteps()` in [ai-service.ts](../src/services/ai/ai-service.ts:476-699)
3. ✅ Added next steps prompt template in [prompts.ts](../src/services/ai/prompts.ts:394-485)
4. ✅ Implemented inline suggestion output (appends to document)
5. ✅ Added cost calculation and transparency

## Follow-ups

**Immediate (T-025)**:
- Add welcome tooltip on first ribbon button hover
- Add keyboard shortcut hints to context menu items

**Phase 4 Completion (T-026 - T-028)**:
- Implement "Apply to Document" content generation
- Add suggestion history tracking

## Verification Commands

```bash
# Build plugin
npm run build

# Manual verification in Obsidian:
# 1. Reload plugin (Ctrl+R)
# 2. Check ribbon button appears in left sidebar
# 3. Left-click ribbon → Verify Gather Seeds modal opens
# 4. Right-click ribbon → Verify context menu shows 5 items
# 5. Cmd+P → "Suggest Next Steps" → Verify placeholder notice appears
```
