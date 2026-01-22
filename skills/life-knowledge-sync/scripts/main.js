#!/usr/bin/env bun
/**
 * Knowledge Sync - Note aggregation and knowledge graph generation
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync, rmSync, readdirSync, statSync } from "fs";
import { join, dirname, extname, parse } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

function findMarkdownFiles(dir, files = []) {
  if (!existsSync(dir)) return files;

  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    if (statSync(fullPath).isDirectory()) {
      findMarkdownFiles(fullPath, files);
    } else if (extname(item).toLowerCase() === ".md") {
      files.push(fullPath);
    }
  }
  return files;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = {};
  const lines = match[1].split("\n");
  let key = null;

  for (const line of lines) {
    if (line.includes(":")) {
      const [k, v] = line.split(":");
      key = k.trim();
      frontmatter[key] = v.trim();
    } else if (key && line.trim()) {
      frontmatter[key] += "\n" + line.trim();
    }
  }

  return { frontmatter, body: content.replace(/^---\n[\s\S]*?\n---/, "").trim() };
}

function extractLinks(content) {
  const wikiLinks = content.match(/\[\[([^\]]+)\]\]/g) || [];
  const markdownLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];

  return {
    wikiLinks: wikiLinks.map(l => l.replace("[[", "").replace("]]", "")),
    markdownLinks: markdownLinks.length
  };
}

function aggregateNotes(sourceDirs, outputDir, options = {}) {
  const { deduplicate = true, verbose = true } = options;
  const allNotes = new Map();
  const duplicates = [];

  for (const sourceDir of sourceDirs) {
    const files = findMarkdownFiles(sourceDir);
    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      const { frontmatter, body } = parseFrontmatter(content);
      const title = frontmatter.title || parse(file).name;
      const links = extractLinks(content);

      const key = title.toLowerCase();
      if (allNotes.has(key)) {
        duplicates.push({ original: allNotes.get(key).file, duplicate: file });
      } else {
        allNotes.set(key, { title, content, body, frontmatter, links, file });
      }
    }
  }

  // Write aggregated notes
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  for (const [key, note] of allNotes) {
    const outputPath = join(outputDir, `${note.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`);
    writeFileSync(outputPath, note.content);
    if (verbose) console.log(`📝 ${note.title}`);
  }

  return { count: allNotes.size, duplicates };
}

function generateGraph(vaultDir, options = {}) {
  const { output, format = "mermaid", verbose = true } = options;
  const files = findMarkdownFiles(vaultDir);
  const nodes = [];
  const edges = [];
  const linkCount = {};

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const { frontmatter } = parseFrontmatter(content);
    const title = frontmatter.title || parse(file).name;
    const links = extractLinks(content);

    nodes.push(title);

    for (const link of links.wikiLinks) {
      edges.push({ from: title, to: link });
      linkCount[title] = (linkCount[title] || 0) + 1;
    }
  }

  let graphContent;
  if (format === "mermaid") {
    graphContent = `\`\`\`mermaid\ngraph TD\n`;
    for (const node of nodes) {
      const count = linkCount[node] || 0;
      const style = count === 0 ? "[Orphaned]" : count > 5 ? "[Hub]" : "";
      graphContent += `    ${node.replace(/[^a-zA-Z0-9]/g, "_")}[${node}${style}]\n`;
    }
    for (const edge of edges) {
      graphContent += `    ${edge.from.replace(/[^a-zA-Z0-9]/g, "_")} --> ${edge.to.replace(/[^a-zA-Z0-9]/g, "_")}\n`;
    }
    graphContent += "```\n";
  } else if (format === "html") {
    graphContent = generateHtmlGraph(nodes, edges, linkCount);
  }

  if (output) {
    writeFileSync(output, graphContent);
    console.log(`📊 Graph written to: ${output}`);
  }

  return { nodes: nodes.length, edges: edges.length };
}

function generateHtmlGraph(nodes, edges, linkCount) {
  const nodeJson = JSON.stringify(nodes);
  const edgeJson = JSON.stringify(edges);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Knowledge Graph</title>
  <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
  <style>
    body { margin: 0; font-family: system-ui; background: #f8f9fa; }
    svg { width: 100vw; height: 100vh; }
    .node circle { fill: #1971c2; stroke: #fff; stroke-width: 2px; }
    .node text { font-size: 12px; fill: #333; }
    .link { stroke: #adb5bd; stroke-width: 1px; }
  </style>
</head>
<body>
  <svg></svg>
  <script>
    const nodes = ${nodeJson}.map((d, i) => ({ id: d, group: ${JSON.stringify(nodes.length)} }));
    const links = ${edgeJson}.map(d => ({ source: d.from, target: d.to }));
    // D3 force simulation code would go here
    console.log("Nodes:", nodes.length, "Edges:", links.length);
  </script>
</body>
</html>`;
}

function findOrphans(vaultDir, options = {}) {
  const { verbose = true } = options;
  const files = findMarkdownFiles(vaultDir);
  const allLinks = new Set();
  const allNodes = new Set();

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const { frontmatter } = parseFrontmatter(content);
    const title = frontmatter.title || parse(file).name;

    allNodes.add(title);

    const links = extractLinks(content);
    for (const link of links.wikiLinks) {
      allLinks.add(link);
    }
  }

  const orphans = [...allNodes].filter(n => !allLinks.has(n));
  const unlinkedTargets = [...allLinks].filter(l => !allNodes.has(l));

  if (verbose) {
    console.log(`\n📊 Analysis Results`);
    console.log(`   Total Notes: ${allNodes.size}`);
    console.log(`   Total Links: ${allLinks.size}`);
    console.log(`   Orphans (no incoming): ${orphans.length}`);
    console.log(`   Broken Links: ${unlinkedTargets.length}`);
    console.log("\n🔗 Orphans:");
    for (const orphan of orphans.slice(0, 10)) {
      console.log(`   - ${orphan}`);
    }
    if (orphans.length > 10) console.log(`   ... and ${orphans.length - 10} more`);
  }

  return { orphans, unlinkedTargets };
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args.find(a => a.startsWith("--mode="))?.split("=")[1] || "help";
  const output = args.find(a => a.startsWith("-o="))?.split("=")[1];
  const format = args.find(a => a.startsWith("--format="))?.split("=")[1] || "mermaid";
  const verbose = !args.includes("--quiet");

  if (mode === "help" || args.length === 0) {
    console.log(`
📚 Knowledge Sync

Usage:
  --mode aggregate <sources...> -o <output>  : Aggregate notes
  --mode graph <vault> -o <output>           : Generate knowledge graph
  --mode orphans <vault>                      : Find orphaned notes
  --mode sync <source> <target>               : Sync between vaults

Options:
  -o, --output=<path>     Output file/directory
  --format=<mermaid|html> Graph format
    `);
    return;
  }

  if (mode === "aggregate") {
    const sources = args.filter(a => !a.startsWith("-") && !a.startsWith("--mode")).slice(1);
    const result = aggregateNotes(sources, output || "./aggregated", { verbose });
    console.log(`\n✅ Aggregated ${result.count} notes`);
    if (result.duplicates.length > 0) {
      console.log(`⚠️ Found ${result.duplicates.length} duplicates (kept first)`);
    }
  } else if (mode === "graph") {
    const vault = args.find(a => !a.startsWith("-")) || ".";
    const result = generateGraph(vault, { output, format, verbose });
    console.log(`\n✅ Graph: ${result.nodes} nodes, ${result.edges} edges`);
  } else if (mode === "orphans") {
    const vault = args.find(a => !a.startsWith("-") && !a.startsWith("--mode")) || ".";
    findOrphans(vault, { verbose });
  } else if (mode === "sync") {
    console.log("🔄 Sync mode - implement vault synchronization");
  }
}

main().catch(console.error);
