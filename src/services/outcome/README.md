# Outcome-Driven Writing Service

AI-powered document structure generation using Saligo Writing principles.

## Overview

The Outcome-Driven Writing service enables writers to:
1. Define their writing goal (outcome)
2. Receive AI-generated section-based structure
3. Write incrementally with low-energy prompts
4. Track progress in real-time

## Architecture

### SOLID Principles Applied

**Single Responsibility**
- `OutcomeManager`: Outcome validation and document lifecycle
- `StructureGenerator`: AI-powered structure generation only
- `types.ts`: Data structures with no business logic

**Open/Closed**
- Extensible through prompt strategies
- New document types added via configuration
- Cost calculation abstracted for different AI providers

**Liskov Substitution**
- Works with any AIProvider implementation
- Can swap AI backends without changing business logic

**Interface Segregation**
- Focused public APIs with minimal methods
- Clear separation of concerns

**Dependency Inversion**
- Depends on AIService abstraction, not concrete providers
- Vault abstraction for file operations

## Components

### 1. OutcomeManager (`outcome-manager.ts`)

Manages outcome operations including validation and document creation.

**Key Methods:**
- `validateOutcome(outcome)` - Validate outcome quality
- `detectDocumentType(description)` - Auto-detect document type
- `createOutcomeDocument(outcome, structure)` - Create document with metadata
- `getOutcome(file)` - Read outcome metadata from document
- `updateProgress(file, progress)` - Update writing progress

**Usage:**
```typescript
const manager = new OutcomeManager(vault);

// Validate outcome
const validation = manager.validateOutcome({
  description: "Q4 Product Retrospective for team and VP",
  audience: "Engineering team and leadership",
  topics: ["wins", "challenges", "lessons", "actions"],
  lengthPreference: "medium"
});

if (!validation.valid) {
  console.error(validation.errors);
  return;
}

// Create document
const file = await manager.createOutcomeDocument(
  outcome,
  structure,
  { folder: "Drafts" }
);
```

### 2. StructureGenerator (`structure-generator.ts`)

AI-powered document structure generation using Claude Sonnet 4.5.

**Key Methods:**
- `generateStructure(outcome)` - Generate initial structure
- `regenerateStructure(outcome, options)` - Refine with feedback

**Performance Targets:**
- Latency: <5 seconds P95
- Cost: $0.005-0.010 per generation
- Quality: 3-5 sections with actionable prompts

**Usage:**
```typescript
const generator = new StructureGenerator(aiService, 'en');

// Generate structure
const result = await generator.generateStructure({
  description: "Q4 Product Retrospective for team and VP",
  audience: "Engineering team and leadership",
  topics: ["wins", "challenges", "lessons", "actions"],
  lengthPreference: "medium"
});

console.log(result.structure.title); // "Q4 Product Retrospective"
console.log(result.structure.sections.length); // 4
console.log(result.estimatedCost); // 0.008
```

**Regeneration with Feedback:**
```typescript
const refined = await generator.regenerateStructure(outcome, {
  previousStructure: result.structure,
  feedback: "Make sections shorter, add technical details section"
});
```

### 3. Types (`types.ts`)

Type definitions for outcome-driven writing.

**Core Types:**
- `OutcomeDefinition` - User's writing goal and context
- `DocumentStructure` - AI-generated section-based structure
- `DocumentSection` - Individual writing unit with prompts
- `SectionProgress` - Real-time progress tracking
- `OutcomeDocumentMetadata` - Extended document metadata

## AI Prompt Strategy

### Structure Generation Prompt

The prompt follows Saligo Writing principles:

**System Prompt:**
- Methodology: Saligo Writing (low-energy prompts, small steps)
- Output format: JSON with strict schema
- Constraints: 2-6 sections, realistic estimates

**User Prompt:**
- Outcome description
- Audience and topics
- Length preference (short/medium/long)
- Document type (if detected)

**Example Prompt:**
```
OUTCOME: Q4 Product Retrospective for team and VP
AUDIENCE: Engineering team and leadership
TOPICS: wins, challenges, lessons, actions
LENGTH: medium → 3-5 sections, 1000-1500 words

REQUIREMENTS:
1. Create sections that achieve the outcome
2. Each section: title, purpose, low-energy writing prompt, realistic estimates
3. Structure flows naturally (intro → development → conclusion)
...
```

### Saligo Principles in Prompts

1. **Start with observation or question**
   - "Summarize the key achievement..." (not "Write 500 words about...")

2. **Allow small, truthful steps**
   - "List 3-5 major wins" (not "Comprehensive analysis of all achievements")

3. **Avoid overwhelming instructions**
   - Clear, focused prompts per section

4. **Focus on one aspect at a time**
   - Each section has single, clear purpose

## Cost Tracking

### Claude Sonnet 4.5 Pricing

- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

### Typical Costs

**Structure Generation:**
- Short (2-3 sections): $0.005-0.007
- Medium (3-5 sections): $0.007-0.010
- Long (4-6 sections): $0.010-0.015

**Cost Calculation:**
```typescript
const inputCost = (promptTokens / 1_000_000) * 3.0;
const outputCost = (completionTokens / 1_000_000) * 15.0;
const totalCost = inputCost + outputCost;
```

## Multilingual Support

### Supported Languages

- **English (en)**: Default
- **Korean (ko)**: Full support

### Language-Specific Features

**Korean Mode:**
- Korean system prompts
- Korean section titles and prompts
- Korean validation messages

**Usage:**
```typescript
const generator = new StructureGenerator(aiService, 'ko');

const result = await generator.generateStructure({
  description: "Q4 제품 회고록",
  audience: "팀과 VP",
  topics: ["성과", "도전", "교훈", "액션"],
  lengthPreference: "medium"
});

// Result in Korean
console.log(result.structure.title); // "Q4 제품 회고록"
console.log(result.structure.sections[0].title); // "요약"
```

## Validation

### Outcome Validation

**Required Checks:**
- Description length: 50-500 characters
- No vague keywords: "something", "stuff", "things"
- Specificity: Document type or clear topic

**Example Validation:**
```typescript
const validation = manager.validateOutcome({
  description: "Write something about product"
});

// validation.valid = false
// validation.errors = ["Outcome description too short..."]
// validation.warnings = ["Contains vague keyword: 'something'"]
```

### Structure Validation

**Constraints:**
- Section count: 2-6 sections
- Total time: 10-90 minutes
- Section time: 3-20 minutes per section
- Section words: 100-1000 words per section

## Error Handling

### OutcomeError Types

- `VALIDATION_FAILED` - Outcome validation failed
- `INVALID_STRUCTURE` - Document structure invalid
- `METADATA_PARSE_ERROR` - Failed to parse outcome metadata
- `METADATA_WRITE_ERROR` - Failed to write outcome metadata
- `UNKNOWN_ERROR` - Unexpected error

**Example:**
```typescript
try {
  const result = await generator.generateStructure(outcome);
} catch (error) {
  if (error instanceof OutcomeError) {
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Context:', error.context);
  }
}
```

## Testing

### Test Coverage

**StructureGenerator Tests (`structure-generator.test.ts`):**
- ✅ Structure generation from outcomes
- ✅ Korean/English prompt construction
- ✅ Length preference handling
- ✅ Structure validation (section count, time)
- ✅ Cost calculation
- ✅ Regeneration with feedback
- ✅ Error handling (AI failure, invalid JSON, validation)

**Run Tests:**
```bash
npm test -- structure-generator.test.ts
```

### Example Test

```typescript
it('should generate valid structure from outcome', async () => {
  const result = await generator.generateStructure({
    description: 'Q4 Product Retrospective for team and VP',
    audience: 'Engineering team and leadership',
    topics: ['wins', 'challenges', 'lessons', 'actions'],
    lengthPreference: 'medium',
  });

  expect(result.structure.title).toBe('Q4 Product Retrospective');
  expect(result.structure.sections).toHaveLength(4);
  expect(result.estimatedCost).toBeLessThan(0.02);
});
```

## Performance Metrics

### Latency Targets

- Structure generation: <5 seconds P95
- Document creation: <500ms
- Progress update: <200ms

### Cost Targets

- Structure generation: $0.005-0.010
- Regeneration: $0.005-0.010

### Quality Metrics

- Section count: 3-5 (typical)
- Prompt actionability: >90% (subjective)
- User satisfaction: >80% (future metric)

## Future Enhancements

### Planned Features

1. **Section Templates**
   - Predefined section templates for common document types
   - User-customizable templates

2. **AI-Assisted Writing**
   - Real-time writing suggestions per section
   - Auto-expand from bullet points

3. **Progress Analytics**
   - Writing velocity tracking
   - Section completion patterns
   - Cost per document analytics

4. **Multi-Document Support**
   - Generate series of related documents
   - Cross-document consistency checking

5. **Advanced Regeneration**
   - Section-level regeneration
   - Merge multiple structure variations

## Related Documentation

- [Technical Design: Outcome-Driven Mode](../../docs/TECHNICAL-DESIGN-MODE2-OUTCOME-DRIVEN.md)
- [AI Service Documentation](../ai/README.md)
- [Transformation Log](../../docs/TRANSFORMATIONS.md)

## Transformation History

- **T-028**: Outcome Manager implementation (validation, document creation)
- **T-029**: Structure Generator implementation (AI prompts, cost tracking)
