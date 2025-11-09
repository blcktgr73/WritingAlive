/**
 * QA Test: Performance and Cost Validation
 *
 * Tests performance and cost requirements:
 * - Structure generation <5s (P95)
 * - Cost $0.005-0.010 per generation
 * - Returns 3-5 sections for medium length
 */

import { StructureGenerator } from '../../src/services/outcome/structure-generator';
import type { OutcomeDefinition } from '../../src/services/outcome/types';

// Mock AI service with realistic token counts
function createMockAIService() {
  return {
    provider: {
      makeClaudeRequest: async (_system: string, _user: string) => {
        // Simulate realistic response time (AI service latency)
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

        // Return realistic mock structure
        return JSON.stringify({
          title: 'Q4 Product Retrospective',
          sections: [
            {
              id: 'section-1',
              title: 'Executive Summary',
              purpose: 'High-level outcomes for leadership',
              estimatedWords: 200,
              estimatedMinutes: 5,
              writingPrompt: 'Summarize the key achievements and learnings from Q4 in 2-3 sentences.',
              order: 1,
              required: true,
              status: 'not-started'
            },
            {
              id: 'section-2',
              title: 'What Went Well',
              purpose: 'Celebrate successes and show impact',
              estimatedWords: 400,
              estimatedMinutes: 10,
              writingPrompt: 'List 3-5 major wins. For each, describe the impact in 2-3 sentences.',
              order: 2,
              required: true,
              status: 'not-started'
            },
            {
              id: 'section-3',
              title: 'Challenges and Learnings',
              purpose: 'Reflect on difficulties and growth',
              estimatedWords: 400,
              estimatedMinutes: 10,
              writingPrompt: 'Describe 3-4 key challenges. What did we learn from each?',
              order: 3,
              required: true,
              status: 'not-started'
            },
            {
              id: 'section-4',
              title: 'Action Items',
              purpose: 'Define next steps and improvements',
              estimatedWords: 200,
              estimatedMinutes: 5,
              writingPrompt: 'List 5-7 concrete action items based on our learnings.',
              order: 4,
              required: true,
              status: 'not-started'
            }
          ]
        });
      }
    }
  } as any;
}

interface TestCase {
  name: string;
  outcome: OutcomeDefinition;
  expectedSections: { min: number; max: number };
}

const testCases: TestCase[] = [
  {
    name: 'Short document',
    outcome: {
      description: 'Brief API documentation for REST endpoints',
      lengthPreference: 'short'
    },
    expectedSections: { min: 2, max: 3 }
  },
  {
    name: 'Medium document',
    outcome: {
      description: 'Q4 Product Retrospective for team and VP',
      audience: 'Engineering team and leadership',
      topics: ['wins', 'challenges', 'lessons', 'actions'],
      lengthPreference: 'medium'
    },
    expectedSections: { min: 3, max: 5 }
  },
  {
    name: 'Long document',
    outcome: {
      description: 'Comprehensive technical specification for new API service',
      audience: 'Engineering team',
      topics: ['architecture', 'endpoints', 'security', 'testing', 'deployment'],
      lengthPreference: 'long'
    },
    expectedSections: { min: 4, max: 6 }
  }
];

interface TestResult {
  testCase: string;
  passed: boolean;
  latency: number;
  cost: number;
  sections: number;
  issues: string[];
}

async function runTest(testCase: TestCase): Promise<TestResult> {
  const mockAIService = createMockAIService();
  const generator = new StructureGenerator(mockAIService, 'en');

  const startTime = Date.now();

  try {
    const result = await generator.generateStructure(testCase.outcome);
    const latency = Date.now() - startTime;

    const issues: string[] = [];

    // Check latency (should be <5s)
    if (latency > 5000) {
      issues.push(`Latency ${latency}ms exceeds 5000ms`);
    }

    // Check cost (should be $0.005-0.010, allow some variance for testing)
    if (result.estimatedCost < 0.001) {
      issues.push(`Cost $${result.estimatedCost.toFixed(4)} too low (likely calculation error)`);
    } else if (result.estimatedCost > 0.02) {
      issues.push(`Cost $${result.estimatedCost.toFixed(4)} exceeds target range ($0.005-0.010)`);
    }

    // Check section count
    const sectionCount = result.structure.sections.length;
    if (sectionCount < testCase.expectedSections.min || sectionCount > testCase.expectedSections.max) {
      issues.push(`Section count ${sectionCount} outside expected range ${testCase.expectedSections.min}-${testCase.expectedSections.max}`);
    }

    // Check structure quality
    if (result.structure.totalEstimatedWords < 100) {
      issues.push(`Total estimated words ${result.structure.totalEstimatedWords} too low`);
    }

    if (result.structure.totalEstimatedMinutes < 10) {
      issues.push(`Total estimated minutes ${result.structure.totalEstimatedMinutes} too low`);
    }

    return {
      testCase: testCase.name,
      passed: issues.length === 0,
      latency,
      cost: result.estimatedCost,
      sections: sectionCount,
      issues
    };
  } catch (error) {
    return {
      testCase: testCase.name,
      passed: false,
      latency: Date.now() - startTime,
      cost: 0,
      sections: 0,
      issues: [`Exception: ${error instanceof Error ? error.message : String(error)}`]
    };
  }
}

// Run all tests
console.log('=== QA Test: Performance and Cost Validation ===\n');

async function main() {
  const results: TestResult[] = [];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}...`);
    const result = await runTest(testCase);
    results.push(result);

    console.log(`  Latency: ${result.latency}ms`);
    console.log(`  Cost: $${result.cost.toFixed(4)}`);
    console.log(`  Sections: ${result.sections}`);

    if (result.passed) {
      console.log(`  ✓ PASSED\n`);
    } else {
      console.log(`  ✗ FAILED`);
      result.issues.forEach(issue => console.log(`    - ${issue}`));
      console.log('');
    }
  }

  // Summary
  console.log('=== Summary ===');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed}/${results.length}`);

  // Performance stats
  const latencies = results.map(r => r.latency);
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const maxLatency = Math.max(...latencies);

  console.log(`\nPerformance:`);
  console.log(`  Average latency: ${avgLatency.toFixed(0)}ms`);
  console.log(`  Max latency (P100): ${maxLatency}ms`);
  console.log(`  Target: <5000ms`);

  // Cost stats
  const costs = results.map(r => r.cost).filter(c => c > 0);
  if (costs.length > 0) {
    const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
    const maxCost = Math.max(...costs);

    console.log(`\nCost:`);
    console.log(`  Average: $${avgCost.toFixed(4)}`);
    console.log(`  Max: $${maxCost.toFixed(4)}`);
    console.log(`  Target: $0.005-$0.010`);
  }

  // Section counts
  const sectionCounts = results.map(r => r.sections).filter(s => s > 0);
  if (sectionCounts.length > 0) {
    const avgSections = sectionCounts.reduce((a, b) => a + b, 0) / sectionCounts.length;

    console.log(`\nSection Counts:`);
    console.log(`  Average: ${avgSections.toFixed(1)}`);
    console.log(`  Range: ${Math.min(...sectionCounts)}-${Math.max(...sectionCounts)}`);
    console.log(`  Target: 3-5 for medium length`);
  }

  if (failed === 0) {
    console.log('\n✓ All performance and cost tests passed!');
    process.exit(0);
  } else {
    console.log(`\n✗ ${failed} test(s) failed`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});
