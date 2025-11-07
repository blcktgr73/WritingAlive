# WriteAlive Advanced Tutorial: Finding Centers from MOC

> This tutorial covers the advanced workflow of discovering structural centers from your existing **MOC (Map of Content)**.
> Focus shifts from "gathering scattered seeds" to **"finding patterns in knowledge you've already organized."**

---

## 🎯 Tutorial Goals

1. **Learn new MOC usage** - MOCs are not just link collections; they reveal knowledge structures
2. **Discover contextual centers** - Find hidden structural pivots in notes you've already connected
3. **Apply to academic writing** - Use for papers, essays, reports, and structured writing
4. **Evolve your knowledge base** - Transform static MOCs into generative writing starting points

---

## 🗺️ What is a MOC?

**MOC (Map of Content)** is how Obsidian users organize related notes in one place.

### Traditional MOC Usage
```markdown
# 2025-11 Writing Ideas MOC

## Bill Evans Related
- [[20251104 Bill Evans Practice Philosophy]]
- [[20251105 Guitar Practice Insight]]
- [[20251107 Tree Growth Metaphor]]

## Programming Learning
- [[20251106 Code Review Realization]]
- [[20251110 Refactoring Experience]]

## Reading Notes
- [[Nature of Order Excerpts]]
- [[Atomic Habits Summary]]
```

While this organization shows **"related notes are grouped,"** it doesn't answer:
- ❌ What is the **common structural pattern** across these notes?
- ❌ What kind of **writing** could emerge from connecting them?
- ❌ Where is the **strongest connection center**?

---

## 📖 Scenario: "One Month of Ideas → Academic Paper"

### Background Story

You're a graduate student who has collected ideas about "learning methodology" for a month:
- Bill Evans' practice philosophy
- Christopher Alexander's generative patterns
- Your own programming learning experience
- Insights from guitar practice
- Tree growth observation journal

You've organized these notes in `2025-11-Learning-Methodology-MOC.md`. Total of 15 notes across 3 sections.

**The Problem:**
- You need to write a paper, but don't know **what thesis to argue**
- You sense a **common pattern** across notes but can't articulate it clearly
- Traditional method: Re-read all 15 notes manually and synthesize (2-3 hours)

**WriteAlive Method:**
AI automatically discovers structural centers from your MOC (5 minutes).

---

## 🔍 Workflow: MOC → Center Discovery → Start Writing

### Step 1: Prepare MOC File

First, mark your MOC so WriteAlive can recognize it.

#### Method 1: YAML Frontmatter (Recommended)
```markdown
---
type: moc
title: Learning Methodology Research Notes
created: 2025-11-01
tags: [learning, research, paper-prep]
---

# 2025-11 Learning Methodology MOC

## Theoretical Background
- [[Bill Evans Practice Philosophy]]
- [[Nature of Order - Generative Sequence]]
- [[Atomic Habits - Power of Small Habits]]

## Practical Experience
- [[Guitar Practice Week 4 Log]]
- [[Programming TDD Experience]]
- [[Writing Experiment Journal]]

## Observations & Metaphors
- [[Tree Growth Timelapse Observation]]
- [[Architectural Patterns and Learning Parallels]]
```

#### Method 2: MOC Folder Pattern
```
📁 vault/
  📁 MOCs/              ← Auto-detected by folder name
    📄 Learning-Methodology-MOC.md
```

#### Method 3: #MOC Tag
```markdown
# 2025-11 Learning Methodology MOC
#MOC #learning #paper-prep

- [[Bill Evans Practice Philosophy]]
- [[Nature of Order - Generative Sequence]]
...
```

---

### Step 2: Run Find Centers from MOC

#### 2-1. Execute Command

**Method A: Command Palette (Recommended)**
1. Open **Ctrl/Cmd + P**
2. Type `WriteAlive: Find Centers from MOC`
3. Select MOC file (`2025-11-Learning-Methodology-MOC.md`)

**Method B: Ribbon Button**
1. Right-click **🌱 icon** in left sidebar
2. Select **"🔍 Find Centers from MOC"** from menu
3. Select MOC file

#### 2-2. Processing (Automatic)

```
✅ Analyzing MOC file... (1-2 sec)
   → Found 15 linked notes

✅ Reading note contents... (2-3 sec)
   → Extracted 12,000 words total

✅ AI structural pattern analysis... (5-7 sec)
   → Claude 3.5 Sonnet discovering centers

✅ Center discovery complete!
   → 3 strong centers, 2 medium centers found
```

---

### Step 3: Review Center Discovery Results

#### Center Discovery Modal UI

```markdown
╔══════════════════════════════════════════════════════════════╗
║  🔍 Centers Found from MOC                                   ║
║  Source: 2025-11-Learning-Methodology-MOC.md (15 notes)     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ⭐⭐⭐ Strong Centers (3)                                    ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │ 📍 "Completeness vs Approximation"                     │ ║
║  │                                                        │ ║
║  │ 💡 Explanation:                                        │ ║
║  │ All your notes converge around the contrast of        │ ║
║  │ "small parts completely" vs "whole vaguely." From     │ ║
║  │ Bill Evans' "don't approximate" to programming TDD,   │ ║
║  │ to trees growing one branch at a time - all share    │ ║
║  │ this structure.                                        │ ║
║  │                                                        │ ║
║  │ 🔗 Connected Notes (9):                                │ ║
║  │    [[Bill Evans Practice Philosophy]] ⭐⭐⭐           │ ║
║  │    [[Guitar Practice Week 4 Log]] ⭐⭐⭐              │ ║
║  │    [[Programming TDD Experience]] ⭐⭐                 │ ║
║  │    [[Tree Growth Timelapse]] ⭐⭐                      │ ║
║  │    [[Nature of Order - Generative Sequence]] ⭐⭐     │ ║
║  │    [[Atomic Habits - Power of Small]] ⭐              │ ║
║  │    [[Writing Experiment Journal]] ⭐                   │ ║
║  │    [[Architectural Patterns and Learning]] ⭐          │ ║
║  │    [[Code Review Philosophy]] ⭐                       │ ║
║  │                                                        │ ║
║  │ 📊 Center Strength Indicators:                         │ ║
║  │    • Cross-domain: 9/10 (music→coding→writing→nature)│ ║
║  │    • Emotional resonance: 8/10 (aligns with values)  │ ║
║  │    • Concreteness: 9/10 (abstract + concrete mix)    │ ║
║  │    • Structural pivot: 10/10 (all notes center here) │ ║
║  │                                                        │ ║
║  │    [Start Writing with This Center →]                 │ ║
║  └────────────────────────────────────────────────────────┘ ║
║                                                              ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │ 📍 "Generative Sequence"                              │ ║
║  │                                                        │ ║
║  │ 💡 Explanation:                                        │ ║
║  │ The second pattern is "step-by-step growth." Just as │ ║
║  │ trees grow from root to trunk to branches, learning  │ ║
║  │ evolves from one completion to the next. Alexander's │ ║
║  │ generative sequence concept directly connects to     │ ║
║  │ your practical experience.                            │ ║
║  │                                                        │ ║
║  │ 🔗 Connected Notes (7):                                │ ║
║  │    [[Nature of Order - Generative Sequence]] ⭐⭐⭐   │ ║
║  │    [[Tree Growth Timelapse]] ⭐⭐⭐                    │ ║
║  │    [[Guitar Practice Week 4 Log]] ⭐⭐                │ ║
║  │    [[Programming TDD Experience]] ⭐⭐                 │ ║
║  │    [[Architectural Patterns and Learning]] ⭐⭐        │ ║
║  │    [[Atomic Habits - Power of Small]] ⭐              │ ║
║  │    [[Writing Experiment Journal]] ⭐                   │ ║
║  │                                                        │ ║
║  │    [Start Writing with This Center →]                 │ ║
║  └────────────────────────────────────────────────────────┘ ║
║                                                              ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │ 📍 "Sensory Feedback"                                 │ ║
║  │                                                        │ ║
║  │ 💡 Explanation:                                        │ ║
║  │ The third pattern is "importance of immediate        │ ║
║  │ feedback." Bill Evans listening with his ear, guitar │ ║
║  │ fingertip sensation, code test results - all judge   │ ║
║  │ completeness through sensory feedback.                │ ║
║  │                                                        │ ║
║  │ 🔗 Connected Notes (6):                                │ ║
║  │    [[Bill Evans Practice Philosophy]] ⭐⭐⭐           │ ║
║  │    [[Guitar Practice Week 4 Log]] ⭐⭐⭐              │ ║
║  │    [[Programming TDD Experience]] ⭐⭐                 │ ║
║  │    [[Writing Experiment Journal]] ⭐⭐                 │ ║
║  │    [[Nature of Order - Generative Sequence]] ⭐       │ ║
║  │    [[Tree Growth Timelapse]] ⭐                        │ ║
║  │                                                        │ ║
║  │    [Start Writing with This Center →]                 │ ║
║  └────────────────────────────────────────────────────────┘ ║
║                                                              ║
║  ⭐⭐ Medium Centers (2) [Expand ▼]                          ║
║                                                              ║
╟──────────────────────────────────────────────────────────────╢
║  💰 Analysis Cost: $0.023 | Tokens: 18,450                  ║
║  📊 MOC Stats: 15 notes, 12,000 words, 3 categories         ║
╚══════════════════════════════════════════════════════════════╝
```

---

### Step 4: Select Center and Start Writing

#### Selecting First Center: "Completeness vs Approximation"

When clicking **[Start Writing with This Center →]**:

1. **Auto-generate new note**
   - Filename: `2025-11-08-Completeness-vs-Approximation-from-MOC.md`
   - Location: Output folder from settings

2. **Insert initial YAML metadata**
```yaml
---
title: Completeness vs Approximation
created: 2025-11-08T15:30:00
source_moc: "[[2025-11-Learning-Methodology-MOC]]"
center:
  name: "Completeness vs Approximation"
  strength: strong
  connected_notes: 9
seeds:
  - "[[Bill Evans Practice Philosophy]]"
  - "[[Guitar Practice Week 4 Log]]"
  - "[[Programming TDD Experience]]"
  - "[[Tree Growth Timelapse Observation]]"
  - "[[Nature of Order - Generative Sequence]]"
  - "[[Atomic Habits - Power of Small Habits]]"
  - "[[Writing Experiment Journal]]"
  - "[[Architectural Patterns and Learning Parallels]]"
  - "[[Code Review Philosophy]]"
tags: [learning, research, paper, center-discovery]
---
```

3. **Generate initial content (AI suggestion)**
```markdown
# Completeness vs Approximation: The Paradoxical Efficiency of Completeness in Learning

## 🌱 Center Discovery Memo

This writing emerged from the structural center discovered in your MOC `[[2025-11-Learning-Methodology-MOC]]`.

**Core Insight:**
Bill Evans said "Don't approximate the whole vaguely, but get a small part completely real, completely true."
Your guitar practice, programming learning, and writing experience all repeatedly prove this pattern.

**Questions to explore in this writing:**
- Why is "small completeness" more effective than "large approximation"?
- What's the common pattern across music/coding/writing?
- What does this imply for learning theory?

---

## ✍️ Writing Space

*Start writing freely below. Reference the 9 connected notes as you unfold your experience.*

*Tip: Use Ctrl/Cmd + P → "Suggest Next Steps" to get direction suggestions*

---


<!-- Auto-generated reference links -->
## 📚 Connected Seed Notes

### Core Connections (⭐⭐⭐)
- [[Bill Evans Practice Philosophy]] - Source of original philosophy
- [[Guitar Practice Week 4 Log]] - 4-bar perfect practice experiment
- [[Programming TDD Experience]] - Power of completing small functions

### Supporting Connections (⭐⭐)
- [[Tree Growth Timelapse Observation]] - Nature's generative pattern
- [[Nature of Order - Generative Sequence]] - Theoretical background

### Context Connections (⭐)
- [[Atomic Habits - Power of Small Habits]]
- [[Writing Experiment Journal]]
- [[Architectural Patterns and Learning Parallels]]
- [[Code Review Philosophy]]
```

4. **Auto-position cursor**
   - Cursor placed at first line of "Writing Space" section
   - Ready to start typing immediately

---

## 🆚 Comparison: "Gather Seeds" vs "Find Centers from MOC"

### Find Centers from Gathered Seeds (Basic Workflow)

**Pros:**
- ✅ Free start without structure (low entry barrier)
- ✅ Unexpected connection discovery (creativity)
- ✅ Can use scattered ideas

**Cons:**
- ⚠️ Centers may be weak if seeds too diverse
- ⚠️ May lack structure for academic writing

**Use Cases:**
- Blog essays, personal reflection, creative writing
- "I want to start writing but don't know what to write"

---

### Find Centers from MOC (Advanced Workflow)

**Pros:**
- ✅ Clear context (MOC defines topic scope)
- ✅ Analyze more content (15-30 notes)
- ✅ Suitable for academic/professional writing
- ✅ Reuse knowledge you've already organized

**Cons:**
- ⚠️ Requires pre-existing MOC
- ⚠️ Better for structured writing than exploratory

**Use Cases:**
- Papers, reports, technical documents
- "I have lots of related materials but don't know how to weave them"
- "I want to synthesize a month of notes into writing"

---

## 💡 Practical Usage Tips

### 1. MOC Design Strategies

#### Topic-based MOC (Recommended)
```markdown
# 2025-11-Learning-Methodology-MOC
← Clear topic scope, easier center discovery
```

#### Time-based MOC
```markdown
# 2025-11-Monthly-Notes-MOC
← Mixed topics, can discover unexpected connections
```

#### Project-based MOC
```markdown
# Paper-Learning-Methodology-Comparison-MOC
← Purpose-driven, optimal for paper writing
```

---

### 2. Optimizing Center Discovery

**MOC Size:**
- Minimum: 5 notes (too few = weak centers)
- Optimal: 10-20 notes (strongest center discovery)
- Maximum: 30 notes (beyond this, split into multiple MOCs)

**Note Quality:**
- Each note should have minimum 100 words
- Notes with your own thoughts work better than simple bookmark links
- Photos/diagrams also analyzed (image recognition)

---

### 3. Iterative Workflows

#### Pattern 1: MOC → Center → Draft → Update MOC
```
1. Discover center from MOC
2. Write initial draft
3. New insights emerge while writing
4. Save new insights as separate notes
5. Add new notes to MOC
6. Re-discover centers → Find stronger centers!
```

#### Pattern 2: Parallel Multi-Center Exploration
```
1. Discover 3 strong centers from one MOC
2. Start 3 separate documents from each center
3. Write all 3 documents in parallel over several days
4. Focus on the document that grows best
5. Save others for later use
```

---

## 🎓 Academic Writing Application Example

### Structuring Paper Chapters

**Starting Point: Paper Chapter MOC**
```markdown
# Chapter-2-Literature-Review-MOC

## Theoretical Background
- [[Deliberate Practice Theory - Ericsson]]
- [[Ecological Dynamics - Gibson]]
- [[Constructivism - Piaget]]

## Empirical Studies
- [[Study-2018-Music-Practice]]
- [[Study-2020-Programming-Learning]]
- [[Study-2022-Writing-Pedagogy]]

## Critical Review
- [[Critique-Deliberate-Practice]]
- [[Gap-in-Literature]]
```

**Find Centers from MOC Result:**
```
Discovered Center: "Temporal Delay Problem in Feedback Loops"

→ This could be your paper thesis!
→ All existing research emphasizes "immediate feedback"
   but you discovered the common problem that delay is
   inevitable in real learning environments
```

---

## ❓ FAQ

### Q1: Should I use "Gather Seeds" or "Find from MOC"?

**A:** Use both! Choose based on situation:

| Situation | Recommended Method |
|-----------|-------------------|
| Starting with spontaneous ideas | Gather Seeds |
| Synthesizing a month of notes | Find from MOC |
| Structuring paper chapters | Find from MOC |
| Writing blog posts | Gather Seeds |
| Creating project reports | Find from MOC |
| Writing diary/journal | Gather Seeds |

### Q2: What if my MOC is too large?

**A:** Three strategies:

1. **Split**: If over 30 notes, divide into 2-3 smaller MOCs
2. **Section analysis**: Feature to select specific MOC sections (coming soon)
3. **Hierarchical MOCs**: Manage with Meta-MOC → Sub-MOC structure

### Q3: What if centers come out weak?

**Causes:**
- MOC notes too heterogeneous
- Each note too short (under 100 words)
- Just a link collection without your thoughts

**Solutions:**
1. Add at least one paragraph of your own thinking to each note
2. Narrow topic scope for more focused MOC
3. Use "Gather Seeds" method instead

### Q4: How is this different from Living MOC?

**Living MOC:**
- Automatically adds new seeds to MOC
- "Maintains" your MOC

**Find Centers from MOC:**
- Discovers structural patterns in MOC
- "Uses" your MOC for writing

→ Synergy when used together!

---

## 🚀 Next Steps

After completing this tutorial:

1. **Experiment with your own MOC**
   - If you have existing MOCs, try center discovery
   - If not, create a small MOC with 10-15 recent notes

2. **Compare both methods**
   - Try both "Gather Seeds" and "Find from MOC" on same topic
   - Compare which centers are stronger

3. **Explore advanced features**
   - Get expansion directions with `Suggest Next Steps`
   - Manage versions with Snapshots
   - Measure writing quality with Wholeness scores

---

## 📚 References

- [Basic Tutorial: Gather Seeds](TUTORIAL-EN.md) - Start writing "without MOC"
- [MOC Explanation (Obsidian Official)](https://obsidian.md/mocs) - MOC concept and usage
- [Living MOC Guide](./USER-GUIDE-LIVING-MOC.md) - Creating auto-updating MOCs
- [PRD: WriteAlive Full Features](PRD.md) - Product roadmap and philosophy

---

**💡 Key Message:**

MOCs are not just link collections.
They are **maps** that reveal the structure of knowledge you've already woven together.

WriteAlive discovers the **hidden centers** in these maps and
transforms them into **starting points** for writing.

Experience the moment when 15 notes collected over a month evolve into a single paper thesis.
