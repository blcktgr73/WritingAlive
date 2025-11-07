## T-20251107-027 — Outcome-Driven & Hybrid Writing Enhancement (Epic 5)

**Date**: 2025-11-07
**Status**: 📋 Planned (Product Specification Complete)
**Estimated Time**: 16-20 weeks (4 phases)

### Intent (Structural Improvement Goal)

Transform WriteAlive from a single-mode exploratory writing tool into a **bidirectional writing system** supporting both discovery and intention. This enhances structural life by:

- **Market Expansion**: Extend from 30% (creative writers) to 70% (professional knowledge workers)
- **Workflow Flexibility**: Support bottom-up discovery AND top-down goal-driven writing
- **Philosophical Integrity**: Maintain Saligo Writing principles (small steps, low energy barriers) even in outcome-driven mode

**Problem**: Current seed-based workflow excels at exploratory essays but struggles with professional/academic writing requiring predetermined structure
**Context**: Users report "love it for personal essays, can't use it at work" - missing 70% of addressable market
**Solution**: Three complementary writing modes - Seed-Based (existing), Outcome-Driven (new), Hybrid (new)

### Change

**New Conceptual Framework**:
- **Mode 1: Seed-Based** (existing) - Bottom-up discovery from scattered thoughts
- **Mode 2: Outcome-Driven** (new) - Top-down goal-oriented writing with AI-generated gentle structure
- **Mode 3: Hybrid** (new) - Combine seeds with defined outcomes for targeted writing

**Product Specification**: See [PRODUCT-SPEC-OUTCOME-HYBRID-WRITING.md](../PRODUCT-SPEC-OUTCOME-HYBRID-WRITING.md) (2000+ lines)

**Planned Services** (to be created in implementation phases):
1. `src/services/outcome/outcome-manager.ts` - Outcome definition, template management
2. `src/services/outcome/structure-generator.ts` - AI-powered structure generation from outcomes
3. `src/services/outcome/hybrid-center-finder.ts` - Outcome-aligned center discovery
4. `src/ui/modals/mode-selection-modal.ts` - Help users choose appropriate writing mode
5. `src/ui/modals/outcome-definition-modal.ts` - Outcome input with templates
6. `src/ui/views/section-writing-view.ts` - Section-by-section guided writing

**Extended Services** (to be modified):
1. `src/services/ai/ai-service.ts` - Add outcome-aware prompts
2. `src/services/vault/document-creator.ts` - Outcome metadata in frontmatter
3. `src/main.ts` - New commands for outcome-driven workflow
4. `src/ui/modals/center-discovery-modal.ts` - Hybrid mode support

### Constraints

**Technical**:
- Maintain backwards compatibility with existing seed-based workflow
- All three modes must share core AI service architecture
- Outcome templates must be extensible (users can create custom templates)
- Structure generation cost: $0.005-0.010 per outcome (10x cheaper than center discovery)

**Performance**:
- Mode selection quiz: <1 minute
- Outcome definition: <2 minutes
- Structure generation: <5 seconds
- Hybrid center discovery: <10 seconds (same as MOC-based)
- Total time to first sentence: <5 minutes (maintaining low energy barrier)

**Cost**:
- Structure generation: $0.005-0.010 per document
- Hybrid center discovery: $0.025-0.035 per document (same as MOC)
- Monthly budget per active user: $8-15 (3 outcome docs + 2 hybrid docs + 3 seed docs)

**User Experience**:
- 90% of users must select correct mode for their context (validated by 3-question quiz)
- Outcome-driven mode must NOT feel like traditional outlining (no rigid prescriptive structure)
- Hybrid mode must seamlessly integrate seed selection with outcome awareness

### Design Options

**Option A: Separate Outcome-Driven App** (Rejected)
- Pros: Clean separation, no risk to existing users
- Cons: Split user base, duplicate infrastructure, loses synergy between modes
- Rationale: Users want ONE tool that adapts to context, not multiple tools

**Option B: Replace Seed-Based with Outcome-First** (Rejected)
- Pros: Simpler single-mode system
- Cons: Alienates existing users, loses core differentiator (exploratory discovery)
- Rationale: Seed-based mode is WriteAlive's unique strength - must preserve it

**Option C: Three-Mode Bidirectional System** ✅ Chosen
- Pros: Serves both markets, maintains philosophical integrity, enables fluid mode switching
- Cons: More complex architecture, need clear mode selection guidance
- Rationale: Best serves user needs across professional/academic/creative contexts

**Option D: Hybrid-Only (Seeds + Outcomes always)** (Rejected)
- Pros: One universal workflow
- Cons: Forces users to define outcomes even for exploratory writing (violates low energy barrier principle)
- Rationale: Different contexts need different entry points

### Acceptance Criteria

**Phase 1: Mode Selection & Outcome Definition** (4-5 weeks):
- [ ] Mode selection modal with 3-question quiz (90% accuracy)
- [ ] Outcome definition interface with templates library (10+ templates)
- [ ] Outcome validation (clear, specific, achievable)
- [ ] Build succeeds, no TypeScript errors

**Phase 2: Outcome-Driven Writing** (5-6 weeks):
- [ ] Structure generation from outcome (<5s, $0.005-0.010)
- [ ] Section-by-section writing interface
- [ ] AI prompts maintain Saligo principles (small steps, truthfulness)
- [ ] Document creation with outcome metadata

**Phase 3: Hybrid Mode** (4-5 weeks):
- [ ] Seed selection + outcome definition flow
- [ ] Outcome-aligned center discovery
- [ ] Hybrid document creation with both seeds and outcome metadata
- [ ] Coverage metrics (% of outcome sections addressed by seeds)

**Phase 4: Polish & Integration** (3-4 weeks):
- [ ] Tutorial for all three modes
- [ ] Analytics instrumentation (mode selection accuracy, completion rates)
- [ ] Performance optimization (caching, parallel processing)
- [ ] Comprehensive testing (unit, integration, E2E)

### Impact

**API Impact**:
- New commands: `writealive:select-writing-mode`, `writealive:define-outcome`, `writealive:start-outcome-writing`
- New services: `OutcomeManager`, `StructureGenerator`, `HybridCenterFinder`
- Extended: `AIService.generateStructure()`, `AIService.findHybridCenters()`

**Data Impact**:
```yaml
---
title: "Q4 Product Strategy"
writing_mode: outcome-driven  # NEW
outcome:  # NEW
  type: professional_report
  description: "Quarterly strategy document for product team"
  sections:
    - "Market Analysis"
    - "Customer Pain Points"
    - "Proposed Solutions"
    - "Success Metrics"
  estimated_length: 2000
  deadline: "2025-11-15"
sections_completed: 2  # NEW (progress tracking)
---
```

**Hybrid Mode Example**:
```yaml
---
title: "Literature Review - Feedback Loops"
writing_mode: hybrid  # NEW
outcome:
  type: academic_literature_review
  description: "Chapter 2: Temporal delay in feedback loops"
  research_question: "How does temporal delay affect feedback effectiveness?"
seeds:
  - "[[Paper-Smith-2023]]"
  - "[[Paper-Jones-2024]]"
center:
  name: "Delay Compounds Error Propagation"
  strength: strong
  outcome_alignment: 0.92  # NEW (how well center serves outcome)
---
```

**UX Impact**:
- **Before**: One workflow (seed-based) - 30% market (creative/exploratory writers)
- **After**: Three workflows - 100% market (creative + professional + academic)
- **Professional User Growth**: +100% (from 20% to 40% of user base)
- **Completion Rate**: 70% outcome-driven (vs 60% seed-based)

**Documentation Impact**:
- [PRD.md](../PRD.md) - Updated with Epic 5 and bidirectional vision
- [PRODUCT-SPEC-OUTCOME-HYBRID-WRITING.md](../PRODUCT-SPEC-OUTCOME-HYBRID-WRITING.md) - New (2000+ lines)
- [TRANSFORMATIONS.md](../TRANSFORMATIONS.md) - This entry
- Tutorials: New tutorials for outcome-driven and hybrid modes (Korean + English)

### Structural Quality Metric Change

**Before T-027**:
- Workflow Modes: 1 (Seed-Based only)
- Market Coverage: 30% (creative/exploratory writers)
- Writing Contexts Supported: 3 (essays, blogs, personal reflection)
- Mode Selection Guidance: 0% (no choice needed)
- Outcome Awareness: 0% (discovery-only)

**After T-027**:
- Workflow Modes: 3 (+200%) (Seed-Based + Outcome-Driven + Hybrid)
- Market Coverage: 100% (+70pp) (creative + professional + academic)
- Writing Contexts Supported: 10 (+7) (adds reports, proposals, documentation, literature reviews, etc.)
- Mode Selection Guidance: 90% accuracy (3-question quiz + templates)
- Outcome Awareness: 100% (outcomes optional but supported)

**Architectural Improvements**:
- Service Modularity: +3 new services following Single Responsibility Principle
- AI Service Abstraction: Enhanced to support multiple prompt strategies (discovery vs outcome-driven)
- Template System: New extensible template architecture (10+ built-in, user-customizable)
- Metadata Schema: Extended YAML frontmatter for outcome tracking

**User Experience Improvements**:
- Entry Point Flexibility: Bottom-up OR top-down (vs only bottom-up)
- Professional Adoption: 2x professional user growth (from 20% to 40%)
- Completion Rate: +10pp for outcome-driven mode (70% vs 60% seed-based)
- Time to First Sentence: Maintains <5 min across all modes

### Follow-ups

**Immediate** (Before Implementation):
- [ ] Review product spec with stakeholders
- [ ] Validate templates with target users (professionals, academics)
- [ ] Create technical design document (architecture, data models, API contracts)
- [ ] Set up analytics instrumentation plan

**Phase 1 Follow-ups** (Mode Selection):
- [ ] User testing of mode selection quiz (validate 90% accuracy)
- [ ] A/B testing of template presentation (grid vs list, categorized vs flat)
- [ ] Analytics: Track mode selection distribution (seed vs outcome vs hybrid)

**Phase 2 Follow-ups** (Outcome-Driven):
- [ ] Monitor structure generation quality (user feedback)
- [ ] Cost analysis (actual vs estimated $0.005-0.010)
- [ ] Completion rate tracking (target: 70%)

**Phase 3 Follow-ups** (Hybrid Mode):
- [ ] Validate outcome-alignment scoring algorithm
- [ ] Monitor hybrid adoption (target: 40% of academic users)
- [ ] Cross-device testing (mobile seed capture + desktop hybrid writing)

**Phase 4 Follow-ups** (Polish & Launch):
- [ ] Performance optimization (caching, parallel AI calls)
- [ ] Tutorial effectiveness testing (completion rate, time to first doc)
- [ ] Launch marketing (blog posts, demo videos, case studies)
- [ ] Community feedback collection (feature requests, pain points)

**Long-term** (Post-Launch):
- [ ] Custom template creation UI (users build their own outcome templates)
- [ ] Multi-document outcome tracking (e.g., thesis chapters all serve same outcome)
- [ ] Outcome evolution (refine outcome as writing progresses)
- [ ] Collaborative outcomes (team-defined shared goals)

---
