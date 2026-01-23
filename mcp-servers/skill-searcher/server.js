#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";
import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = new Server({
  name: "skill-searcher",
  version: "1.0.0",
});

const CACHE_DIR = ".skill-searcher-cache";
const CACHE_TTL = 3600000;
const INSTALLED_SKILLS_FILE = ".installed-skills.json";

const KEYWORD_EXPANSION = {
  skill: ["skill", "plugin", "tool", "workflow", "prompt"],
  claude: ["claude", "ai", "llm", "assistant", "agent"],
  organize: ["organize", "manage", "catalog", "index", "collection"],
  note: ["note", "笔记", "markdown", "documentation", "knowledge"],
  knowledge: ["knowledge", "knowledge-base", "wiki", "documentation"],
  code: ["code", "编程", "development", "repository", "git"],
  file: ["file", "document", "data", "content", "storage"],
  search: ["search", "discover", "find", "query", "retrieve"],
  recommend: ["recommend", "suggest", "match", "filter"],
  efficiency: ["efficiency", "productivity", "workflow", "automation"],
};

const PROJECTFIGS = {
  "skill-repository": {
    suffixes: ["skill", "plugin", "workflow"],
    relatedSearches: ["skill organizer", "claude skill discovery", "productivity tool"],
  },
  "note-repository": {
    suffixes: ["note", "markdown", "knowledge"],
    relatedSearches: ["note organization", "markdown management", "documentation workflow"],
  },
  "code-repository": {
    suffixes: ["code", "development", "git"],
    relatedSearches: ["code analysis", "dev workflow", "git management"],
  },
  "knowledge-base": {
    suffixes: ["knowledge", "wiki", "documentation"],
    relatedSearches: ["knowledge management", "information retrieval"],
  },
  other: {
    suffixes: ["tool", "plugin", "automation"],
    relatedSearches: ["productivity tool", "workflow automation"],
  },
};

function loadInstalledSkills() {
  try {
    if (existsSync(INSTALLED_SKILLS_FILE)) {
      return JSON.parse(readFileSync(INSTALLED_SKILLS_FILE, "utf-8"));
    }
  } catch {
    console.error("Failed to load installed skills file");
  }
  return {};
}

function saveInstalledSkills(skills) {
  try {
    writeFileSync(INSTALLED_SKILLS_FILE, JSON.stringify(skills, null, 2));
  } catch (error) {
    console.error(`Failed to save installed skills: ${error.message}`);
  }
}

function loadCache(query) {
  try {
    const cacheFile = `${CACHE_DIR}/${encodeURIComponent(query)}.json`;
    if (!existsSync(cacheFile)) return null;
    const cache = JSON.parse(readFileSync(cacheFile, "utf-8"));
    if (Date.now() - cache.timestamp > CACHE_TTL) return null;
    return cache.results;
  } catch {
    return null;
  }
}

function saveCache(query, results) {
  try {
    if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
    const cacheFile = `${CACHE_DIR}/${encodeURIComponent(query)}.json`;
    writeFileSync(cacheFile, JSON.stringify({ timestamp: Date.now(), results }));
  } catch (error) {
    console.error(`Failed to save cache: ${error.message}`);
  }
}

function detectProjectType(rootDir) {
  const indicators = {
    "skill-repository": ["skills", "skill-", "plugin", ".claude-plugin"],
    "note-repository": ["notes", "note-", "obsidian", "logseq", "markdown"],
    "code-repository": [".git", "package.json", "Cargo.toml", "pyproject.toml"],
    "knowledge-base": ["wiki", "docs", "documentation", "KB"],
  };
  const scores = { "skill-repository": 0, "note-repository": 0, "code-repository": 0, "knowledge-base": 0 };

  try {
    const entries = readdirSync(rootDir, { withFileTypes: true });
    for (const entry of entries) {
      const name = entry.name.toLowerCase();
      for (const [type, patterns] of Object.entries(indicators)) {
        if (patterns.some((p) => name.includes(p))) scores[type]++;
      }
    }
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sorted[0][1] > 0 ? sorted[0][0] : "other";
  } catch {
    return "other";
  }
}

async function searchSkills(query) {
  const cached = loadCache(query);
  if (cached) return cached;

  return new Promise((resolve, reject) => {
    const proc = spawn("42plugin", ["search", query, "--type", "skill"], { stdio: "pipe" });
    let output = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (output += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    proc.on("error", (error) => {
      reject(new Error(`Failed to execute 42plugin search: ${error.message}. Make sure 42plugin CLI is installed.`));
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`42plugin search failed with exit code ${code}. stderr: ${stderr}`));
        return;
      }
      const results = parseSearchOutput(output);
      saveCache(query, results);
      resolve(results);
    });
  });
}

function parseSearchOutput(output) {
  const results = [];
  const lines = output.split("\n");
  let currentItem = null;

  for (const line of lines) {
    const skillMatch = line.match(/^⚡\s+(.+?)\s+\[Skill\]/);
    const versionMatch = line.match(/v(\S+)\s+·\s+(\d+)\s+下载/);
    const installMatch = line.match(/安装:\s*42plugin install\s+(.+)/);
    if (line.match(/找到\s*(\d+)\s*个/) || line.includes("是否继续查看")) continue;

    if (skillMatch) {
      if (currentItem?.name) results.push(currentItem);
      currentItem = {
        fullName: skillMatch[1],
        name: skillMatch[1].split("/").pop(),
        description: "",
        version: "",
        downloads: "",
      };
    } else if (currentItem && versionMatch) {
      currentItem.version = versionMatch[1];
      currentItem.downloads = versionMatch[2];
    } else if (currentItem && installMatch) {
      currentItem.fullName = installMatch[1];
    } else if (currentItem && line.trim() && !line.includes("安装:")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("在内容") && !trimmed.startsWith("该插件")) {
        currentItem.description += (currentItem.description ? " " : "") + trimmed;
      }
    }
  }
  if (currentItem?.name) results.push(currentItem);
  return results;
}

async function installSkill(fullName) {
  return new Promise((resolve, reject) => {
    const proc = spawn("42plugin", ["install", fullName], { stdio: "pipe" });
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    proc.on("error", (error) => {
      reject(new Error(`Failed to execute 42plugin install: ${error.message}. Make sure 42plugin CLI is installed.`));
    });

    proc.on("close", (code) => {
      const success = code === 0;
      const installedSkills = loadInstalledSkills();
      if (success) {
        installedSkills[fullName] = {
          installedAt: new Date().toISOString(),
          introspected: false,
        };
        saveInstalledSkills(installedSkills);
      }
      resolve({ success, output: stdout, stderr, fullName });
    });
  });
}

async function introspectSkill(fullName) {
  const skillName = fullName.split("/").pop();
  const skillPaths = [
    `skills/${skillName}/SKILL.md`,
    `skills/${skillName}/README.md`,
    `${process.env.HOME}/.claude/skills/${skillName}/SKILL.md`,
    `${process.env.HOME}/.claude/skills/${skillName}/README.md`,
  ];

  let info = { name: fullName, description: "", usage: [], scripts: [] };

  for (const path of skillPaths) {
    if (existsSync(path)) {
      try {
        const content = readFileSync(path, "utf-8");
        const descMatch = content.match(/description:\s*(.+)/);
        if (descMatch) info.description = descMatch[1].trim();
        const usageMatches = [...content.matchAll(/```bash\n([\s\S]*?)\n```/g)];
        info.scripts = usageMatches.map((m) => m[1].trim()).slice(0, 3);
        break;
      } catch (error) {
        console.error(`Failed to read skill file ${path}: ${error.message}`);
      }
    }
  }

  const installedSkills = loadInstalledSkills();
  if (installedSkills[fullName]) {
    installedSkills[fullName].introspected = true;
    installedSkills[fullName].info = info;
    saveInstalledSkills(installedSkills);
  }

  return info;
}

async function exploreProject(rootDir = process.cwd()) {
  const items = [];
  const categories = [];

  try {
    const entries = readdirSync(rootDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        items.push(entry.name);
        if (entry.name.startsWith("life-")) {
          categories.push(entry.name.replace("life-", "").replace("-", " "));
        }
      }
    }
  } catch (error) {
    throw new Error(`Failed to read directory ${rootDir}: ${error.message}`);
  }

  let description = "";
  for (const rf of ["README.md", "readme.md", "README.zh.md"]) {
    const rfPath = join(rootDir, rf);
    if (existsSync(rfPath)) {
      try {
        description = readFileSync(rfPath, "utf-8").slice(0, 200);
        break;
      } catch {
        console.error(`Failed to read README file: ${rfPath}`);
      }
    }
  }

  return {
    projectName: rootDir.split("/").pop() || "Unknown",
    projectType: detectProjectType(rootDir),
    projectDescription: description,
    existingItems: items,
    categories: [...new Set(categories)],
  };
}

function calculateMatchScore(result, projectType, keywords) {
  let score = 50;
  const descLower = result.description.toLowerCase();
  const nameLower = result.name.toLowerCase();

  const matchedKeywords = keywords.filter((k) => descLower.includes(k) || nameLower.includes(k));
  score += matchedKeywords.length * 8;
  if (projectType === "skill-repository" && (descLower.includes("skill") || descLower.includes("plugin"))) score += 10;

  const downloads = parseInt(result.downloads || "0");
  let quality = downloads > 1000 ? "优秀" : downloads > 100 ? "良好" : downloads > 10 ? "一般" : "新发布";

  return {
    ...result,
    score: Math.min(score, 100),
    matchLevel: score >= 75 ? "高" : score >= 50 ? "中" : "低",
    quality,
  };
}

const TOOLS = [
  {
    name: "search_skills",
    description:
      "Search for skills in the 42plugin marketplace. Supports type-specific search strategies based on project type (skill-repository, note-repository, code-repository, knowledge-base). Automatically expands keywords for better results.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query keywords (e.g., 'pdf converter', '翻译')",
          examples: ["skill organizer", "markdown note", "pdf converter", "翻译"],
        },
        projectType: {
          type: "string",
          enum: ["skill-repository", "note-repository", "code-repository", "knowledge-base", "other"],
          description: "Project type for targeted search strategy",
          examples: ["skill-repository", "note-repository"],
        },
        autoExpand: {
          type: "boolean",
          description: "Whether to automatically expand keywords with related terms",
          default: true,
        },
      },
      required: ["query"],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: "explore_project",
    description:
      "Explore a project directory and generate an exploration report. Automatically detects project type based on directory structure (skills, notes, code, knowledge-base). Lists existing resources and categories.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Project directory path to explore",
          examples: [".", "/path/to/project", "~/projects/my-skills"],
        },
      },
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: "install_skill",
    description:
      "Install a skill from the 42plugin marketplace. Optionally auto-introspects the installed skill by reading its SKILL.md to extract description, usage examples, and scripts. Stores skill information for later use.",
    inputSchema: {
      type: "object",
      properties: {
        fullName: {
          type: "string",
          description: "Full skill name in author/skill-name format",
          examples: ["life-good-skill/life-pdf-helper", "anthropic/ClaudeCode"],
        },
        autoIntrospect: {
          type: "boolean",
          description: "Whether to automatically read and store skill usage info after installation",
          default: true,
        },
      },
      required: ["fullName"],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  {
    name: "get_skill_info",
    description:
      "Retrieve stored information about an installed skill, including description and usage examples extracted during installation. Returns null if skill not found or not introspected.",
    inputSchema: {
      type: "object",
      properties: {
        fullName: {
          type: "string",
          description: "Full skill name (author/skill-name) to look up",
          examples: ["life-good-skill/life-pdf-helper"],
        },
      },
      required: ["fullName"],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: "list_installed_skills",
    description:
      "List all skills that have been installed through skill-searcher. Returns a dictionary of installed skills with their metadata (installation time, introspected status, skill info).",
    inputSchema: {
      type: "object",
      properties: {},
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: "ask_user_preference",
    description:
      "Present search results to the user and ask for preference or refinement. Use this to implement interactive feedback loops where the user can select from results or provide additional criteria.",
    inputSchema: {
      type: "object",
      properties: {
        results: {
          type: "string",
          description: "JSON stringified array of search results to present",
          examples: ['[{"name":"skill1","score":85},{"name":"skill2","score":72}]'],
        },
        question: {
          type: "string",
          description: "Question to ask the user about their preference",
          examples: ["Which skill would you like to install?", "Do you want to refine your search with more specific keywords?"],
        },
      },
      required: ["results", "question"],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, () => ({
  tools: TOOLS,
}));

server.setRequestHandler(ListResourcesRequestSchema, () => ({
  resources: [
    { uri: "skill-searcher://installed", name: "Installed Skills", description: "All skills installed via skill-searcher" },
    { uri: "skill-searcher://cache", name: "Search Cache", description: "Cached search results (1 hour TTL)" },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  if (uri === "skill-searcher://installed") {
    return { contents: [{ uri, text: JSON.stringify(loadInstalledSkills(), null, 2) }] };
  }
  if (uri === "skill-searcher://cache") {
    return { contents: [{ uri, text: "Cache info available via search_skills tool with cached results" }] };
  }
  return { contents: [{ uri, text: `Unknown resource: ${uri}` }] };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_skills": {
        const { query, projectType, autoExpand = true } = args;
        let keywords = [query.toLowerCase()];
        if (autoExpand) {
          for (const [word, expansions] of Object.entries(KEYWORD_EXPANSION)) {
            if (query.toLowerCase().includes(word)) keywords.push(...expansions);
          }
        }
        const config = PROJECTFIGS[projectType || "other"];
        const searchQueries = [...new Set([...keywords, ...config.relatedSearches])].slice(0, 6);

        const allResults = new Map();
        const errors = [];

        for (const q of searchQueries) {
          try {
            const results = await searchSkills(q);
            for (const r of results) {
              if (!allResults.has(r.fullName))
                allResults.set(r.fullName, calculateMatchScore(r, projectType, keywords));
            }
          } catch (error) {
            errors.push(`Search "${q}" failed: ${error.message}`);
          }
        }

        const sorted = [...allResults.values()].sort((a, b) => b.score - a.score);
        const responseData = {
          results: sorted.slice(0, 10),
          total: sorted.length,
          searchQueries,
          errors: errors.length > 0 ? errors : undefined,
        };

        return {
          content: [{ type: "text", text: JSON.stringify(responseData, null, 2) }],
        };
      }

      case "explore_project": {
        const report = await exploreProject(args.path);
        return { content: [{ type: "text", text: JSON.stringify(report, null, 2) }] };
      }

      case "install_skill": {
        const { fullName, autoIntrospect = true } = args;
        const result = await installSkill(fullName);
        if (result.success && autoIntrospect) {
          const info = await introspectSkill(fullName);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, skill: info }, null, 2) }] };
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: result.success,
                  fullName: result.fullName,
                  message: result.success ? "Skill installed successfully" : "Installation failed",
                  stderr: result.stderr || undefined,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "get_skill_info": {
        const skills = loadInstalledSkills();
        const info = skills[args.fullName]?.info || null;
        return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
      }

      case "list_installed_skills": {
        return { content: [{ type: "text", text: JSON.stringify(loadInstalledSkills(), null, 2) }] };
      }

      case "ask_user_preference": {
        const { results, question } = args;
        return {
          content: [
            { type: "text", text: `## Question\n\n${question}` },
            { type: "text", text: `## Results\n\n${results}` },
            { type: "text", text: "\n**Please respond with your preference or refinement request.**" },
          ],
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}. Available tools: ${TOOLS.map((t) => t.name).join(", ")}` }],
          isError: true,
        };
    }
  } catch (error) {
    const toolName = name || "unknown";
    return {
      content: [
        {
          type: "text",
          text: `Error executing ${toolName}: ${error.message}\n\nPossible solutions:\n- Check that 42plugin CLI is installed and in PATH\n- Verify the skill name format is correct (author/skill-name)\n- Ensure the project path exists and is accessible`,
        },
      ],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.error("Skill Searcher MCP Server running");
}).catch((error) => {
  console.error(`Failed to start MCP server: ${error.message}`);
  process.exit(1);
});
