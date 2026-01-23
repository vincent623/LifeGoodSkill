#!/usr/bin/env node
/**
 * Chat Log Analyzer - Main Entry Point
 * Parses Claude Code JSONL chat logs and generates productivity reports
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { parseArgs } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    'input': { short: 'i', type: 'string', description: 'Input JSONL chat log file' },
    'output': { short: 'o', type: 'string', description: 'Output report file' },
    'summary': { type: 'boolean', description: 'Print summary to stdout' },
    'json': { type: 'boolean', description: 'Output in JSON format' },
    'days': { type: 'string', description: 'Only analyze last N days' },
    'format': { type: 'string', description: 'Output format: html, markdown, json' },
    'sample': { type: 'boolean', description: 'Generate sample report' },
    'help': { type: 'boolean', description: 'Show help' }
  },
  strict: true
});

const CONFIG = {
  input: values.input || './chat/chat_latest.jsonl',
  output: values.output,
  summary: values.summary || false,
  json: values.json || false,
  days: values.days ? parseInt(values.days) : null,
  format: values.format || 'html',
  sample: values.sample || false
};

async function parseJsonl(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  return lines.map(line => JSON.parse(line));
}

function extractSessions(messages) {
  const sessions = new Map();
  const cutoffDate = CONFIG.days
    ? new Date(Date.now() - CONFIG.days * 24 * 60 * 60 * 1000)
    : null;

  for (const msg of messages) {
    const timestamp = new Date(msg.timestamp);
    if (cutoffDate && timestamp < cutoffDate) continue;

    const sessionId = msg.sessionId || 'unknown';
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        id: sessionId,
        startTime: timestamp,
        endTime: timestamp,
        messages: [],
        tools: new Set(),
        skills: new Set()
      });
    }

    const session = sessions.get(sessionId);
    session.endTime = timestamp;
    session.messages.push({
      role: msg.message?.role,
      content: msg.message?.content,
      timestamp
    });

    // Extract tools used
    if (msg.message?.content) {
      const toolMatches = msg.message?.content?.match?.(/\b(gh|aws|npm|git|curl|wget|jq|xsv|sed|awk)\b/gi);
      if (toolMatches) {
        toolMatches.forEach(t => session.tools.add(t.toLowerCase()));
      }
    }
  }

  return Array.from(sessions.values());
}

function calculateStats(sessions) {
  const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);
  const uniqueDays = new Set(sessions.map(s => s.startTime.toDateString())).size;
  const avgMessagesPerSession = totalMessages / sessions.length || 0;

  // Tool usage
  const allTools = new Set();
  sessions.forEach(s => s.tools.forEach(t => allTools.add(t)));
  const toolCounts = {};
  sessions.forEach(s => {
    s.tools.forEach(t => {
      toolCounts[t] = (toolCounts[t] || 0) + 1;
    });
  });

  // Hour distribution
  const hourCounts = new Array(24).fill(0);
  sessions.forEach(s => {
    hourCounts[s.startTime.getHours()]++;
  });
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

  // Session duration
  const durations = sessions.map(s => s.endTime - s.startTime);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length || 0;

  return {
    totalSessions: sessions.length,
    totalMessages,
    uniqueDays,
    avgMessagesPerSession: avgMessagesPerSession.toFixed(1),
    uniqueTools: allTools.size,
    topTools: Object.entries(toolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tool, count]) => ({ tool, count })),
    peakHour,
    hourDistribution: hourCounts,
    avgDurationMinutes: (avgDuration / 60000).toFixed(1)
  };
}

function generateHtmlReport(stats, sessions) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Code Work Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    h1 { color: #333; margin-bottom: 10px; }
    h2 { color: #555; margin: 20px 0 10px; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
    .card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
    .stat { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 6px; }
    .stat-value { font-size: 28px; font-weight: bold; color: #2563eb; }
    .stat-label { font-size: 12px; color: #666; margin-top: 5px; text-transform: uppercase; }
    .chart { height: 120px; display: flex; align-items: flex-end; gap: 3px; padding: 10px 0; }
    .bar { flex: 1; background: #2563eb; border-radius: 2px 2px 0 0; min-width: 8px; }
    .bar:hover { background: #1d4ed8; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
    .timestamp { color: #666; font-size: 12px; }
    footer { text-align: center; color: #888; margin-top: 30px; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Claude Code Work Report</h1>
  <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>

  <div class="card">
    <h2>Overview</h2>
    <div class="stat-grid">
      <div class="stat">
        <div class="stat-value">${stats.totalSessions}</div>
        <div class="stat-label">Sessions</div>
      </div>
      <div class="stat">
        <div class="stat-value">${stats.totalMessages}</div>
        <div class="stat-label">Messages</div>
      </div>
      <div class="stat">
        <div class="stat-value">${stats.uniqueDays}</div>
        <div class="stat-label">Active Days</div>
      </div>
      <div class="stat">
        <div class="stat-value">${stats.avgMessagesPerSession}</div>
        <div class="stat-label">Avg Msg/Session</div>
      </div>
    </div>
  </div>

  <div class="card">
    <h2>Activity by Hour</h2>
    <p>Peak hour: <strong>${stats.peakHour}:00</strong></p>
    <div class="chart">
      ${stats.hourDistribution.map((count, i) =>
        `<div class="bar" style="height: ${(count / Math.max(...stats.hourDistribution)) * 100}%" title="${i}:00 - ${count}"></div>`
      ).join('')}
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #888;">
      <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
    </div>
  </div>

  <div class="card">
    <h2>Top Tools Used</h2>
    <table>
      <thead><tr><th>Tool</th><th>Times Used</th></tr></thead>
      <tbody>
        ${stats.topTools.map(t => `<tr><td>${t.tool}</td><td>${t.count}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="card">
    <h2>Session Details</h2>
    <table>
      <thead><tr><th>Session</th><th>Messages</th><th>Duration</th><th>Tools</th></tr></thead>
      <tbody>
        ${sessions.slice(0, 10).map(s => `
          <tr>
            <td>${s.id.substring(0, 8)}...</td>
            <td>${s.messages.length}</td>
            <td>${((s.endTime - s.startTime) / 60000).toFixed(1)} min</td>
            <td>${Array.from(s.tools).slice(0, 3).join(', ') || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <footer>Generated by chat-log-analyzer skill</footer>
</body>
</html>`;
}

function generateMarkdownReport(stats, sessions) {
  return `# Claude Code Work Report

Generated: ${new Date().toLocaleString()}

## Overview

| Metric | Value |
|--------|-------|
| Total Sessions | ${stats.totalSessions} |
| Total Messages | ${stats.totalMessages} |
| Active Days | ${stats.uniqueDays} |
| Avg Messages/Session | ${stats.avgMessagesPerSession} |
| Unique Tools Used | ${stats.uniqueTools} |
| Peak Activity Hour | ${stats.peakHour}:00 |
| Avg Session Duration | ${stats.avgDurationMinutes} min |

## Top Tools

${stats.topTools.map(t => `- ${t.tool}: ${t.count} times`).join('\n')}

## Hour Distribution

${stats.hourDistribution.map((count, hour) =>
  `${hour.toString().padStart(2, '0')}:00 - ${'█'.repeat(count)} ${count}`
).join('\n')}

## Recent Sessions

| Session ID | Messages | Duration | Tools |
|------------|----------|----------|-------|
${sessions.slice(0, 10).map(s =>
  `| ${s.id.substring(0, 12)}... | ${s.messages.length} | ${((s.endTime - s.startTime) / 60000).toFixed(1)} min | ${Array.from(s.tools).slice(0, 3).join(', ') || '-'} |`
).join('\n')}
`;
}

async function main() {
  if (values.help) {
    console.log(`
Chat Log Analyzer - Parse Claude Code logs and generate reports

Usage: node main.js [options]

Options:
  -i, --input <path>   Input JSONL chat log file
  -o, --output <path>  Output report file
  --summary            Print summary to stdout
  --json               Output in JSON format
  --days <n>           Only analyze last N days
  --format <type>      Output format: html, markdown, json
  --sample             Generate sample report
  --help               Show this help

Examples:
  node main.js -i ./chat.jsonl -o report.html
  node main.js -i ./chat.jsonl --summary
  node main.js --sample
`);
    return;
  }

  if (CONFIG.sample) {
    // Generate sample data
    const sampleStats = {
      totalSessions: 156,
      totalMessages: 2847,
      uniqueDays: 23,
      avgMessagesPerSession: 18.3,
      uniqueTools: 12,
      topTools: [
        { tool: 'git', count: 89 },
        { tool: 'node', count: 67 },
        { tool: 'npm', count: 45 },
        { tool: 'gh', count: 34 },
        { tool: 'jq', count: 28 }
      ],
      peakHour: 14,
      hourDistribution: Array.from({ length: 24 }, () => Math.floor(Math.random() * 30)),
      avgDurationMinutes: 45.2
    };
    const sampleSessions = Array.from({ length: 5 }, (_, i) => ({
      id: `sample-session-${i}`,
      startTime: new Date(),
      endTime: new Date(Date.now() + 30 * 60000),
      messages: Array.from({ length: 15 }, () => ({})),
      tools: new Set(['git', 'node'])
    }));

    const report = generateHtmlReport(sampleStats, sampleSessions);
    await Bun.write('chat-log-analyzer-report.html', report);
    console.log('Sample report generated: chat-log-analyzer-report.html');
    return;
  }

  if (!existsSync(CONFIG.input)) {
    console.error(`Error: Input file not found: ${CONFIG.input}`);
    process.exit(1);
  }

  console.log(`Parsing: ${CONFIG.input}`);
  const messages = await parseJsonl(CONFIG.input);
  console.log(`Loaded ${messages.length} messages`);

  const sessions = extractSessions(messages);
  const stats = calculateStats(sessions);

  if (CONFIG.summary) {
    console.log('\n=== Summary ===');
    console.log(`Sessions: ${stats.totalSessions}`);
    console.log(`Messages: ${stats.totalMessages}`);
    console.log(`Active Days: ${stats.uniqueDays}`);
    console.log(`Peak Hour: ${stats.peakHour}:00`);
    console.log(`Top Tools: ${stats.topTools.map(t => t.tool).join(', ')}`);
    return;
  }

  if (CONFIG.json) {
    const output = JSON.stringify({ stats, sessions: sessions.slice(0, 20) }, null, 2);
    if (CONFIG.output) {
      await Bun.write(CONFIG.output, output);
      console.log(`JSON output written to: ${CONFIG.output}`);
    } else {
      console.log(output);
    }
    return;
  }

  const report = generateHtmlReport(stats, sessions);
  const outputPath = CONFIG.output || 'chat-report.html';
  await Bun.write(outputPath, report);
  console.log(`Report generated: ${outputPath}`);
}

main().catch(console.error);
