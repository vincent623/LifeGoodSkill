/**
 * Mermaid Syntax Validator
 * Based on mermaid-visualizer syntax rules with fixes from life-mermaid-master experience
 */

export class Validator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  validate(code) {
    this.errors = [];
    this.warnings = [];

    this.checkListSyntax(code);
    this.checkSubgraphNaming(code);
    this.checkNodeReferences(code);
    this.checkSpecialCharacters(code);
    this.checkArrowSyntax(code);
    this.checkBrackets(code);
    this.checkClassDef(code);

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  /**
   * Rule 1: Avoid "number. space" patterns in node text
   * Example: [1. Perception] triggers "Unsupported markdown: list"
   */
  checkListSyntax(code) {
    const listPattern = /\[\d+\.\s+[^\]]+\]/g;
    const matches = code.match(listPattern);
    if (matches) {
      this.warnings.push(`Found list-like syntax in node text: ${matches[0]}. Use [1.Text] instead of [1. Text]`);
    }
  }

  /**
   * Rule 2: Subgraph naming - use ID["display name"] format
   */
  checkSubgraphNaming(code) {
    const subgraphPattern = /subgraph\s+(\w+)\s+"([^"]+)"/g;
    let match;
    while ((match = code.match(subgraphPattern)) !== null) {
      // This is actually correct syntax, just verify it's properly formatted
    }

    // Check for problematic space-in-name without quotes
    const badSubgraphPattern = /subgraph\s+(\w+\s+\w+)/g;
    while ((match = code.match(badSubgraphPattern)) !== null) {
      if (!match[0].includes('[')) {
        this.errors.push(`Subgraph name has spaces without quotes: ${match[1]}. Use subgraph id["display name"]`);
      }
    }
  }

  /**
   * Rule 3: Node references should use IDs not display names
   */
  checkNodeReferences(code) {
    // This is a semantic check - we can only warn about common patterns
    const edgePattern = /-->\s*["“][^"”]+["”]/g;
    let match;
    while ((match = code.match(edgePattern)) !== null) {
      const target = match[0].replace(/-->|["""]/g, '').trim();
      if (target.includes(' ')) {
        this.warnings.push(`Edge targets display name "${target}". Consider using subgraph ID instead.`);
      }
    }
  }

  /**
   * Rule 4: Special characters in node text
   */
  checkSpecialCharacters(code) {
    // Check for problematic quotes in node text
    const quotePattern = /\[[^\]]*["'][^"\]]*["'][^\]]*\]/g;
    const matches = code.match(quotePattern);
    if (matches) {
      this.warnings.push(`Found quotes in node text which may cause issues: ${matches[0]}. Use 『』or 「」 instead.`);
    }

    // Check for line breaks (only allowed in circle nodes)
    const badBreakPattern = /\[[^\]]*<br\s*\/?>[^\]]*\]/g;
    const matches2 = code.match(badBreakPattern);
    if (matches2) {
      this.warnings.push(`Line breaks <br/> only work in circle nodes ((text<br/>break)), not regular nodes.`);
    }
  }

  /**
   * Rule 5: Arrow types
   */
  checkArrowSyntax(code) {
    const validArrows = ['-->', '-->>', '-.->', '-.->>', '==>', '~~~'];
    const arrowPattern = /[-=~][-.=>]+/g;
    let match;
    while ((match = code.match(arrowPattern)) !== null) {
      if (!validArrows.includes(match[0])) {
        this.errors.push(`Invalid arrow syntax: ${match[0]}. Use: -->, -->>, -.->, ==>, ~~~`);
      }
    }
  }

  /**
   * Check brackets - avoid false positives for [Node Label] syntax
   */
  checkBrackets(code) {
    // Mermaid uses [] for node labels, not arrays
    // This check looks for actual bracket mismatches
    const openBrackets = (code.match(/\[/g) || []).length;
    const closeBrackets = (code.match(/\]/g) || []).length;

    if (openBrackets !== closeBrackets) {
      // Check if it's the [text] node label pattern (which is valid)
      const nodeLabelPattern = /\[[^\[\]]*\]/g;
      const nodeLabels = code.match(nodeLabelPattern) || [];
      const bracketContent = nodeLabels.map(m => m.slice(1, -1)).join('');

      // If brackets in node labels account for difference, it's ok
      const labelBrackets = nodeLabels.length * 2;
      if (openBrackets - labelBrackets !== closeBrackets - labelBrackets) {
        this.errors.push(`Unmatched brackets. Found ${openBrackets} '[' and ${closeBrackets} ']'`);
      }
    }
  }

  /**
   * Check classDef syntax - requires %% prefix in some renderers
   */
  checkClassDef(code) {
    if (code.includes('classDef') && !code.includes('%%')) {
      this.warnings.push(`classDef found without %% prefix. Some renderers require "%%{init}" block.`);
    }
  }

  /**
   * Auto-fix common issues
   */
  fixCommonIssues(code) {
    let fixed = code;

    // Fix "number. space" pattern
    fixed = fixed.replace(/(\d)\.\s+([^\]]*\])/g, '$1.$2');

    // Escape quotes
    fixed = fixed.replace(/"([^"]*)"/g, '『$1』');

    return fixed;
  }
}

export function validateMermaid(code) {
  const validator = new Validator();
  return validator.validate(code);
}

export function fixCommonIssues(code) {
  const validator = new Validator();
  return validator.fixCommonIssues(code);
}
