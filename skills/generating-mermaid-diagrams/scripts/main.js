#!/usr/bin/env node
/**
 * Mermaid Diagram Tool CLI
 * Professional Mermaid diagram generator with validation, optimization, and HTML export
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import {
  DIAGRAM_TYPES,
  COLOR_SCHEMES,
  ASPECT_RATIOS,
  FLOW_DIRECTIONS,
  TEMPLATES,
  generateFlowchart,
  generateSequence,
  generateClassDiagram,
  generateGantt,
  generatePie,
  generateMindmap,
} from './templates.js';
import { validateMermaid, fixCommonIssues } from './validator.js';
import { generateHtmlWrapper, getOptimalConfig } from './optimizer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, '..');

// CLI argument parsing
function parseArgs() {
  const args = {
    description: '',
    type: 'flowchart',
    ratio: '4:3',
    scheme: 'blue',
    input: null,
    output: null,
    sample: false,
    template: null,
    validateOnly: false,
    direction: 'LR',
  };

  const argv = process.argv.slice(2);
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg.startsWith('-')) {
      if (['-t', '--type'].includes(arg)) {
        args.type = argv[i + 1].toLowerCase();
        i += 2;
      } else if (['-r', '--ratio'].includes(arg)) {
        args.ratio = argv[i + 1];
        i += 2;
      } else if (['-c', '--scheme'].includes(arg)) {
        args.scheme = argv[i + 1].toLowerCase();
        i += 2;
      } else if (['-i', '--input'].includes(arg)) {
        args.input = argv[i + 1];
        i += 2;
      } else if (['-o', '--output'].includes(arg)) {
        args.output = argv[i + 1];
        i += 2;
      } else if (['-s', '--sample'].includes(arg)) {
        args.sample = true;
        i += 1;
      } else if (arg === '--template') {
        args.template = argv[i + 1];
        i += 2;
      } else if (arg === '--validate-only') {
        args.validateOnly = true;
        i += 1;
      } else if (['-d', '--direction'].includes(arg)) {
        args.direction = argv[i + 1].toUpperCase();
        i += 2;
      } else {
        i += 1;
      }
    } else {
      if (!args.description) args.description = arg;
      i += 1;
    }
  }

  return args;
}

// Generate flowchart from simple description
function generateFromDescription(description, type, colors, direction = 'LR') {
  const steps = [];
  const branches = {};

  const desc = description.trim();

  // Split by arrows
  if (desc.includes('->') || desc.includes('→')) {
    const parts = desc.replace(/->|→/g, '→').split('→');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed && !['和', '与', 'and'].includes(trimmed)) {
        if (trimmed.includes('如果') || trimmed.includes('是否') || trimmed.includes('?')) {
          const branchName = trimmed.replace(/如果|是否|\?/g, '').trim();
          branches[branchName] = [`处理${branchName}`, '继续'];
        } else {
          steps.push(trimmed);
        }
      }
    }
  } else {
    const words = desc.split(/\s+/);
    if (words.length >= 2) {
      steps.push(...words.slice(0, 5));
    } else {
      steps.push(desc, '步骤1', '步骤2', '步骤3', '结束');
    }
  }

  if (steps.length === 0) {
    steps.push('开始', '处理', '判断', '结束');
  }

  return generateFlowchart({
    title: steps[0] || '流程图',
    steps,
    branches: Object.keys(branches).length > 0 ? branches : null,
    colors,
    direction,
  });
}

// Generate sample diagrams
function generateSamples() {
  const samples = {};
  const colors = COLOR_SCHEMES.blue;

  // Flowchart
  const flowchart = generateFlowchart({
    title: '订单处理流程',
    steps: ['接收订单', '验证订单', '库存检查', '支付处理', '发货确认', '完成'],
    colors,
    direction: 'LR',
  });
  samples['sample-flowchart.html'] = generateHtmlWrapper(
    flowchart,
    getOptimalConfig(DIAGRAM_TYPES.FLOWCHART, 6, 'low'),
    '订单处理流程图'
  );

  // Sequence
  const sequence = generateSequence({
    title: '用户登录时序',
    participants: ['用户', '前端', '后端', '数据库', 'Redis'],
    messages: [
      { from: '用户', to: '前端', text: '点击登录' },
      { from: '前端', to: '后端', text: '发送登录请求', arrow: '->>' },
      { from: '后端', to: 'Redis', text: '检查Token', arrow: '->>' },
      { from: 'Redis', to: '后端', text: '返回结果', arrow: '-->>' },
      { from: '后端', to: '数据库', text: '验证凭据', arrow: '->>' },
      { from: '数据库', to: '后端', text: '返回用户信息', arrow: '-->>' },
      { from: '后端', to: '前端', text: '登录成功', arrow: '-->>' },
    ],
  });
  samples['sample-sequence.html'] = generateHtmlWrapper(
    sequence,
    getOptimalConfig(DIAGRAM_TYPES.SEQUENCE, 100, 'medium'),
    '用户登录时序图'
  );

  // Gantt
  const gantt = generateGantt({
    title: '产品发布计划',
    tasks: [
      { name: '市场调研', section: '准备', start: '2024-01-01', duration: '10d' },
      { name: '需求分析', section: '准备', start: 'after市场调研', duration: '7d' },
      { name: 'UI设计', section: '设计', start: 'after需求分析', duration: '14d' },
      { name: '后端开发', section: '开发', start: 'afterUI设计', duration: '21d' },
      { name: '前端开发', section: '开发', start: 'afterUI设计', duration: '14d' },
      { name: '测试阶段', section: '测试', start: 'after后端开发', duration: '10d' },
      { name: '正式发布', section: '发布', start: 'after测试阶段', duration: '3d' },
    ],
  });
  samples['sample-gantt.html'] = generateHtmlWrapper(
    gantt,
    getOptimalConfig(DIAGRAM_TYPES.GANTT, 200, 'medium'),
    '产品发布甘特图'
  );

  // Pie
  const pie = generatePie({
    title: '预算分配',
    data: { '人力成本': 45, '技术投入': 25, '市场推广': 15, '运营支出': 10, '预留资金': 5 },
  });
  samples['sample-pie.html'] = generateHtmlWrapper(
    pie,
    getOptimalConfig(DIAGRAM_TYPES.PIE, 50, 'low'),
    '预算分配饼图'
  );

  // Class
  const classDiagram = generateClassDiagram({
    title: '电商系统类图',
    classes: [
      { name: 'User', attributes: ['- id: int', '- name: String', '- email: String'], methods: ['+ login()', '+ logout()'] },
      { name: 'Product', attributes: ['- id: int', '- name: String', '- price: decimal'], methods: ['+ getDetails()'] },
      { name: 'Order', attributes: ['- id: int', '- userId: int', '- status: String'], methods: ['+ calculateTotal()', '+ placeOrder()'] },
      { name: 'OrderItem', attributes: ['- id: int', '- orderId: int', '- productId: int'], methods: [] },
    ],
    relationships: [
      { from: 'Order', to: 'User', type: '1', label: '下单' },
      { from: 'Order', to: 'OrderItem', type: '1', label: '包含' },
      { from: 'OrderItem', to: 'Product', type: '*', label: '关联' },
    ],
  });
  samples['sample-class.html'] = generateHtmlWrapper(
    classDiagram,
    getOptimalConfig(DIAGRAM_TYPES.CLASS, 150, 'medium'),
    '电商系统类图'
  );

  return samples;
}

// Main function
async function main() {
  // Show help if no arguments
  if (process.argv.length === 2) {
    console.log(`
Mermaid Diagram Tool

Usage:
  mermaid-tool "description" -o output.html
  mermaid-tool -t flowchart "流程" -r 16:9 -c green -o output.html
  mermaid-tool --template gantt-project -o project.html
  mermaid-tool --sample
  mermaid-tool --validate-only "graph LR A --> B"

Options:
  -t, --type DIAGRAM    flowchart, sequence, class, state, er, gantt, pie, mindmap
  -r, --ratio RATIO     4:3, 3:4, 16:9, 1:1, 3:2, 2:3
  -c, --scheme COLOR    blue, green, purple, orange
  -d, --direction DIR   TB, BT, LR, RL
  -i, --input FILE      Input file
  -o, --output FILE     Output file
  -s, --sample          Generate sample diagrams
  --template NAME       Use built-in template
  --validate-only       Validate syntax only

Available Templates:
${Object.keys(TEMPLATES).map(t => `  - ${t}`).join('\n')}

Available Types:
${Object.keys(DIAGRAM_TYPES).map(t => `  - ${t}`).join('\n')}
`);
    return;
  }

  const args = parseArgs();

  // Generate samples
  if (args.sample) {
    const samples = generateSamples();
    for (const [filename, content] of Object.entries(samples)) {
      writeFileSync(filename, content);
      console.log(`Generated: ${filename}`);
    }
    return;
  }

  // Get input from file or argument
  let description;
  if (args.input) {
    description = readFileSync(args.input, 'utf-8').trim();
  } else {
    description = args.description;
  }

  if (!description) {
    console.error('Please provide a description or input file');
    process.exit(1);
  }

  // Get colors
  const colors = COLOR_SCHEMES[args.scheme] || COLOR_SCHEMES.blue;

  // Generate diagram
  let mermaidCode;
  const diagramType = args.type.toLowerCase();

  if (diagramType === 'flowchart' || diagramType === 'graph') {
    mermaidCode = generateFromDescription(description, diagramType, colors, args.direction);
  } else if (diagramType === 'sequence') {
    mermaidCode = generateSequence({ title: description.slice(0, 30), participants: [], messages: [], colors });
  } else if (diagramType === 'class') {
    mermaidCode = generateClassDiagram({ title: description.slice(0, 30), classes: [], relationships: [], colors });
  } else if (diagramType === 'gantt') {
    mermaidCode = generateGantt({ title: description.slice(0, 30), tasks: [], colors });
  } else if (diagramType === 'pie') {
    mermaidCode = generatePie({ title: description.slice(0, 30), data: {}, colors });
  } else if (diagramType === 'mindmap') {
    mermaidCode = generateMindmap({ root: description.slice(0, 20), nodes: [], colors });
  } else {
    mermaidCode = generateFromDescription(description, diagramType, colors, args.direction);
  }

  // Validate
  const validation = validateMermaid(mermaidCode);
  if (!validation.isValid) {
    console.log('Validation errors:');
    validation.errors.forEach(e => console.log(`  - ${e}`));
  }
  if (validation.warnings.length > 0) {
    console.log('Warnings:');
    validation.warnings.forEach(w => console.log(`  ~ ${w}`));
  }

  // Fix common issues
  if (validation.warnings.length > 0 || !validation.isValid) {
    mermaidCode = fixCommonIssues(mermaidCode);
  }

  if (args.validateOnly) {
    console.log('\nMermaid code:');
    console.log(mermaidCode);
    return;
  }

  // Generate HTML
  const config = getOptimalConfig(diagramType, description.length, 'medium');
  config.aspectRatio = args.ratio;
  config.colorScheme = args.scheme;

  const html = generateHtmlWrapper(mermaidCode, config, description.slice(0, 40));

  // Write output
  const outputFile = args.output || `mermaid-${diagramType}-${Date.now()}.html`;
  writeFileSync(outputFile, html);
  console.log(`Generated: ${outputFile}`);
  console.log(`Type: ${args.type} | Ratio: ${args.ratio} | Scheme: ${args.scheme}`);

  // Print mermaid code
  console.log('\nMermaid code:');
  console.log('```mermaid');
  console.log(mermaidCode);
  console.log('```');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
