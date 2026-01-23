# LifeGoodSkill

English | [中文](./README.zh.md)

Skills for improving daily life efficiency with Claude Code.

## Prerequisites

- Node.js environment installed
- Ability to run `npx bun` commands

## Installation

### Quick Install (Recommended)

```bash
npx skills add <owner>/LifeGoodSkill
```

### Register as Plugin Marketplace

Run the following command in Claude Code:

```bash
/plugin marketplace add <owner>/LifeGoodSkill
```

### Install Skills

**Option 1: Via Browse UI**

1. Select **Browse and install plugins**
2. Select **LifeGoodSkill**
3. Select the plugin(s) you want to install
4. Select **Install now**

**Option 2: Direct Install**

```bash
/plugin install life-skills@LifeGoodSkill
```

**Option 3: Ask the Agent**

Simply tell Claude Code:

> Please install Skills from github.com/<owner>/LifeGoodSkill

### Available Plugins

| Plugin | Description |
|--------|-------------|
| **generating-mermaid-diagrams** | Transform text into professional Mermaid diagrams with CLI tool |
| **life-daily-starter** | Morning ritual assistant with habit tracking and daily journal generation |
| **life-decision-analysis** | Multi-perspective decision analyzer using Six Thinking Hats |
| **life-dotfiles-manager** | Deploy and sync development environment with one command |
| **life-excel-diff** | Batch analyze Excel files and generate AI-powered summary reports |
| **life-file-organizer** | Automatically organize files by type, date, and detect duplicates |
| **life-interview-guide** | Interview preparation analyzer with priority-ranked questions |
| **life-knowledge-sync** | Sync and aggregate notes across Obsidian, Logseq, with knowledge graphs |
| **life-markdown-normalizer** | Standardize markdown notes with unified naming and tags |
| **life-meeting-summary** | Convert raw meeting notes into professional minutes |
| **life-okr-generator** | Generate SMART-compliant OKR documents from job descriptions |
| **life-pdf-to-ppt** | Convert PDF pages to editable PowerPoint presentations |
| **life-self-awareness** | Cognitive bias analyzer for self-evaluation documents |
| **life-subtitle-processor** | Convert video subtitles to structured knowledge slices |
| **life-task-breakdown** | Problem decomposition tool with Gantt chart visualization |
| **life-text-proofreader** | Professional Chinese text proofreader for typos and grammar |
| **life-transcription** | Transcription cleanup and organization tools for audio |
| **life-translation** | Professional translation tools for articles and content |
| **life-compass** | 6-element Life Compass navigation system with Anti-Vision, Vision, goals, and constraints |
| **life-evening-review** | Evening synthesis protocol for daily insight integration and next day planning |
| **life-interrupt-prompts** | Daily interrupt prompts generator to break autopilot mode |
| **life-vision-protocol** | Guided protocol for Anti-Vision and Vision discovery |
| **chat-log-analyzer** | Parse Claude Code chat logs and generate productivity reports |
| **chat-to-markdown** | Convert JSONL chat logs to readable Markdown format |

## Update Skills

To update skills to the latest version:

1. Run `/plugin` in Claude Code
2. Switch to **Marketplaces** tab (use arrow keys or Tab)
3. Select **LifeGoodSkill**
4. Choose **Update marketplace**

You can also **Enable auto-update** to get the latest versions automatically.

## Available Skills

### life-decision-analysis

Multi-perspective decision analyzer using Six Thinking Hats with multi-round debate simulation and weighted scoring.

```bash
/life-decision-analysis
```

### life-dotfiles-manager

Deploy and sync your development environment with one command. Includes tool installation, version management, and mirror source configuration.

```bash
/life-dotfiles-manager deploy
/life-dotfiles-manager sync
/life-dotfiles-manager status
```

### life-excel-diff

Batch analyze multiple Excel files with consistent structure, extract differences and anomalies, and generate summary reports with AI-powered insights.

```bash
/life-excel-diff ./reports/
```

### life-generating-mermaid-diagrams

Transform text content into professional Mermaid diagrams with CLI tool. Supports validation, layout optimization, and HTML export.

```bash
npx -y bun skills/generating-mermaid-diagrams/scripts/main.js "流程描述" -t flowchart -o diagram.html
```

### life-interview-guide

Interview preparation analyzer that compares resume and job description to generate priority-ranked questions and identifies skill gaps.

```bash
/life-interview-guide
```

### life-markdown-normalizer

Standardize markdown notes with unified timestamp naming, YAML frontmatter, and intelligent tag generation.

```bash
/life-markdown-normalizer ./notes/
```

### life-mermaid-master

Creates professional Mermaid flowcharts using structured thinking and clear visual design.

```bash
/life-mermaid-master
```

### life-meeting-summary

Convert raw meeting notes into professional meeting minutes.

```bash
/life-meeting-summary
```

### life-okr-generator

Generate SMART-compliant OKR documents from job descriptions and planning cycles.

```bash
/life-okr-generator
```

### life-pdf-to-ppt

Convert PDF pages to editable PowerPoint presentations using AI-powered vectorization.

```bash
/life-pdf-to-ppt ./document.pdf
```

### life-self-awareness

Cognitive bias analyzer that examines self-evaluation documents and detects overestimation, underconfidence, and imposter syndrome patterns.

```bash
/life-self-awareness
```

### life-subtitle-processor

Convert video subtitles to structured knowledge slices with format conversion and semantic segmentation.

```bash
/life-subtitle-processor ./video.srt
```

### life-task-breakdown

Problem decomposition tool that converts complex problems into actionable task lists with Gantt charts and dependency visualization.

```bash
/life-task-breakdown
```

### life-text-proofreader

Professional Chinese text proofreader that identifies and corrects typos and grammar errors.

```bash
/life-text-proofreader
```

### life-transcription

Transcription cleanup and organization tools for audio content.

```bash
/life-transcription
```

### life-translation

Professional translation tools for articles and content with multiple modes.

```bash
/life-translation
```

### chat-log-analyzer

Parse Claude Code chat logs and generate productivity reports including frequently used skills, work duration, task completion rate, and activity patterns.

```bash
npx -y bun skills/chat-log-analyzer/scripts/main.js -i ./chat/chat_latest.jsonl -o ./report.html
```

### chat-to-markdown

Convert JSONL chat logs to readable Markdown format with proper formatting, syntax highlighting, and conversation structure.

```bash
npx -y bun skills/chat-to-markdown/scripts/main.js -i ./chat/chat_latest.jsonl -o ./chat.md
```

## Environment Configuration

Some skills require API keys or custom configuration. Environment variables can be set in `.env` files:

**Load Priority** (higher priority overrides lower):
1. CLI environment variables (e.g., `API_KEY=xxx /skill-name ...`)
2. `process.env` (system environment)
3. `<cwd>/.life-good-skill/.env` (project-level)
4. `~/.life-good-skill/.env` (user-level)

**Setup**:

```bash
# Create user-level config directory
mkdir -p ~/.life-good-skill

# Create .env file
cat > ~/.life-good-skill/.env << 'EOF'
# API keys and configuration
API_KEY=your-key-here
EOF
```

**Project-level config** (for team sharing):

```bash
mkdir -p .life-good-skill
# Add .life-good-skill/.env to .gitignore to avoid committing secrets
echo ".life-good-skill/.env" >> .gitignore
```

## Customization

All skills support customization via `EXTEND.md` files. Create an extension file to override default styles, add custom configurations, or define your own presets.

**Extension paths** (checked in priority order):
1. `.life-good-skill/<skill-name>/EXTEND.md` - Project-level (for team/project-specific settings)
2. `~/.life-good-skill/<skill-name>/EXTEND.md` - User-level (for personal preferences)

**Example**: To customize a skill:

```bash
mkdir -p .life-good-skill/<skill-name>
```

Then create `.life-good-skill/<skill-name>/EXTEND.md`:

```markdown
## Custom Configuration

Your custom settings here...
```

The extension content will be loaded before skill execution and override defaults.

## License

MIT
