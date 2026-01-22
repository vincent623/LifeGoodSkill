/**
 * Mermaid Diagram Layout Optimizer
 * Based on life-mermaid-master with 4-step layout process
 */

import { ASPECT_RATIOS, COLOR_SCHEMES, FLOW_DIRECTIONS } from './templates.js';

export class LayoutStyle {
  static COMPACT = 'compact';
  static COMFORTABLE = 'comfortable';
  static SPACIOUS = 'spacious';
}

export class FlowDirection {
  static TB = 'TB';  // Top to Bottom
  static BT = 'BT';  // Bottom to Top
  static LR = 'LR';  // Left to Right
  static RL = 'RL';  // Right to Left
}

export class SubgraphBlock {
  constructor(name, label, nodes = [], direction = FlowDirection.TB) {
    this.name = name;
    this.label = label;
    this.nodes = nodes;
    this.direction = direction;
    this.edges = [];
  }
}

export class LayoutConfig {
  constructor() {
    this.aspectRatio = '4:3';
    this.colorScheme = 'blue';
    this.layoutStyle = LayoutStyle.COMFORTABLE;
    this.fontSize = '14px';
    this.nodePadding = 20;
    this.showLegend = true;
    this.darkMode = false;
    this.flowDirection = FlowDirection.TB;
    this.rankSpacing = 30;
    this.nodeSpacing = 20;
    this.minWidth = 800;
  }
}

/**
 * Calculate optimal aspect ratio based on subgraph count
 */
export function calculateOptimalRatio(subgraphCount) {
  if (subgraphCount <= 4) return '4:3';
  if (subgraphCount <= 6) return '4:3';
  if (subgraphCount <= 8) return '16:9';  // FIX: was 3:2
  return '16:9';
}

/**
 * Suggest flow direction based on content complexity
 */
export function suggestFlowDirection(subgraphCount, totalNodes) {
  if (subgraphCount >= 6 && totalNodes > 20) {
    return FlowDirection.TB;
  } else if (subgraphCount >= 4 && totalNodes <= 15) {
    return FlowDirection.LR;
  }
  return FlowDirection.TB;
}

/**
 * Balance subgraph nodes - split blocks with more than maxNodes
 */
export function balanceSubgraphNodes(blocks, maxNodes = 6) {
  const balanced = [];
  for (const block of blocks) {
    if (block.nodes.length <= maxNodes) {
      balanced.push(block);
    } else {
      const parts = Math.ceil(block.nodes.length / maxNodes);
      const nodesPerPart = Math.ceil(block.nodes.length / parts);

      for (let i = 0; i < parts; i++) {
        const start = i * nodesPerPart;
        const end = Math.min(start + nodesPerPart, block.nodes.length);
        const partNodes = block.nodes.slice(start, end);

        const newBlock = new SubgraphBlock(
          `${block.name}_p${i + 1}`,
          `${block.label} (${i + 1}/${parts})`,
          partNodes,
          block.direction
        );
        balanced.push(newBlock);
      }
    }
  }
  return balanced;
}

/**
 * Build Mermaid flowchart code from layout blocks
 */
export function buildLayoutFromBlocks(blocks, flowDirection = FlowDirection.TB) {
  const lines = [`flowchart ${flowDirection}`];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Subgraph header
    lines.push(`    subgraph ${block.name}[${block.label}]`);
    lines.push(`        direction ${block.direction}`);

    // Generate nodes
    for (let j = 0; j < block.nodes.length; j++) {
      const nodeId = `${block.name[0].toUpperCase()}${i}${j}`;
      lines.push(`        ${nodeId}(${block.nodes[j]})`);
    }

    // Internal edges (chain them)
    for (let j = 0; j < block.nodes.length - 1; j++) {
      const curr = `${block.name[0].toUpperCase()}${i}${j}`;
      const next = `${block.name[0].toUpperCase()}${i}${j + 1}`;
      lines.push(`        ${curr} --> ${next}`);
    }

    lines.push(`    end`);
  }

  // Inter-block connections
  for (let i = 0; i < blocks.length - 1; i++) {
    const currLast = `${blocks[i].name[0].toUpperCase()}${i}${blocks[i].nodes.length - 1}`;
    const nextFirst = `${blocks[i + 1].name[0].toUpperCase()}${i + 1}0`;
    lines.push(`    ${currLast} --> ${nextFirst}`);
  }

  return lines.join('\n');
}

/**
 * Create optimized layout from content blocks
 */
export function createSubgraphLayout(contentBlocks, options = {}) {
  const { aspectRatio = null, colorScheme = 'blue', flowDirection = null } = options;

  // Build subgraph blocks
  const blocks = contentBlocks.map(block => new SubgraphBlock(
    block.name,
    block.label,
    block.nodes,
    FlowDirection.TB
  ));

  // Calculate optimal parameters
  const subgraphCount = blocks.length;
  const totalNodes = blocks.reduce((sum, b) => sum + b.nodes.length, 0);

  const ratio = aspectRatio || calculateOptimalRatio(subgraphCount);
  const direction = flowDirection || suggestFlowDirection(subgraphCount, totalNodes);

  // Balance nodes if needed
  const balanced = balanceSubgraphNodes(blocks);

  // Build layout
  const mermaidCode = buildLayoutFromBlocks(balanced, direction);

  // Create config
  const config = new LayoutConfig();
  config.aspectRatio = ratio;
  config.colorScheme = colorScheme;
  config.flowDirection = direction;

  if (direction === FlowDirection.TB) {
    config.rankSpacing = 45;
    config.nodeSpacing = 35;
  } else {
    config.rankSpacing = 35;
    config.nodeSpacing = 25;
  }

  // Set minWidth based on complexity
  if (subgraphCount >= 7) {
    config.minWidth = 950;
  }

  return { mermaidCode, config };
}

/**
 * Get optimal config based on diagram type
 */
export function getOptimalConfig(diagramType, contentSize, complexity = 'medium') {
  const config = new LayoutConfig();

  const ratioMap = {
    flowchart: '4:3',
    sequence: '16:9',
    class: '4:3',
    state: '4:3',
    er: '4:3',
    gantt: '16:9',
    pie: '1:1',
    mindmap: '3:4',
    journey: '3:2',
  };
  config.aspectRatio = ratioMap[diagramType] || '4:3';

  const schemeMap = {
    flowchart: 'blue',
    sequence: 'blue',
    class: 'purple',
    state: 'orange',
    er: 'blue',
    gantt: 'green',
    pie: 'blue',
    mindmap: 'orange',
    journey: 'purple',
  };
  config.colorScheme = schemeMap[diagramType] || 'blue';

  // Layout style by complexity
  if (complexity === 'high') {
    config.layoutStyle = LayoutStyle.COMPACT;
    config.fontSize = '12px';
    config.nodePadding = 10;
    config.rankSpacing = 20;
    config.nodeSpacing = 12;
    config.minWidth = 600;
  } else if (complexity === 'low') {
    config.layoutStyle = LayoutStyle.SPACIOUS;
    config.fontSize = '16px';
    config.nodePadding = 30;
    config.rankSpacing = 45;
    config.nodeSpacing = 35;
    config.minWidth = 950;
  } else {
    config.layoutStyle = LayoutStyle.COMFORTABLE;
    config.fontSize = '14px';
    config.nodePadding = 20;
    config.rankSpacing = 30;
    config.nodeSpacing = 20;
    config.minWidth = 800;
  }

  return config;
}

/**
 * Generate HTML wrapper with embedded Mermaid renderer
 */
export function generateHtmlWrapper(mermaidCode, config, title = 'Mermaid Diagram') {
  const colors = COLOR_SCHEMES[config.colorScheme] || COLOR_SCHEMES.blue;
  const dims = ASPECT_RATIOS[config.aspectRatio] || ASPECT_RATIOS['4:3'];

  const width = Math.max(dims.width, config.minWidth);
  const bgColor = config.darkMode ? colors.bg_dark : colors.bg_light;
  const textColor = config.darkMode ? '#f0f0f0' : '#333';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
        background: ${bgColor};
        min-height: 100vh;
        display: flex;
        justify-content: center;
        padding: 20px;
    }
    .container {
        width: 100%;
        max-width: ${width}px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        overflow: hidden;
    }
    .header {
        background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
        color: #fff;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .header h1 {
        font-size: 16px;
        font-weight: 600;
    }
    .meta {
        font-size: 11px;
        opacity: 0.9;
    }
    .diagram-container {
        padding: 15px;
        background: #fff;
        min-width: ${config.minWidth}px;
    }
    .mermaid {
        display: flex;
        justify-content: center;
    }
    .code-section {
        border-top: 1px solid #eee;
        padding: 16px;
        background: #f8f9fa;
    }
    .code-header h3 {
        font-size: 13px;
        color: ${textColor};
        margin-bottom: 10px;
    }
    pre {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
        font-size: 12px;
        line-height: 1.5;
        margin: 0;
    }
    .footer {
        padding: 12px 16px;
        text-align: center;
        font-size: 11px;
        color: #888;
        border-top: 1px solid #eee;
    }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            <span class="meta">${config.aspectRatio} | ${config.colorScheme}</span>
        </div>
        <div class="diagram-container">
            <div class="mermaid">
${mermaidCode}
            </div>
        </div>
        <div class="code-section">
            <div class="code-header">
                <h3>Mermaid 代码</h3>
            </div>
            <pre><code>${mermaidCode}</code></pre>
        </div>
        <div class="footer">
            Generated with Mermaid Diagram Tool | ${config.aspectRatio}
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'base',
            themeVariables: {
                primaryColor: '${colors.primary}',
                primaryTextColor: '#fff',
                primaryBorderColor: '${colors.secondary}',
                lineColor: '${colors.primary}',
                secondaryColor: '${colors.accent}',
                tertiaryColor: '${colors.bg_light}',
            },
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis',
                rankSpacing: ${config.rankSpacing},
                nodeSpacing: ${config.nodeSpacing},
            },
            securityLevel: 'loose',
        });
    </script>
</body>
</html>`;
}
