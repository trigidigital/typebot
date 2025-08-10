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

import { readFileSync } from 'fs';
import { glob } from 'glob';
import * as ts from 'typescript';

interface ValidationError {
  type: 'interface-mismatch' | 'naming-inconsistency' | 'implementation-mismatch';
  file: string;
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
  code: string;
}

const ERROR_CODES = {
  INTERFACE_MISSING_PROPERTY: 'INT001',
  INTERFACE_INVALID_TYPE: 'INT002', 
  NAMING_MIXED_REFERENCES: 'NAM001',
  NAMING_WRONG_PARAMETER: 'NAM002',
  IMPLEMENTATION_PARSE_ERROR: 'IMP001',
  IMPLEMENTATION_MISMATCH: 'IMP002'
} as const;

class ConsistencyValidator {
  private errors: ValidationError[] = [];

  async validate(): Promise<{ success: boolean; errors: ValidationError[] }> {
    console.log('🔍 Starting consistency validation...');

    // 1. Validate BotProps interface consistency
    await this.validateBotPropsConsistency();

    // 2. Check for trigidigital vs typebot naming consistency
    await this.validateNamingConsistency();

    // 3. Validate parseReact* function parameters
    await this.validateParseReactFunctions();

    const success = this.errors.length === 0;
    
    if (success) {
      console.log('✅ All consistency validations passed!');
    } else {
      console.log(`❌ Found ${this.errors.length} consistency issues:`);
      this.errors.forEach(error => {
        const location = error.line ? `:${error.line}${error.column ? `:${error.column}` : ''}` : '';
        const severityIcon = error.severity === 'error' ? '❌' : '⚠️';
        console.log(`  ${severityIcon} [${error.code}] ${error.file}${location}`);
        console.log(`      ${error.message}`);
      });
    }

    return { success, errors: this.errors };
  }

  private async validateBotPropsConsistency(): Promise<void> {
    console.log('📋 Validating BotProps interface consistency...');

    const botPropsFiles = await glob('packages/embeds/js/src/components/Bot.tsx', { cwd: process.cwd() });
    
    for (const file of botPropsFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        
        // Use regex to find BotProps interface definition
        const botPropsRegex = /export type BotProps = \{([^}]+)\}/s;
        const match = botPropsRegex.exec(content);
        
        if (!match) {
          this.errors.push({
            type: 'interface-mismatch',
            file,
            message: 'BotProps interface not found',
            severity: 'error',
            code: ERROR_CODES.INTERFACE_MISSING_PROPERTY
          });
          continue;
        }

        const interfaceBody = match[1];
        
        // Check if trigidigital property exists
        const trigidigitalPropertyRegex = /trigidigital\s*[?:]?\s*([^;,\n]+)[;,]?/;
        const trigidigitalMatch = trigidigitalPropertyRegex.exec(interfaceBody);
        
        if (!trigidigitalMatch) {
          this.errors.push({
            type: 'interface-mismatch',
            file,
            message: 'trigidigital property not found in BotProps interface',
            severity: 'error',
            code: ERROR_CODES.INTERFACE_MISSING_PROPERTY
          });
        } else {
          const propertyType = trigidigitalMatch[1].trim();
          
          // Check if the type contains references to 'typebot' when it should use 'trigidigital' 
          if (propertyType.includes('Typebot') && !propertyType.includes('StartTypebot')) {
            this.errors.push({
              type: 'naming-inconsistency',
              file,
              message: `BotProps.trigidigital property type should use TrigiDigital types instead of Typebot: ${propertyType}`,
              severity: 'warning',
              code: ERROR_CODES.INTERFACE_INVALID_TYPE
            });
          }
        }

        // Check if there are any 'typebot' property names that should be 'trigidigital'
        const typebotPropertyRegex = /^\s*typebot\s*[?:]?\s*/m;
        if (typebotPropertyRegex.test(interfaceBody)) {
          this.errors.push({
            type: 'naming-inconsistency',
            file,
            message: 'BotProps interface contains "typebot" property that should likely be "trigidigital"',
            severity: 'error',
            code: ERROR_CODES.NAMING_WRONG_PARAMETER
          });
        }
        
      } catch (error) {
        this.errors.push({
          type: 'implementation-mismatch',
          file,
          message: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
  }

  private async validateNamingConsistency(): Promise<void> {
    console.log('🏷️  Validating naming consistency...');

    // Focus on specific critical files for interface/prop consistency
    const criticalFiles = await glob([
      'apps/builder/src/features/publish/components/embeds/snippetParsers/**/*.ts'
    ], { cwd: process.cwd() });

    for (const file of criticalFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        
        // Check specifically for function parameter names that should be consistent
        const parseReactFunctionRegex = /export const parseReact\w+Props = \({\s*([^}]+)\s*}/g;
        let match;
        
        while ((match = parseReactFunctionRegex.exec(content)) !== null) {
          const params = match[1];
          const functionStart = match.index;
          const lineNumber = content.substring(0, functionStart).split('\n').length;
          
          // Check if parameters include both trigidigital and typebot (inconsistency)
          if (params.includes('trigidigital') && params.includes('typebot')) {
            this.errors.push({
              type: 'naming-inconsistency',
              file,
              line: lineNumber,
              message: `parseReact function has inconsistent naming in parameters: both 'trigidigital' and 'typebot' found: ${params.trim()}`
            });
          }
          
          // Check if parameters should use trigidigital but use typebot instead
          if (!params.includes('trigidigital') && params.includes('typebot')) {
            // Only flag if this looks like it should be a prop parameter (not a type reference)
            if (!/\b(StartTypebot|Typebot["'])\b/.test(params)) {
              this.errors.push({
                type: 'naming-inconsistency',
                file,
                line: lineNumber,
                message: `parseReact function parameter uses 'typebot' where 'trigidigital' expected: ${params.trim()}`
              });
            }
          }
        }
      } catch (error) {
        this.errors.push({
          type: 'implementation-mismatch',
          file,
          message: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
  }

  private async validateParseReactFunctions(): Promise<void> {
    console.log('⚛️  Validating parseReact* function parameters...');

    const parseReactFiles = await glob([
      'apps/builder/src/features/publish/components/embeds/snippetParsers/**/*.ts'
    ], { cwd: process.cwd() });

    for (const file of parseReactFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);

        // Find parseReact* functions
        const parseReactFunctions = this.findFunctionsStartingWith(sourceFile, 'parseReact');
        
        for (const func of parseReactFunctions) {
          const functionName = func.name?.getText();
          if (!functionName) continue;

          // Get function parameters
          const params = func.parameters;
          if (params.length === 0) continue;

          const firstParam = params[0];
          if (!firstParam.type || !ts.isTypeLiteralNode(firstParam.type)) continue;

          // Check if the function parameter includes 'trigidigital'
          const paramText = firstParam.type.getText();
          
          if (paramText.includes('trigidigital') && paramText.includes('typebot')) {
            this.errors.push({
              type: 'naming-inconsistency',
              file,
              message: `${functionName} parameter contains both 'trigidigital' and 'typebot' references: ${paramText}`
            });
          } else if (!paramText.includes('trigidigital') && !functionName.includes('Bot')) {
            // Check if it should have trigidigital parameter
            const content = func.body?.getText() || '';
            if (content.includes('trigidigital')) {
              this.errors.push({
                type: 'interface-mismatch',
                file,
                message: `${functionName} uses 'trigidigital' in body but doesn't have it in parameter type: ${paramText}`
              });
            }
          }
        }
      } catch (error) {
        this.errors.push({
          type: 'implementation-mismatch',
          file,
          message: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
  }

  private findInterfaceDeclaration(sourceFile: ts.SourceFile, name: string): ts.InterfaceDeclaration | null {
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

  private findInterfaceProperty(interfaceDecl: ts.InterfaceDeclaration, propertyName: string): ts.PropertySignature | null {
    for (const member of interfaceDecl.members) {
      if (ts.isPropertySignature(member) && 
          member.name && 
          ts.isIdentifier(member.name) && 
          member.name.text === propertyName) {
        return member;
      }
    }
    return null;
  }

  private getPropertyTypeText(property: ts.PropertySignature): string {
    return property.type?.getText() || '';
  }

  private findFunctionsStartingWith(sourceFile: ts.SourceFile, prefix: string): ts.FunctionDeclaration[] {
    const functions: ts.FunctionDeclaration[] = [];
    
    const visit = (node: ts.Node): void => {
      if (ts.isFunctionDeclaration(node) && 
          node.name && 
          node.name.text.startsWith(prefix)) {
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
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

export { ConsistencyValidator };