#!/usr/bin/env node
/**
 * Chat to Markdown Converter
 * Converts Claude Code JSONL logs to readable Markdown format
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { parseArgs } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    'input': { short: 'i', type: 'string', description: 'Input JSONL file' },
    'output': { short: 'o', type: 'string', description: 'Output Markdown file' },
    'session': { type: 'string', description: 'Extract specific session' },
    'include-meta': { type: 'boolean', description: 'Include metadata' },
    'compact': { type: 'boolean', description: 'Skip system messages' },
    'format': { type: 'string', description: 'Output format' },
    'sample': { type: 'boolean', description: 'Generate sample' },
    'help': { type: 'boolean', description: 'Show help' }
  },
  strict: true
});

const CONFIG = {
  input: values.input || './chat/chat_latest.jsonl',
  output: values.output || './chat-converted.md',
  session: values.session,
  includeMeta: values['include-meta'] || false,
  compact: values.compact || false,
  format: values.format || 'markdown',
  sample: values.sample || false
};

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function extractTextContent(content) {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map(block => {
      if (block.type === 'text') return block.text;
      if (block.type === 'tool_use') {
        const inputStr = JSON.stringify(block.input, null, 2);
        return `\`\`\`json\n// ${block.name}\n${inputStr}\n\`\`\``;
      }
      return '';
    }).filter(Boolean).join('\n');
  }
  return String(content);
}

function isSystemMessage(msg) {
  if (msg.isMeta) return true;
  if (msg.type === 'file-history-snapshot') return true;
  if (msg.message?.role === 'system') return true;
  return false;
}

async function parseJsonl(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  return lines.map(line => JSON.parse(line));
}

function groupBySession(messages) {
  const sessions = new Map();

  for (const msg of messages) {
    // Skip system messages if compact mode
    if (CONFIG.compact && isSystemMessage(msg)) continue;

    const sessionId = msg.sessionId || 'default';
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }
    sessions.get(sessionId).push(msg);
  }

  return sessions;
}

function buildMarkdown(sessions) {
  const output = [];

  output.push('# Claude Code Conversation\n');

  const sessionIds = Array.from(sessions.keys());
  const totalMessages = Array.from(sessions.values()).reduce((sum, msgs) => sum + msgs.length, 0);

  output.push(`> Session${sessionIds.length > 1 ? 's' : ''}: ${sessionIds.map(id => id.substring(0, 8)).join(', ')}`);
  output.push(`> Generated: ${formatTime(new Date().toISOString())}`);
  output.push(`> Total Messages: ${totalMessages}`);
  output.push('\n---\n');

  for (const [sessionId, messages] of sessions) {
    if (sessionIds.length > 1) {
      output.push(`## Session: ${sessionId}\n`);
    }

    for (const msg of messages) {
      const role = msg.message?.role || 'unknown';
      const timestamp = msg.timestamp ? formatTime(msg.timestamp) : '';
      const content = extractTextContent(msg.message?.content);

      if (!content.trim()) continue;

      output.push(`## ${role.charAt(0).toUpperCase() + role.slice(1)} [${timestamp}]`);

      if (CONFIG.includeMeta) {
        output.push(`\n> UUID: ${msg.uuid}`);
        output.push(`> Type: ${msg.type}`);
        if (msg.cwd) output.push(`> Working Directory: ${msg.cwd}`);
      }

      output.push(`\n${content}\n`);
      output.push('\n---\n');
    }
  }

  return output.join('\n');
}

function buildHtml(markdown) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Code Conversation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
    h2 { border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px; color: #444; }
    h3 { color: #555; margin-top: 20px; }
    blockquote { background: #f8f9fa; border-left: 4px solid #2563eb; margin: 10px 0; padding: 10px 15px; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 6px; overflow-x: auto; }
    code { background: #f1f1f1; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
    pre code { background: none; padding: 0; }
    hr { border: none; border-top: 1px solid #ddd; margin: 30px 0; }
    .metadata { color: #666; font-size: 0.9em; }
    .user { color: #2563eb; }
    .assistant { color: #059669; }
  </style>
</head>
<body>
${markdown.replace(/\n/g, '<br>').replace(/## (User|Assistant) \[(.*?)\]/g, '<h2 class="$1">$1 - $2</h2>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/> (.*)/g, '<blockquote>$1</blockquote>')}
</body>
</html>`;
}

async function main() {
  if (values.help) {
    console.log(`
Chat to Markdown - Convert JSONL logs to readable Markdown

Usage: node main.js [options]

Options:
  -i, --input <path>    Input JSONL file (required)
  -o, --output <path>   Output Markdown file
  --session <id>        Extract specific session
  --include-meta        Include metadata (UUIDs, timestamps)
  --compact             Skip system messages
  --format <type>       Output format: markdown, html
  --sample              Generate sample output
  --help                Show this help

Examples:
  node main.js -i ./chat.jsonl -o conversation.md
  node main.js -i ./chat.jsonl --compact -o clean.md
  node main.js -i ./chat.jsonl --session abc123 -o session.md
`);
    return;
  }

  if (CONFIG.sample) {
    const sampleMd = `# Claude Code Conversation

> Session: sample123
> Generated: ${formatTime(new Date().toISOString())}
> Total Messages: 3

---

## User [01/22/2026, 10:00:00 AM]

Help me analyze the project structure.

---

## Assistant [01/22/2026, 10:00:15 AM]

\`\`\`javascript
const structure = {
  src: './src',
  tests: './tests'
};
\`\`\`

Here's the project structure...

---

## User [01/22/2026, 10:01:00 AM]

Thanks!

---

`;
    await Bun.write('chat-to-markdown-sample.md', sampleMd);
    console.log('Sample generated: chat-to-markdown-sample.md');
    return;
  }

  if (!existsSync(CONFIG.input)) {
    console.error(`Error: Input file not found: ${CONFIG.input}`);
    process.exit(1);
  }

  console.log(`Parsing: ${CONFIG.input}`);
  const messages = await parseJsonl(CONFIG.input);
  console.log(`Loaded ${messages.length} messages`);

  const sessions = groupBySession(messages);
  console.log(`Grouped into ${sessions.size} session(s)`);

  if (CONFIG.session) {
    const specific = new Map();
    if (sessions.has(CONFIG.session)) {
      specific.set(CONFIG.session, sessions.get(CONFIG.session));
    } else {
      // Try partial match
      for (const [id, msgs] of sessions) {
        if (id.includes(CONFIG.session)) {
          specific.set(id, msgs);
        }
      }
    }
    if (specific.size === 0) {
      console.error(`Session not found: ${CONFIG.session}`);
      process.exit(1);
    }
  }

  const markdown = buildMarkdown(sessions);

  if (CONFIG.format === 'html') {
    const html = buildHtml(markdown);
    await Bun.write(CONFIG.output.replace(/\.md$/, '.html'), html);
    console.log(`HTML output written to: ${CONFIG.output.replace(/\.md$/, '.html')}`);
  } else {
    await Bun.write(CONFIG.output, markdown);
    console.log(`Markdown written to: ${CONFIG.output}`);
  }
}

main().catch(console.error);
