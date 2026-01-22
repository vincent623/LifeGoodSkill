/**
 * Mermaid Diagram Templates
 * Based on life-mermaid-master templates with syntax improvements from mermaid-visualizer
 */

export const DIAGRAM_TYPES = {
  FLOWCHART: 'flowchart',
  SEQUENCE: 'sequence',
  CLASS: 'class',
  STATE: 'state',
  ER: 'er',
  GANTT: 'gantt',
  PIE: 'pie',
  MINDMAP: 'mindmap',
  JOURNEY: 'journey',
};

export const COLOR_SCHEMES = {
  blue: {
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    accent: '#60a5fa',
    bg_light: '#eff6ff',
    bg_dark: '#1e3a5f',
  },
  green: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    bg_light: '#d1fae5',
    bg_dark: '#064e3b',
  },
  purple: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    bg_light: '#ede9fe',
    bg_dark: '#4c1d95',
  },
  orange: {
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
    bg_light: '#ffedd5',
    bg_dark: '#7c2d12',
  },
};

export const ASPECT_RATIOS = {
  '4:3': { width: 800, height: 600 },
  '3:4': { width: 600, height: 800 },
  '16:9': { width: 960, height: 540 },
  '1:1': { width: 600, height: 600 },
  '3:2': { width: 750, height: 500 },
  '2:3': { width: 500, height: 750 },
};

export const FLOW_DIRECTIONS = {
  TB: 'TB',
  BT: 'BT',
  LR: 'LR',
  RL: 'RL',
};

// Semantic colors from mermaid-visualizer
export const SEMANTIC_COLORS = {
  input: { fill: '#d3f9d8', stroke: '#2f9e44' },
  planning: { fill: '#ffe3e3', stroke: '#c92a2a' },
  processing: { fill: '#e5dbff', stroke: '#5f3dc4' },
  action: { fill: '#ffe8cc', stroke: '#d9480f' },
  output: { fill: '#c5f6fa', stroke: '#0c8599' },
  storage: { fill: '#fff4e6', stroke: '#e67700' },
  learning: { fill: '#f3d9fa', stroke: '#862e9c' },
  metadata: { fill: '#e7f5ff', stroke: '#1971c2' },
  neutral: { fill: '#f8f9fa', stroke: '#868e96' },
};

export function generateFlowchart({ title, steps, branches, colors, direction = 'LR' }) {
  const lines = [`graph ${direction}`];

  // Escape node text to avoid syntax issues (from mermaid-visualizer)
  const escapeText = (text) => {
    let escaped = text.replace(/"/g, '『』');
    if (/\d\.\s/.test(escaped)) {
      escaped = escaped.replace(/(\d)\.\s/, '$1.');
    }
    return escaped;
  };

  // Generate nodes
  steps.forEach((step, i) => {
    lines.push(`    ${i}[${escapeText(step)}]`);
  });

  // Generate chain edges
  for (let i = 0; i < steps.length - 1; i++) {
    lines.push(`    ${i} --> ${i + 1}`);
  }

  // Generate branches
  if (branches) {
    Object.entries(branches).forEach(([condition, branchSteps]) => {
      const lastIdx = steps.length - 1;
      lines.push(`    ${lastIdx} -->|${condition}| ${lastIdx}_yes[${branchSteps[0]}]`);
      if (branchSteps.length > 1) {
        lines.push(`    ${lastIdx}_yes --> ${lastIdx}_done[${branchSteps[1]}]`);
      }
    });
  }

  return lines.join('\n');
}

export function generateSequence({ title, participants, messages, colors }) {
  const lines = [
    'sequenceDiagram',
    `    title ${title}`,
  ];

  participants.forEach(p => {
    const id = p.replace(/\s/g, '');
    lines.push(`    participant ${id}[${p}]`);
  });

  messages.forEach(m => {
    const fromId = m.from.replace(/\s/g, '');
    const toId = m.to.replace(/\s/g, '');
    const arrow = m.arrow || '->>';
    lines.push(`    ${fromId}${arrow}${toId}: ${m.text}`);
  });

  return lines.join('\n');
}

export function generateClassDiagram({ title, classes, relationships, colors }) {
  const lines = ['classDiagram', `    title ${title}`];

  classes.forEach(cls => {
    lines.push(`    class ${cls.name} {`);
    cls.attributes.forEach(attr => {
      lines.push(`        ${attr}`);
    });
    cls.methods.forEach(method => {
      lines.push(`        ${method}`);
    });
    lines.push('    }');
  });

  relationships.forEach(rel => {
    lines.push(`    ${rel.from} ${rel.type} ${rel.to} : ${rel.label}`);
  });

  return lines.join('\n');
}

export function generateGantt({ title, tasks, colors }) {
  const lines = [
    'gantt',
    `    title ${title}`,
    '    dateFormat YYYY-MM-DD',
    '    axisFormat %m-%d',
  ];

  tasks.forEach(task => {
    lines.push(`    ${task.name} :${task.section}, ${task.start}, ${task.duration}`);
  });

  return lines.join('\n');
}

export function generatePie({ title, data, colors }) {
  const lines = [
    'pie',
    `    title ${title}`,
  ];

  Object.entries(data).forEach(([label, value]) => {
    lines.push(`    "${label}" : ${value}`);
  });

  return lines.join('\n');
}

export function generateMindmap({ root, nodes, colors }) {
  const lines = ['mindmap', `    root(( ${root} ))`];

  const addNode = (parent, child, level = 1) => {
    const indent = ' '.repeat(level * 4);
    lines.push(`${indent}${child}`);
  };

  nodes.forEach(node => {
    if (node.parent) {
      const parentIndent = ' '.repeat(node.level * 4);
      lines.push(`${parentIndent}${node.parent}`);
    }
    addNode(node.parent || root, node.text, node.level || 1);
  });

  return lines.join('\n');
}

export const TEMPLATES = {
  'flowchart-basic': {
    type: DIAGRAM_TYPES.FLOWCHART,
    title: '基础流程图',
    generator: generateFlowchart,
    params: {
      steps: ['开始', '处理步骤1', '条件判断', '处理步骤2', '结束'],
      branches: { '是': ['分支处理A'], '否': ['分支处理B'] },
    },
  },
  'flowchart-decision': {
    type: DIAGRAM_TYPES.FLOWCHART,
    title: '决策流程',
    generator: generateFlowchart,
    params: {
      steps: ['问题', '收集信息', '分析选项', '做出决策', '执行'],
      branches: { '选项A': ['评估A'], '选项B': ['评估B'] },
    },
  },
  'sequence-api': {
    type: DIAGRAM_TYPES.SEQUENCE,
    title: 'API 调用时序',
    generator: generateSequence,
    params: {
      participants: ['客户端', 'API网关', '认证服务', '业务服务', '数据库'],
      messages: [
        { from: '客户端', to: 'API网关', text: 'HTTP请求', arrow: '->>' },
        { from: 'API网关', to: '认证服务', text: '验证Token', arrow: '->>' },
        { from: '认证服务', to: 'API网关', text: '验证结果', arrow: '-->>' },
        { from: 'API网关', to: '业务服务', text: '转发请求', arrow: '->>' },
        { from: '业务服务', to: '数据库', text: '数据操作', arrow: '->>' },
        { from: '数据库', to: '业务服务', text: '查询结果', arrow: '-->>' },
      ],
    },
  },
  'class-simple': {
    type: DIAGRAM_TYPES.CLASS,
    title: '简单类图',
    generator: generateClassDiagram,
    params: {
      classes: [
        { name: 'Animal', attributes: ['- name: String', '- age: int'], methods: ['+ speak(): void'] },
        { name: 'Dog', attributes: ['- breed: String'], methods: ['+ speak(): void'] },
        { name: 'Cat', attributes: ['- color: String'], methods: ['+ speak(): void'] },
      ],
      relationships: [
        { from: 'Dog', to: 'Animal', type: '--|>', label: '继承' },
        { from: 'Cat', to: 'Animal', type: '--|>', label: '继承' },
      ],
    },
  },
  'gantt-project': {
    type: DIAGRAM_TYPES.GANTT,
    title: '项目计划',
    generator: generateGantt,
    params: {
      tasks: [
        { name: '需求分析', section: '第一阶段', start: '2024-01-01', duration: '5d' },
        { name: '设计阶段', section: '第一阶段', start: 'after需求分析', duration: '7d' },
        { name: '开发实现', section: '第二阶段', start: 'after设计阶段', duration: '14d' },
        { name: '测试验证', section: '第二阶段', start: 'after开发实现', duration: '7d' },
        { name: '部署上线', section: '第三阶段', start: 'after测试验证', duration: '3d' },
      ],
    },
  },
  'pie-distribution': {
    type: DIAGRAM_TYPES.PIE,
    title: '资源分布',
    generator: generatePie,
    params: {
      data: { '核心功能': 40, '增强功能': 25, '维护更新': 20, '新特性': 15 },
    },
  },
};
