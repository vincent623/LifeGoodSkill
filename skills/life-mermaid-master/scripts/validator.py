#!/usr/bin/env python3
"""
Mermaid Syntax Validator
Ensures generated diagrams are valid and visible in any language.
"""
import re
from typing import List, Tuple, Optional

# Common issues that break Mermaid rendering
CRITICAL_ISSUES = [
    (r'\[\]', 'Empty node brackets - use [内容] instead'),
    (r'\{\}', 'Empty braces - add content'),
    (r'\(\)', 'Empty parentheses - add content'),
    (r'\|', 'Bare pipe character - wrap in text or use \\|'),
    (r'\#{', 'Hash at start of subgraph - use subgraph name without #'),
]

WARNING_ISSUES = [
    (r'\[\s*\]', 'Near-empty brackets'),
    (r'\[\s*,', 'Empty node content'),
    (r'subgraph\s*$', 'Subgraph without name'),
    (r'style\s+\w+\s*$', 'Style without definitions'),
    (r'linkStyle\s*\d*\s*$', 'LinkStyle without definitions'),
]

# Invalid characters for node IDs
INVALID_NODE_CHARS = re.compile(r'[^\w-]')

# Valid directions for graphs
VALID_DIRECTIONS = {'LR', 'RL', 'TB', 'BT', 'UD', 'DU'}

# Reserved words that need escaping
RESERVED_WORDS = {
    'graph', 'subgraph', 'end', 'style', 'linkStyle',
    'classDef', 'class', 'click', 'direction',
    'sequenceDiagram', 'classDiagram', 'stateDiagram-v2',
    'erDiagram', 'gantt', 'pie', 'mindmap', 'journey',
    'title', 'axisFormat', 'dateFormat', 'section',
    'participant', 'note', 'activate', 'deactivate',
    'rect', 'card', 'database', 'queue', 'package'
}


class ValidationResult:
    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.fixes: List[str] = []

    def is_valid(self) -> bool:
        return len(self.errors) == 0

    def add_error(self, msg: str, fix: Optional[str] = None):
        self.errors.append(msg)
        if fix:
            self.fixes.append(fix)

    def add_warning(self, msg: str, suggestion: Optional[str] = None):
        self.warnings.append(msg)
        if suggestion:
            self.fixes.append(suggestion)


def validate_mermaid(code: str) -> ValidationResult:
    """Validate Mermaid syntax"""
    result = ValidationResult()

    # Check for critical issues
    for pattern, message in CRITICAL_ISSUES:
        matches = re.findall(pattern, code)
        if matches:
            result.add_error(message, f"Found {len(matches)} occurrence(s)")

    # Check for warnings
    for pattern, message in WARNING_ISSUES:
        matches = re.findall(pattern, code)
        if matches:
            result.add_warning(message)

    # Check for empty or malformed nodes
    empty_node_pattern = re.compile(r'\[\s*\]')
    for match in empty_node_pattern.finditer(code):
        line_start = code[:match.start()].rfind('\n') + 1
        line = code[line_start:code.find('\n', line_start)]
        result.add_warning("Empty node found in line", line.strip()[:50])

    # Check graph direction
    direction_match = re.search(r'\b(direction\s+(LR|RL|TB|BT|UD|DU))\b', code, re.IGNORECASE)
    if direction_match:
        direction = direction_match.group(2).upper()
        if direction not in VALID_DIRECTIONS:
            result.add_error(f"Invalid direction: {direction}", "Use LR, RL, TB, or BT")

    # Note: Don't check for bracket matching here because Mermaid uses [text] syntax
    # and {key:value} in class definitions which would trigger false positives

    # Check subgraph syntax
    subgraph_pattern = re.compile(r'subgraph\s+(\w+)', re.IGNORECASE)
    subgraph_matches = subgraph_pattern.findall(code)
    if not subgraph_matches:
        # Check if subgraph exists but has no name
        if 'subgraph' in code.lower():
            result.add_warning("Subgraph found without explicit name", "Add a name: subgraph name")

    # Check for non-ASCII that might cause issues
    # Only flag if it's in node definitions (not in comments or text)
    # Chinese characters are valid in Mermaid, but special chars are not
    special_chars = re.findall(r'[<>{}\\|^~`]', code)
    if special_chars:
        result.add_warning(
            "Special characters found that may cause rendering issues",
            "Consider using alternatives or escaping"
        )

    return result


def sanitize_node_text(text: str) -> str:
    """Sanitize text for use in node definitions"""
    # Replace problematic characters
    text = text.replace('[', '【').replace(']', '】')
    text = text.replace('|', '｜')
    text = text.replace('{', '｛').replace('}', '｝')
    text = text.replace('<', '＜').replace('>', '＞')
    text = text.replace('"', '""')  # Double up for Mermaid
    return text


def make_valid_node_id(text: str) -> str:
    """Create a valid Mermaid node ID from text"""
    # Replace invalid characters
    node_id = INVALID_NODE_CHARS.sub('_', text)
    # Ensure it doesn't start with a number
    if node_id and node_id[0].isdigit():
        node_id = 'N' + node_id
    # Check for reserved words
    if node_id.lower() in RESERVED_WORDS:
        node_id = node_id + '_'
    return node_id


def fix_common_issues(code: str) -> Tuple[str, List[str]]:
    """Apply automatic fixes for common issues"""
    fixes_applied = []

    # Fix empty brackets
    if re.search(r'\[\s*\]', code):
        code = re.sub(r'\[\s*\]', '[节点]', code)
        fixes_applied.append("Filled empty brackets with placeholder")

    # Fix bare pipe characters
    if re.search(r'(?<![|])\|(?![|])', code):
        code = code.replace('|', '｜')
        fixes_applied.append("Replaced bare pipe characters")

    # Fix empty parentheses in links
    code = re.sub(r'\[\]\(\)', '[详情](链接)', code)
    if '[]()' in code:
        fixes_applied.append("Filled empty link brackets")

    # Fix graph direction case
    code = re.sub(r'\bdirection\s+(lr|rl|tb|bt|ud|du)\b',
                  lambda m: 'direction ' + m.group(1).upper(), code,
                  flags=re.IGNORECASE)

    return code, fixes_applied


def escape_markdown_chars(text: str) -> str:
    """Escape special characters for Markdown rendering"""
    # Characters that need escaping in code blocks
    escape_chars = {
        '```': '`````',
        '`': '\\`',
    }
    for old, new in escape_chars.items():
        text = text.replace(old, new)
    return text
