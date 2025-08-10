#!/usr/bin/env bun
/**
 * Consistency Validation Script
 *
 * Validates interface/implementation consistency to prevent future issues
 * during rebranding efforts, specifically checking:
 *
 * 1. BotProps interface vs parseReact* function parameters consistency
 * 2. Property name consistency (trigidigital vs typebot)
 * 3. Interface/implementation alignment
 */

import { readFileSync } from "fs";
import { glob } from "glob";
import * as ts from "typescript";

interface ValidationError {
  type:
    | "interface-mismatch"
    | "naming-inconsistency"
    | "implementation-mismatch";
  file: string;
  message: string;
  line?: number;
  column?: number;
  severity: "error" | "warning";
  code: string;
}

const ERROR_CODES = {
  INTERFACE_MISSING_PROPERTY: "INT001",
  INTERFACE_INVALID_TYPE: "INT002",
  NAMING_MIXED_REFERENCES: "NAM001",
  NAMING_WRONG_PARAMETER: "NAM002",
  IMPLEMENTATION_PARSE_ERROR: "IMP001",
  IMPLEMENTATION_MISMATCH: "IMP002",
  SCRIPT_MISSING: "SCR001",
  SCRIPT_INCONSISTENT: "SCR002",
  RESOURCE_CONFIG_MISSING: "RES001",
  RESOURCE_CONFIG_INVALID: "RES002",
} as const;

class ConsistencyValidator {
  private errors: ValidationError[] = [];

  async validate(): Promise<{ success: boolean; errors: ValidationError[] }> {
    console.log("🔍 Starting consistency validation...");

    // 1. Validate BotProps interface consistency
    await this.validateBotPropsConsistency();

    // 2. Check for trigidigital vs typebot naming consistency
    await this.validateNamingConsistency();

    // 3. Validate parseReact* function parameters
    await this.validateParseReactFunctions();

    // 4. Validate script distribution across packages
    await this.validateScriptDistribution();

    // 5. Validate resource configuration
    await this.validateResourceConfiguration();

    const success = this.errors.length === 0;

    if (success) {
      console.log("✅ All consistency validations passed!");
    } else {
      console.log(`❌ Found ${this.errors.length} consistency issues:`);
      this.errors.forEach((error) => {
        const location = error.line
          ? `:${error.line}${error.column ? `:${error.column}` : ""}`
          : "";
        const severityIcon = error.severity === "error" ? "❌" : "⚠️";
        console.log(
          `  ${severityIcon} [${error.code}] ${error.file}${location}`,
        );
        console.log(`      ${error.message}`);
      });
    }

    return { success, errors: this.errors };
  }

  private async validateBotPropsConsistency(): Promise<void> {
    console.log("📋 Validating BotProps interface consistency...");

    const botPropsFiles = await glob(
      "packages/embeds/js/src/components/Bot.tsx",
      { cwd: process.cwd() },
    );

    for (const file of botPropsFiles) {
      try {
        const content = readFileSync(file, "utf-8");

        // Use regex to find BotProps interface definition (both type and interface)
        const botPropsRegex =
          /export (?:type|interface) BotProps[^{]*\{([^}]+)\}/s;
        const match = botPropsRegex.exec(content);

        if (!match) {
          this.errors.push({
            type: "interface-mismatch",
            file,
            message: "BotProps interface not found",
            severity: "error",
            code: ERROR_CODES.INTERFACE_MISSING_PROPERTY,
          });
          continue;
        }

        const interfaceBody = match[1];

        // Check if trigidigital property exists
        const trigidigitalPropertyRegex =
          /trigidigital\s*[?:]?\s*([^;,\n]+)[;,]?/;
        const trigidigitalMatch = trigidigitalPropertyRegex.exec(interfaceBody);

        if (!trigidigitalMatch) {
          this.errors.push({
            type: "interface-mismatch",
            file,
            message: "trigidigital property not found in BotProps interface",
            severity: "error",
            code: ERROR_CODES.INTERFACE_MISSING_PROPERTY,
          });
        } else {
          const propertyType = trigidigitalMatch[1].trim();

          // Check if the type contains references to 'typebot' when it should use 'trigidigital'
          if (
            propertyType.includes("Typebot") &&
            !propertyType.includes("StartTypebot")
          ) {
            this.errors.push({
              type: "naming-inconsistency",
              file,
              message: `BotProps.trigidigital property type should use TrigiDigital types instead of Typebot: ${propertyType}`,
              severity: "warning",
              code: ERROR_CODES.INTERFACE_INVALID_TYPE,
            });
          }
        }

        // Check if there are any 'typebot' property names that should be 'trigidigital'
        const typebotPropertyRegex = /^\s*typebot\s*[?:]?\s*/m;
        if (typebotPropertyRegex.test(interfaceBody)) {
          this.errors.push({
            type: "naming-inconsistency",
            file,
            message:
              'BotProps interface contains "typebot" property that should likely be "trigidigital"',
            severity: "error",
            code: ERROR_CODES.NAMING_WRONG_PARAMETER,
          });
        }
      } catch (error) {
        this.errors.push({
          type: "implementation-mismatch",
          file,
          message: `Failed to parse file: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }
  }

  private async validateNamingConsistency(): Promise<void> {
    console.log("🏷️  Validating naming consistency...");

    // Focus on specific critical files for interface/prop consistency
    const criticalFiles = await glob(
      [
        "apps/builder/src/features/publish/components/embeds/snippetParsers/**/*.ts",
      ],
      { cwd: process.cwd() },
    );

    for (const file of criticalFiles) {
      try {
        const content = readFileSync(file, "utf-8");

        // Check specifically for function parameter names that should be consistent
        const parseReactFunctionRegex =
          /export const parseReact\w+Props = \({\s*([^}]+)\s*}/g;
        let match;

        while ((match = parseReactFunctionRegex.exec(content)) !== null) {
          const params = match[1];
          const functionStart = match.index;
          const lineNumber = content
            .substring(0, functionStart)
            .split("\n").length;

          // Check if parameters include both trigidigital and typebot (inconsistency)
          if (params.includes("trigidigital") && params.includes("typebot")) {
            this.errors.push({
              type: "naming-inconsistency",
              file,
              line: lineNumber,
              message: `parseReact function has inconsistent naming in parameters: both 'trigidigital' and 'typebot' found: ${params.trim()}`,
            });
          }

          // Check if parameters should use trigidigital but use typebot instead
          if (!params.includes("trigidigital") && params.includes("typebot")) {
            // Only flag if this looks like it should be a prop parameter (not a type reference)
            if (!/\b(StartTypebot|Typebot["'])\b/.test(params)) {
              this.errors.push({
                type: "naming-inconsistency",
                file,
                line: lineNumber,
                message: `parseReact function parameter uses 'typebot' where 'trigidigital' expected: ${params.trim()}`,
              });
            }
          }
        }
      } catch (error) {
        this.errors.push({
          type: "implementation-mismatch",
          file,
          message: `Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }
  }

  private async validateParseReactFunctions(): Promise<void> {
    console.log("⚛️  Validating parseReact* function parameters...");

    const parseReactFiles = await glob(
      [
        "apps/builder/src/features/publish/components/embeds/snippetParsers/**/*.ts",
      ],
      { cwd: process.cwd() },
    );

    for (const file of parseReactFiles) {
      try {
        const content = readFileSync(file, "utf-8");
        const sourceFile = ts.createSourceFile(
          file,
          content,
          ts.ScriptTarget.Latest,
          true,
        );

        // Find parseReact* functions
        const parseReactFunctions = this.findFunctionsStartingWith(
          sourceFile,
          "parseReact",
        );

        for (const func of parseReactFunctions) {
          const functionName = func.name?.getText();
          if (!functionName) continue;

          // Get function parameters
          const params = func.parameters;
          if (params.length === 0) continue;

          const firstParam = params[0];
          if (!firstParam.type || !ts.isTypeLiteralNode(firstParam.type))
            continue;

          // Check if the function parameter includes 'trigidigital'
          const paramText = firstParam.type.getText();

          if (
            paramText.includes("trigidigital") &&
            paramText.includes("typebot")
          ) {
            this.errors.push({
              type: "naming-inconsistency",
              file,
              message: `${functionName} parameter contains both 'trigidigital' and 'typebot' references: ${paramText}`,
            });
          } else if (
            !paramText.includes("trigidigital") &&
            !functionName.includes("Bot")
          ) {
            // Check if it should have trigidigital parameter
            const content = func.body?.getText() || "";
            if (content.includes("trigidigital")) {
              this.errors.push({
                type: "interface-mismatch",
                file,
                message: `${functionName} uses 'trigidigital' in body but doesn't have it in parameter type: ${paramText}`,
              });
            }
          }
        }
      } catch (error) {
        this.errors.push({
          type: "implementation-mismatch",
          file,
          message: `Failed to parse file: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }
  }

  private async validateScriptDistribution(): Promise<void> {
    console.log("📦 Validating script distribution...");

    try {
      // Read root package.json and turbo.json
      const rootPackageJson = JSON.parse(readFileSync("package.json", "utf-8"));
      const turboJson = JSON.parse(readFileSync("turbo.json", "utf-8"));

      // Get turbo tasks that should have corresponding scripts
      const turboTasks = Object.keys(turboJson.tasks || {});
      const criticalScripts = [
        "check-broken-links",
        "typecheck",
        "test",
        "build",
      ];

      // Check if critical turbo tasks have fallback scripts in root
      for (const task of criticalScripts) {
        if (turboTasks.includes(task)) {
          const hasRootScript =
            rootPackageJson.scripts && rootPackageJson.scripts[task];

          if (!hasRootScript && task === "check-broken-links") {
            // We specifically need this script to delegate to landing-page
            this.errors.push({
              type: "implementation-mismatch",
              file: "package.json",
              message: `Missing root script for turbo task "${task}" - needed for CI/CD pipeline`,
              severity: "error",
              code: ERROR_CODES.SCRIPT_MISSING,
            });
          }
        }
      }

      // Validate that turbo commands referenced in pre-commit hook exist
      const preCommitScript = rootPackageJson.scripts?.["pre-commit"];
      if (preCommitScript && typeof preCommitScript === "string") {
        const turboCommands = preCommitScript.match(/turbo run ([^&]+)/g);
        if (turboCommands) {
          for (const command of turboCommands) {
            const taskNames = command.replace("turbo run ", "").split(" ");
            for (const taskName of taskNames) {
              // Skip validation for root scripts that are not turbo tasks
              const isRootScript =
                rootPackageJson.scripts && rootPackageJson.scripts[taskName];
              if (!turboTasks.includes(taskName) && !isRootScript) {
                this.errors.push({
                  type: "implementation-mismatch",
                  file: "package.json",
                  message: `Pre-commit script references undefined turbo task: "${taskName}"`,
                  severity: "error",
                  code: ERROR_CODES.SCRIPT_INCONSISTENT,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      this.errors.push({
        type: "implementation-mismatch",
        file: "package.json/turbo.json",
        message: `Failed to validate script distribution: ${error instanceof Error ? error.message : "Unknown error"}`,
        severity: "error",
        code: ERROR_CODES.IMPLEMENTATION_PARSE_ERROR,
      });
    }
  }

  private async validateResourceConfiguration(): Promise<void> {
    console.log("⚙️  Validating resource configuration...");

    // Validate GitHub Actions workflows
    const workflowFiles = await glob(".github/workflows/*.yml", {
      cwd: process.cwd(),
    });

    for (const file of workflowFiles) {
      try {
        const content = readFileSync(file, "utf-8");

        // Check for proper timeout configuration
        if (!content.includes("timeout-minutes:")) {
          this.errors.push({
            type: "implementation-mismatch",
            file,
            message:
              "GitHub Actions workflow missing timeout-minutes configuration",
            severity: "warning",
            code: ERROR_CODES.RESOURCE_CONFIG_MISSING,
          });
        }

        // Check for NODE_OPTIONS memory configuration
        if (content.includes("turbo") || content.includes("typecheck")) {
          if (
            !content.includes("NODE_OPTIONS") ||
            !content.includes("max-old-space-size")
          ) {
            this.errors.push({
              type: "implementation-mismatch",
              file,
              message:
                "GitHub Actions workflow with TypeScript compilation missing NODE_OPTIONS memory configuration",
              severity: "error",
              code: ERROR_CODES.RESOURCE_CONFIG_MISSING,
            });
          }
        }

        // Note: ubuntu-latest automatically provides 4-core runners for public repositories in 2025
        // No validation needed for runner configuration as ubuntu-latest is optimal
      } catch (error) {
        this.errors.push({
          type: "implementation-mismatch",
          file,
          message: `Failed to validate workflow configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
          severity: "error",
          code: ERROR_CODES.IMPLEMENTATION_PARSE_ERROR,
        });
      }
    }

    // Validate Dockerfile memory configuration
    try {
      const dockerfilePath = "Dockerfile";
      const dockerfileContent = readFileSync(dockerfilePath, "utf-8");

      if (
        !dockerfileContent.includes("NODE_OPTIONS") ||
        !dockerfileContent.includes("max-old-space-size")
      ) {
        this.errors.push({
          type: "implementation-mismatch",
          file: dockerfilePath,
          message:
            "Dockerfile missing NODE_OPTIONS memory optimization for TypeScript compilation",
          severity: "error",
          code: ERROR_CODES.RESOURCE_CONFIG_MISSING,
        });
      }
    } catch (error) {
      // Dockerfile is optional for some projects
      console.log(
        "⚠️  Dockerfile not found or not readable - skipping Docker validation",
      );
    }
  }

  private findInterfaceDeclaration(
    sourceFile: ts.SourceFile,
    name: string,
  ): ts.InterfaceDeclaration | null {
    let result: ts.InterfaceDeclaration | null = null;

    const visit = (node: ts.Node) => {
      if (ts.isInterfaceDeclaration(node) && node.name.text === name) {
        result = node;
        return;
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return result;
  }

  private findInterfaceProperty(
    interfaceDecl: ts.InterfaceDeclaration,
    propertyName: string,
  ): ts.PropertySignature | null {
    for (const member of interfaceDecl.members) {
      if (
        ts.isPropertySignature(member) &&
        member.name &&
        ts.isIdentifier(member.name) &&
        member.name.text === propertyName
      ) {
        return member;
      }
    }
    return null;
  }

  private getPropertyTypeText(property: ts.PropertySignature): string {
    return property.type?.getText() || "";
  }

  private findFunctionsStartingWith(
    sourceFile: ts.SourceFile,
    prefix: string,
  ): ts.FunctionDeclaration[] {
    const functions: ts.FunctionDeclaration[] = [];

    const visit = (node: ts.Node): void => {
      if (
        ts.isFunctionDeclaration(node) &&
        node.name &&
        node.name.text.startsWith(prefix)
      ) {
        functions.push(node);
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return functions;
  }
}

// Main execution
async function main() {
  const validator = new ConsistencyValidator();
  const result = await validator.validate();

  if (!result.success) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Validation failed:", error);
    process.exit(1);
  });
}

export { ConsistencyValidator };
