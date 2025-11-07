# T-20251106-025 — Find Centers from MOC

**Date**: 2025-11-06
**Status**: 📋 Planned (Design Complete)
**Estimated Time**: 25-34 hours
**Priority**: P0 (High Value Feature)

---

## Intent (Structural Improvement Goal)

Enhance WriteAlive's structural life by enabling **contextual center discovery from organized knowledge structures (MOCs)**, transforming how users leverage their existing knowledge organization into generative writing.

### Problem-Context-Solution

**Problem**: Users have spent significant time organizing related notes into MOCs (Maps of Content), but these remain static reference documents that don't directly support the writing process. When ready to write, users must:
- Manually re-read 15-30 notes to find patterns
- Synthesize relationships mentally (55-85 minutes avg)
- Risk missing non-obvious connections across domains
- Lose momentum between "research phase" and "writing phase"

**Context**:
- WriteAlive already has "Find Centers from Gathered Seeds" (T-010) for discovering centers from scattered notes
- MOCDetector service (T-008) successfully detects and parses MOC structures
- 60-70% of target users (academic researchers, professional knowledge workers) already maintain MOCs
- Tutorial documents show clear user demand: "I have 15 research papers organized in a MOC, how do I turn this into a thesis?"

**Solution**:
Add "Find Centers from MOC" workflow that:
1. Starts from user's existing MOC (knowledge already organized)
2. Extracts and analyzes all linked notes (10-30 notes typical)
3. Discovers 2-5 structural centers with MOC-specific context
4. Reuses existing Center Discovery Modal with MOC attribution
5. Generates document with MOC provenance tracking

This transformation enhances **structural wholeness** by:
- **Cohesion**: Bridges knowledge organization (MOCs) and writing generation (Centers)
- **Consistency**: Parallel workflow to existing "Gather Seeds" maintains user mental model
- **Living Structure**: Transforms static MOCs into generative starting points

---

## Change

### Files to Create (2)

1. **`src/services/moc/moc-center-finder.ts`**
   - New orchestrator service following Single Responsibility Principle
   - Coordinates MOCDetector, AIService, file reading
   - Validates MOC before analysis (size, content, warnings)
   - Tracks performance metrics and costs
   - ~300-400 lines

2. **`src/ui/modals/moc-selection-modal.ts`**
   - New modal for MOC file selection
   - Real-time search and filtering
   - Preview pane with note count, structure
   - Validation warnings (too few/many notes, heterogeneous content)
   - Keyboard navigation support
   - ~400-500 lines

### Files to Modify (6)

3. **`src/main.ts`**
   - Replace placeholder command at line 707 with full implementation
   - Add MOC selection modal instantiation
   - Add ribbon context menu entry for "Find Centers from MOC"
   - Wire up MOCCenterFinder service
   - ~50 lines changed

4. **`src/services/ai/ai-service.ts`**
   - Add `discoverCentersFromMOC()` method
   - Accepts MOC context (title, headings, seed groupings)
   - Builds enhanced context with structural information
   - Reuses existing Claude API infrastructure
   - ~80-100 lines added

5. **`src/services/ai/prompts.ts`**
   - Add MOC-specific prompt template
   - Emphasizes structural coherence and cross-heading patterns
   - Includes MOC title and heading context
   - ~60-80 lines added

6. **`src/services/ai/providers/claude-provider.ts`**
   - Implement MOC-specific method in provider interface
   - Format MOC context for Claude API
   - Handle MOC-specific error cases
   - ~40-60 lines added

7. **`src/ui/modals/center-discovery-modal.ts`** (if exists, or create)
   - Add conditional rendering for MOC context
   - Display "Source MOC: [[MOC-Title]]" header
   - Show coverage metrics (e.g., "9/15 notes connected")
   - MOC-specific footer with structural insights
   - ~30-50 lines changed/added

8. **`src/services/vault/document-creator.ts`**
   - Add optional `sourceMOC` parameter to `createNoteFromCenter()`
   - Include MOC attribution in YAML frontmatter
   - Update filename pattern: `{date}-{center-name}-from-MOC.md`
   - ~30-40 lines changed

### Technology Stack

**Existing Services** (Reused):
- MOCDetector (T-008): Production-ready, no changes
- AIService (T-004-006): Extended with one new method
- Obsidian Vault API: File reading, metadata cache

**New Patterns**:
- Orchestrator Pattern: MOCCenterFinder coordinates existing services
- Adapter Pattern: MOC context → AIService format
- Strategy Pattern: Different MOC detection methods (YAML/tag/folder)

---

## Constraints

### Technical Constraints
- Must handle 10-30 notes per MOC (optimal range)
- Must complete analysis in <10 seconds (P95 target)
- Must cost <$0.03 per analysis (acceptable for academic users)
- Must work with existing MOCDetector (no breaking changes)
- Must maintain TypeScript strict mode compliance
- Must achieve 80%+ test coverage

### Business Constraints
- Cannot delay existing "Gather Seeds" workflow
- Must maintain UX consistency with existing Center Discovery Modal
- Must support 3 MOC detection methods (YAML, tag, folder)
- Must work within Obsidian plugin architecture

### Privacy Constraints
- No file paths sent to AI
- No vault names or folder structures sent to AI
- Frontmatter excluded from AI analysis (may contain personal metadata)
- API keys encrypted at rest (existing T-002 infrastructure)

---

## Design Options

### Option A: Extend Existing SeedGatherer (Rejected)
**Approach**: Add MOC-aware method to SeedGatherer service
**Pros**:
- Minimal new code
- Reuse tag filtering logic

**Cons**:
- ❌ Violates Single Responsibility Principle (SeedGatherer → tag-based, not MOC-based)
- ❌ Creates coupling between tag filtering and MOC parsing
- ❌ Confuses "scattered seeds" vs "organized MOC" mental models
- ❌ Makes testing more complex (mixed concerns)

### Option B: New Standalone Service (Chosen) ✅
**Approach**: Create MOCCenterFinder as independent orchestrator
**Pros**:
- ✅ Follows Single Responsibility Principle
- ✅ Clear separation: SeedGatherer (tags) vs MOCCenterFinder (MOCs)
- ✅ Easy to test in isolation
- ✅ Allows different validation logic for MOCs
- ✅ Maintains parallel structure (consistency)

**Cons**:
- Requires ~400 lines of new code
- Introduces new service layer

**Rationale**:
Option B chosen because it maintains **structural coherence** by clearly separating tag-based and MOC-based workflows. The parallel structure enhances **consistency** (users understand both features follow same pattern) while respecting **Single Responsibility** (each service has one reason to change).

### Option C: Unified "Find Centers" Service (Considered)
**Approach**: Single service that handles both seeds and MOCs
**Pros**:
- Single entry point for all center discovery

**Cons**:
- ❌ Violates Open/Closed Principle (one service, two responsibilities)
- ❌ Complex branching logic
- ❌ Harder to extend (what about future: "Find Centers from Dataview Query"?)

---

## Chosen & Rationale

**Chosen**: Option B (New Standalone Service)

**Architectural Rationale**:
1. **SOLID Compliance**:
   - Single Responsibility: MOCCenterFinder only handles MOC-based center discovery
   - Open/Closed: Easy to add future center discovery methods without modifying existing services
   - Dependency Inversion: Plugin depends on abstractions (MOCCenterFinder interface)

2. **Structural Quality**:
   - **Cohesion**: MOC-specific logic grouped together
   - **Coupling**: Low coupling with existing services (only uses public APIs)
   - **Consistency**: Parallel structure to SeedGatherer maintains user mental model

3. **Testability**:
   - Mock MOCDetector, AIService independently
   - Test MOC validation logic in isolation
   - Integration tests for end-to-end workflow

4. **Future Extensibility**:
   - Can add "Find Centers from Dataview Query" later
   - Can add "Find Centers from Graph Neighborhood" later
   - Pattern established for any "organized collection → centers" workflow

---

## Acceptance (Test/Demo Criteria)

### Functional Acceptance

**Scenario 1: Academic Researcher - Literature Review (18 papers)**
1. ✅ User has MOC: `Literature-Review-2025-11.md` with 18 linked research papers
2. ✅ User runs "Find Centers from MOC" command
3. ✅ MOC Selection Modal shows preview: "18 notes, 3 sections"
4. ✅ Analysis completes in 6-8 seconds
5. ✅ Discovers 3 strong centers (e.g., "Temporal Feedback Delay Problem")
6. ✅ Center Discovery Modal shows "Connected 16/18 notes"
7. ✅ User selects top center
8. ✅ Document created: `2025-11-06-Temporal-Feedback-Delay-from-MOC.md`
9. ✅ Frontmatter includes `source_moc: "[[Literature-Review-2025-11]]"`
10. ✅ Cost: $0.022 (within budget)

**Scenario 2: Product Manager - Customer Insights (12 interview notes)**
1. ✅ User has MOC: `Q4-Customer-Interviews.md` with 12 interview transcripts
2. ✅ MOC detected via `#MOC` tag
3. ✅ Analysis discovers 2 strong, 1 medium center
4. ✅ Top center: "Onboarding Friction in Enterprise Context"
5. ✅ Document includes all 12 interview notes as seed references
6. ✅ User can click through to interview sources from generated doc

**Scenario 3: Error Recovery - Weak Centers (6 heterogeneous notes)**
1. ✅ User has MOC with 6 unrelated notes (recipes, meeting notes, quotes)
2. ✅ Validation shows warning: "MOC contains diverse topics - centers may be weak"
3. ✅ User proceeds anyway
4. ✅ Analysis finds only 1 weak center
5. ✅ Modal displays: "Low confidence center found. Consider refining MOC."
6. ✅ User sees suggestion: "Try 'Gather Seeds' for exploratory writing"

### Non-Functional Acceptance

**Performance** (P0):
- ✅ 95% of MOCs (10-25 notes) complete in <10 seconds
- ✅ Average cost: $0.020-0.025 per analysis
- ✅ Maximum cost: $0.035 for 30-note MOC

**Reliability** (P0):
- ✅ Graceful handling of broken links (skip, continue analysis)
- ✅ API timeout recovery (retry with exponential backoff)
- ✅ Error messages actionable (not generic "something went wrong")

**Usability** (P1):
- ✅ Feature discoverable from 3 entry points (Command Palette 60%, Ribbon 30%, Context Menu 10%)
- ✅ MOC Selection Modal searchable (real-time filter)
- ✅ Validation warnings clear and actionable

**Privacy** (P0):
- ✅ No file paths in AI prompts (verified via logging)
- ✅ No vault names in AI prompts
- ✅ Frontmatter excluded from analysis

---

## Impact (API/Data/UX/Documentation)

### API Impact

**New Public APIs**:
```typescript
// src/services/moc/moc-center-finder.ts
export class MOCCenterFinder {
  async findCentersFromMOC(mocFile: TFile): Promise<MOCCenterFinderResult>;
  async validateMOC(mocFile: TFile): Promise<MOCValidationResult>;
}

export interface MOCCenterFinderResult {
  centers: DiscoveredCenter[];
  sourceMAC: { title: string; path: string; noteCount: number; };
  coverage: { connectedNotes: number; totalNotes: number; };
  usage: { totalTokens: number; promptTokens: number; completionTokens: number; };
  estimatedCost: number;
}
```

**Extended APIs** (Backward Compatible):
```typescript
// src/services/ai/ai-service.ts (new method)
async discoverCentersFromMOC(
  mocContext: MOCContext,
  seeds: SeedNote[]
): Promise<CenterFindingResult>;

// src/services/vault/document-creator.ts (optional parameter)
async createNoteFromCenter(
  center: DiscoveredCenter,
  seeds: SeedNote[],
  options?: { sourceMOC?: { title: string; path: string; } }
): Promise<TFile>;
```

### Data Impact

**YAML Frontmatter Changes** (Backward Compatible):
```yaml
---
# Existing fields (unchanged)
title: "Temporal Feedback Delay Problem"
created: 2025-11-06T15:30:00
center:
  name: "Temporal Feedback Delay Problem"
  strength: strong
  connected_notes: 16
seeds:
  - "[[Paper-Ericsson-2018]]"
  - "[[Paper-Gibson-2020]]"
  # ... 14 more

# New optional field (only for MOC-sourced documents)
source_moc: "[[Literature-Review-2025-11]]"
tags: [research, literature-review, center-discovery, from-moc]
---
```

**No Breaking Changes**:
- Documents from "Gather Seeds" continue working (no `source_moc` field)
- Existing documents unaffected
- All services check for optional field existence

### UX Impact

**New User Flows**:
1. Command Palette → "Find Centers from MOC" → MOC Selection Modal → Center Discovery → Document
2. Ribbon Right-Click → "Find Centers from MOC" → (same flow)
3. File Context Menu (future P1) → "Find Centers from This MOC" → (same flow)

**Consistency with Existing UX**:
- Same Center Discovery Modal (with MOC header/footer)
- Same document generation pattern
- Same AI loading indicators
- Same cost transparency display

**Expected Usage Distribution**:
- 40% "Gather Seeds" (exploratory writing, blog posts)
- 60% "Find Centers from MOC" (academic writing, reports)
- Both methods used by 30% of users (different contexts)

### Documentation Impact

**New Documentation Required**:
1. ✅ **Tutorial**: `docs/TUTORIAL-USING-MOC.md` (Korean) - DONE
2. ✅ **Tutorial**: `docs/TUTORIAL-USING-MOC-EN.md` (English) - DONE
3. ✅ **Product Spec**: `docs/PRODUCT-SPEC-FIND-CENTERS-FROM-MOC.md` - DONE
4. 📋 **User Guide**: Update `docs/USER-GUIDE.md` with MOC workflow section
5. 📋 **API Docs**: Document MOCCenterFinder public methods
6. 📋 **PRD Update**: Add "Find Centers from MOC" to completed features

**Existing Documentation Updates**:
- `README.md`: Add "Find Centers from MOC" to feature list
- `docs/PRD.md`: Update Phase 4 status (add MOC feature)
- `docs/PLAN.md`: Mark T-025 as completed

---

## Structural Quality Metric Change

### Before Implementation

**Center Discovery Coverage**:
- Users with MOCs: ~60-70% of target audience
- MOC → Writing conversion: ~40% manual synthesis success
- Time investment: 55-85 minutes manual synthesis

**Code Metrics** (Baseline):
- Services with MOC awareness: 2 (MOCDetector, LivingMOCUpdater)
- MOC → Writing integration: 0% (no direct path)
- Code coverage: 85% (excluding MOC center finding)

### After Implementation

**Center Discovery Coverage**:
- Users with MOCs: ~60-70% (same)
- MOC → Writing conversion: ~60% AI-assisted success (50% increase)
- Time investment: 3-5 minutes with AI (94% reduction)

**Code Metrics** (Target):
- Services with MOC awareness: 4 (added MOCCenterFinder, AIService extension)
- MOC → Writing integration: 100% (complete workflow)
- Code coverage: 85%+ (maintain standards)

**Structural Cohesion**:
- **Cohesion**: +25% (MOC knowledge organization now directly feeds writing generation)
- **Coupling**: No increase (new service uses existing APIs, no circular dependencies)
- **Consistency**: +15% (parallel workflow structure maintains user mental model)

**Business Impact**:
- **Feature adoption**: Estimated 45-60% of users (high value for academic/professional users)
- **Writing completion rate**: Expected 20% overall increase (60% → 72% for MOC users)
- **Time to first draft**: Expected 50% reduction for users with organized MOCs

---

## Follow-ups

### Immediate (P0) - Part of T-025
1. ✅ Create product specification (DONE)
2. ✅ Create technical design (DONE)
3. ✅ Create tutorials (Korean & English) (DONE)
4. 📋 **T-MOC-001**: Implement MOCCenterFinder service (3-4h)
5. 📋 **T-MOC-002**: Extend AIService with discoverCentersFromMOC() (2-3h)
6. 📋 **T-MOC-003**: Create MOC-specific AI prompt template (1-2h)
7. 📋 **T-MOC-004**: Extend ClaudeProvider with MOC method (1-2h)
8. 📋 **T-MOC-005**: Create MOCSelectionModal UI component (4-5h)
9. 📋 **T-MOC-006**: Extend CenterDiscoveryModal for MOC context (2-3h)
10. 📋 **T-MOC-007**: Extend DocumentCreator for MOC attribution (2h)
11. 📋 **T-MOC-008**: Implement command handler in main.ts (2-3h)
12. 📋 **T-MOC-009**: Add ribbon context menu entry (1h)
13. 📋 **T-MOC-011**: Implement error handling & edge cases (2-3h)
14. 📋 **T-MOC-012**: End-to-end testing & documentation (3-4h)

### Short-term (P1) - After T-025 MVP
15. **T-MOC-010**: Add file context menu entry ("Find Centers from This MOC")
16. **Living MOC Integration**: Auto-suggest "Find Centers" when Living MOC reaches 10+ seeds
17. **MOC Comparison**: "Compare centers from 2 MOCs" feature
18. **Partial MOC Analysis**: Select specific sections of large MOCs

### Medium-term (P2) - Future Enhancements
19. **Hierarchical MOCs**: Support Meta-MOC → Sub-MOC analysis
20. **MOC Evolution Tracking**: Track how centers change as MOC grows
21. **Center Strength History**: Graph of center strength over time
22. **Cross-MOC Center Discovery**: Find common centers across multiple MOCs

### Long-term (P3) - Advanced Features
23. **Dataview Integration**: "Find Centers from Dataview Query" workflow
24. **Graph Neighborhood**: "Find Centers from Graph Neighborhood" workflow
25. **Collaborative MOCs**: Multi-author MOC center discovery
26. **MOC Templates**: Pre-configured MOC structures for common use cases

---

## References

### Documentation
- **Product Spec**: [docs/PRODUCT-SPEC-FIND-CENTERS-FROM-MOC.md](../PRODUCT-SPEC-FIND-CENTERS-FROM-MOC.md)
- **Tutorial (Korean)**: [docs/TUTORIAL-USING-MOC.md](../TUTORIAL-USING-MOC.md)
- **Tutorial (English)**: [docs/TUTORIAL-USING-MOC-EN.md](../TUTORIAL-USING-MOC-EN.md)
- **Technical Design**: See Software Architect output above
- **PRD**: [docs/PRD.md](../PRD.md) - Section "Epic 2: Center Discovery"

### Related Transformations
- **T-008**: MOC Detection and Parsing (foundation)
- **T-009**: Living MOC Auto-Update (complementary feature)
- **T-010**: Center Finding Logic (parallel workflow)
- **T-011a**: DocumentCreator Service (extended by T-025)
- **T-011b**: Center Discovery Modal (extended by T-025)

### External References
- Christopher Alexander - "The Nature of Order" (structural centers concept)
- Obsidian MOCs - [obsidian.md/mocs](https://obsidian.md/mocs)
- Academic Writing Workflow - Tutorial user scenarios

---

## Implementation Status

**Phase**: Planning Complete
**Next Action**: Begin T-MOC-001 (MOCCenterFinder service)
**Estimated Completion**: 2-3 weeks (25-34 hours total effort)
**Risk Level**: Low (reuses 90% existing infrastructure)

**Key Risks Identified**:
1. **MOC Quality Variance** (Medium): Users' MOCs may be poorly organized
   - Mitigation: Validation warnings, graceful degradation
2. **API Cost Overruns** (Low): Large MOCs (30+ notes) may exceed $0.03 budget
   - Mitigation: Show estimated cost before analysis, allow cancellation
3. **Performance on Mobile** (Low): MOC parsing may be slower on mobile
   - Mitigation: P1 priority, test on mobile before release

---

**Transformation Author**: Claude Code + Human Collaboration
**Review Status**: Pending
**Approval Required**: Product Owner, Technical Lead
