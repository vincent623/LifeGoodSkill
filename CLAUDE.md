# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Code marketplace plugin for LifeGoodSkill - skills for improving daily life efficiency.

## Architecture

Skills are organized into plugin categories in `marketplace.json`:

```
skills/
├── [life-skills]              # Life improvement skills
│   └── <skill-name>/          # Individual skill
│       ├── SKILL.md           # YAML front matter (name, description) + documentation
│       ├── scripts/           # TypeScript implementations
│       └── prompts/           # AI generation guidelines (optional)
```

**Plugin Categories**:
| Category | Description |
|----------|-------------|
| `life-skills` | Skills that improve daily life efficiency |

Each skill contains:
- `SKILL.md` - YAML front matter (name, description) + documentation
- `scripts/` - TypeScript implementations
- `prompts/` - AI generation guidelines (optional)

## Running Skills

All scripts run via Bun (no build step):

```bash
npx -y bun skills/<skill>/scripts/main.ts [options]
```

Examples:
```bash
# Basic execution
npx -y bun skills/<skill>/scripts/main.ts "input content"

# With options
npx -y bun skills/<skill>/scripts/main.ts --option value
```

## Key Dependencies

- **Bun**: TypeScript runtime (via `npx -y bun`)
- **No npm packages**: Self-contained TypeScript, no external dependencies

## Plugin Configuration

`.claude-plugin/marketplace.json` defines plugin metadata and skill paths. Version follows semver.

## Release Process

**IMPORTANT**: When user requests release/发布/push, follow this workflow:

1. `CHANGELOG.md` + `CHANGELOG.zh.md` - Both must be updated
2. `marketplace.json` version bump
3. `README.md` + `README.zh.md` if applicable
4. All files committed together before tag

## Adding New Skills

1. Create `skills/<skill-name>/SKILL.md` with YAML front matter
   - Directory name: `<skill-name>`
   - SKILL.md `name` field: `<skill-name>`
2. Add TypeScript in `skills/<skill-name>/scripts/`
3. Add prompt templates in `skills/<skill-name>/prompts/` if needed
4. Register in `marketplace.json`

### Script Directory Template

Every SKILL.md with scripts MUST include this section after Usage:

```markdown
## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.ts`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point |
| `scripts/other.ts` | Other functionality |
```

When referencing scripts in workflow sections, use `${SKILL_DIR}/scripts/<name>.ts` so agents can resolve the correct path.

## Code Style

- TypeScript throughout, no comments
- Async/await patterns
- Short variable names
- Type-safe interfaces

## Extension Support

Every SKILL.md MUST include an Extension Support section at the end:

```markdown
## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/<skill-name>/EXTEND.md` (project)
2. `~/.life-good-skill/<skill-name>/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.
```

Replace `<skill-name>` with the actual skill name.
