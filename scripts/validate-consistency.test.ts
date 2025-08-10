#!/usr/bin/env bun
/**
 * Tests for Consistency Validation Script
 *
 * Comprehensive test suite with unit tests and integration tests
 * for the consistency validation system.
 */

import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { ConsistencyValidator } from "./validate-consistency";

interface TestCase {
  name: string;
  description: string;
  setup: () => void;
  cleanup: () => void;
  expectedErrors: Array<{
    type:
      | "interface-mismatch"
      | "naming-inconsistency"
      | "implementation-mismatch";
    file: string;
    messageContains: string;
  }>;
}

class ConsistencyValidatorTest {
  private tempFiles: string[] = [];

  /**
   * Create a temporary file for testing
   */
  private createTempFile(relativePath: string, content: string): string {
    const fullPath = join(process.cwd(), relativePath);
    writeFileSync(fullPath, content);
    this.tempFiles.push(fullPath);
    return fullPath;
  }

  /**
   * Clean up all temporary files
   */
  private cleanupTempFiles(): void {
    this.tempFiles.forEach((file) => {
      try {
        unlinkSync(file);
      } catch (error) {
        // Ignore cleanup errors
      }
    });
    this.tempFiles = [];
  }

  /**
   * Run all test cases
   */
  async runTests(): Promise<boolean> {
    console.log("🧪 Running consistency validation test suite...");

    const testCases: TestCase[] = [
      {
        name: "Interface Validation - Missing trigidigital property",
        description:
          "Should detect when BotProps interface is missing trigidigital property",
        setup: () => {
          this.createTempFile(
            "packages/embeds/js/src/components/Bot.tsx",
            `
            export type BotProps = {
              id?: string;
              // Missing trigidigital property
              isPreview?: boolean;
            };
          `,
          );
        },
        cleanup: () => this.cleanupTempFiles(),
        expectedErrors: [
          {
            type: "interface-mismatch",
            file: "packages/embeds/js/src/components/Bot.tsx",
            messageContains: "trigidigital property not found",
          },
        ],
      },

      {
        name: "Naming Consistency - Mixed trigidigital/typebot in function",
        description:
          "Should detect mixed naming in parseReact function parameters",
        setup: () => {
          this.createTempFile(
            "apps/builder/src/features/publish/components/embeds/snippetParsers/test.ts",
            `
            export const parseReactTestProps = ({
              trigidigital,
              typebot,  // This should be flagged as inconsistent
              customDomain
            }) => {
              return 'test';
            };
          `,
          );
        },
        cleanup: () => this.cleanupTempFiles(),
        expectedErrors: [
          {
            type: "naming-inconsistency",
            file: "apps/builder/src/features/publish/components/embeds/snippetParsers/test.ts",
            messageContains: "inconsistent naming in parameters",
          },
        ],
      },
    ];

    let allTestsPassed = true;

    for (const testCase of testCases) {
      console.log(`\n📋 Running: ${testCase.name}`);
      console.log(`   ${testCase.description}`);

      try {
        // Setup
        testCase.setup();

        // Run validation
        const validator = new ConsistencyValidator();
        const result = await validator.validate();

        // Verify expected errors
        let testPassed = true;

        for (const expectedError of testCase.expectedErrors) {
          const matchingError = result.errors.find(
            (error) =>
              error.type === expectedError.type &&
              error.file.includes(expectedError.file) &&
              error.message.includes(expectedError.messageContains),
          );

          if (!matchingError) {
            console.log(
              `   ❌ Expected error not found: ${expectedError.messageContains}`,
            );
            testPassed = false;
          } else {
            console.log(
              `   ✅ Found expected error: ${expectedError.messageContains}`,
            );
          }
        }

        if (testPassed) {
          console.log(`   ✅ ${testCase.name} passed`);
        } else {
          console.log(`   ❌ ${testCase.name} failed`);
          allTestsPassed = false;
        }

        // Cleanup
        testCase.cleanup();
      } catch (error) {
        console.log(
          `   ❌ ${testCase.name} threw error: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        allTestsPassed = false;
        testCase.cleanup();
      }
    }

    return allTestsPassed;
  }

  /**
   * Integration test that validates the current codebase
   */
  async runIntegrationTest(): Promise<boolean> {
    console.log("\n🔄 Running integration test on current codebase...");

    const validator = new ConsistencyValidator();
    const result = await validator.validate();

    if (result.success) {
      console.log(
        "✅ Integration test passed - current codebase validation works correctly",
      );
      return true;
    } else {
      console.log(
        "❌ Integration test failed - current codebase has consistency issues",
      );
      result.errors.forEach((error) => {
        console.log(`  - ${error.type}: ${error.file} - ${error.message}`);
      });
      return false;
    }
  }

  /**
   * Performance test to ensure validation runs quickly
   */
  async runPerformanceTest(): Promise<boolean> {
    console.log("\n⏱️  Running performance test...");

    const startTime = Date.now();
    const validator = new ConsistencyValidator();
    await validator.validate();
    const endTime = Date.now();

    const duration = endTime - startTime;
    const TARGET_MAX_DURATION = 5000; // 5 seconds for safety margin under 30s requirement

    if (duration < TARGET_MAX_DURATION) {
      console.log(
        `✅ Performance test passed - validation completed in ${duration}ms (target: <${TARGET_MAX_DURATION}ms)`,
      );
      return true;
    } else {
      console.log(
        `❌ Performance test failed - validation took ${duration}ms (target: <${TARGET_MAX_DURATION}ms)`,
      );
      return false;
    }
  }
}

// Main test execution
async function main() {
  const tester = new ConsistencyValidatorTest();

  try {
    const unitTestsPassed = await tester.runTests();
    const integrationTestPassed = await tester.runIntegrationTest();
    const performanceTestPassed = await tester.runPerformanceTest();

    const allTestsPassed =
      unitTestsPassed && integrationTestPassed && performanceTestPassed;

    console.log("\n📊 Test Summary:");
    console.log(
      `   Unit Tests: ${unitTestsPassed ? "✅ PASSED" : "❌ FAILED"}`,
    );
    console.log(
      `   Integration Test: ${integrationTestPassed ? "✅ PASSED" : "❌ FAILED"}`,
    );
    console.log(
      `   Performance Test: ${performanceTestPassed ? "✅ PASSED" : "❌ FAILED"}`,
    );
    console.log(
      `   Overall: ${allTestsPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"}`,
    );

    return allTestsPassed;
  } catch (error) {
    console.error("❌ Test suite execution failed:", error);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Test execution failed:", error);
      process.exit(1);
    });
}
