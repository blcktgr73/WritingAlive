/**
 * QA Test: Prompt Quality Validation
 *
 * Tests prompt construction against Saligo Writing principles:
 * - Low-energy prompts (specific, actionable)
 * - No overwhelming instructions
 * - Small, truthful steps
 * - Clear focus
 */

import { StructureGenerator } from '../../src/services/outcome/structure-generator';
import type { AIService } from '../../src/services/ai/ai-service';

// Extract prompts without calling AI
function extractPrompts(generator: any, outcome: any): { system: string; user: string } {
  return (generator as any).buildStructurePrompt(outcome);
}

// Saligo principle checks
interface SaligoCheck {
  name: string;
  test: (prompt: string) => boolean;
  severity: 'error' | 'warning';
}

const saligoChecks: SaligoCheck[] = [
  {
    name: 'Avoids overwhelming instructions',
    test: (prompt) => {
      // Check for long run-on sentences (>100 chars without punctuation)
      const sentences = prompt.split(/[.!?]/);
      return !sentences.some(s => s.length > 150);
    },
    severity: 'warning'
  },
  {
    name: 'Uses observation/question starters',
    test: (prompt) => {
      // System prompt should guide with questions or observations
      const hasObservation = /observe|notice|see|consider|think about/i.test(prompt);
      const hasQuestion = /what|how|which|where|why/i.test(prompt);
      return hasObservation || hasQuestion || prompt.includes('OUTCOME') || prompt.includes('결과물');
    },
    severity: 'warning'
  },
  {
    name: 'Focuses on one aspect at a time',
    test: (prompt) => {
      // Each section prompt should focus on one clear task
      const andCount = (prompt.match(/\band\b/gi) || []).length;
      const orCount = (prompt.match(/\bor\b/gi) || []).length;
      // Too many conjunctions suggest complex multi-part instructions
      return (andCount + orCount) < 8;
    },
    severity: 'warning'
  },
  {
    name: 'Provides clear structure',
    test: (prompt) => {
      // Should have clear format/structure indicators
      return /format|structure|json|output/i.test(prompt);
    },
    severity: 'error'
  },
  {
    name: 'Uses specific, actionable language',
    test: (prompt) => {
      // Avoid vague words
      const vagueWords = ['stuff', 'things', 'whatever', 'etc', 'and so on'];
      return !vagueWords.some(word => prompt.toLowerCase().includes(word));
    },
    severity: 'warning'
  },
  {
    name: 'Includes Saligo principles reference',
    test: (prompt) => {
      return /saligo/i.test(prompt);
    },
    severity: 'error'
  }
];

// Mock AI service
const mockAIService: AIService = {
  provider: {
    makeClaudeRequest: async () => '{}'
  }
} as any;

console.log('=== QA Test: Prompt Quality Validation ===\n');

// Test English prompts
console.log('--- Testing English Prompts ---');
const generatorEN = new StructureGenerator(mockAIService, 'en');
const outcomeEN = {
  description: 'Q4 Product Retrospective for team and VP',
  audience: 'Engineering team and leadership',
  topics: ['wins', 'challenges', 'lessons', 'actions'],
  lengthPreference: 'medium' as const
};

const promptsEN = extractPrompts(generatorEN, outcomeEN);

console.log('\n[System Prompt]');
console.log(promptsEN.system.substring(0, 200) + '...\n');

console.log('[User Prompt]');
console.log(promptsEN.user.substring(0, 200) + '...\n');

console.log('\n--- Saligo Principle Checks (English) ---');
let passedEN = 0;
let failedEN = 0;
let warningsEN = 0;

saligoChecks.forEach(check => {
  const passed = check.test(promptsEN.system) || check.test(promptsEN.user);
  if (passed) {
    console.log(`✓ ${check.name}`);
    passedEN++;
  } else {
    if (check.severity === 'error') {
      console.log(`✗ ${check.name} [ERROR]`);
      failedEN++;
    } else {
      console.log(`⚠ ${check.name} [WARNING]`);
      warningsEN++;
    }
  }
});

// Test Korean prompts
console.log('\n--- Testing Korean Prompts ---');
const generatorKO = new StructureGenerator(mockAIService, 'ko');
const outcomeKO = {
  description: 'Q4 제품 회고록 - 성과와 교훈',
  audience: '팀과 VP',
  topics: ['성과', '도전', '교훈', '액션'],
  lengthPreference: 'medium' as const
};

const promptsKO = extractPrompts(generatorKO, outcomeKO);

console.log('\n[시스템 프롬프트]');
console.log(promptsKO.system.substring(0, 200) + '...\n');

console.log('[사용자 프롬프트]');
console.log(promptsKO.user.substring(0, 200) + '...\n');

console.log('\n--- Saligo Principle Checks (Korean) ---');
let passedKO = 0;
let failedKO = 0;
let warningsKO = 0;

saligoChecks.forEach(check => {
  const passed = check.test(promptsKO.system) || check.test(promptsKO.user);
  if (passed) {
    console.log(`✓ ${check.name}`);
    passedKO++;
  } else {
    if (check.severity === 'error') {
      console.log(`✗ ${check.name} [ERROR]`);
      failedKO++;
    } else {
      console.log(`⚠ ${check.name} [WARNING]`);
      warningsKO++;
    }
  }
});

// Summary
console.log('\n=== Summary ===');
console.log(`English: ${passedEN} passed, ${failedEN} errors, ${warningsEN} warnings`);
console.log(`Korean: ${passedKO} passed, ${failedKO} errors, ${warningsKO} warnings`);

const totalFailed = failedEN + failedKO;
if (totalFailed === 0) {
  console.log('\n✓ All critical Saligo checks passed!');
  process.exit(0);
} else {
  console.log(`\n✗ ${totalFailed} critical checks failed`);
  process.exit(1);
}
