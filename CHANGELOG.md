\n## Unreleased\n\n### Changed\n\n- **searching-youtube-videos**: Rename/optimize video-searcher skill per skill-builder conventions\n  - Fixed readline import bug in workflow.js\n  - Enhanced documentation and CLI consistency\n  - Production-ready YouTube/Bilibili search+download+ASR workflow\n\n### Technical\n\n- Added `./skills/searching-youtube-videos` to marketplace.json\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>

English | [中文](./CHANGELOG.zh.md)

## 1.3.0 - 2026-01-22

### Added

- **life-vision-protocol**: Guided protocol for Anti-Vision and Vision discovery based on "How to fix your entire life in 1 day" Part 1
- **life-interrupt-prompts**: Daily interrupt prompts generator to break autopilot mode (Part 2)
- **life-evening-review**: Evening synthesis protocol for insight integration and next day planning (Part 3)
- **life-compass**: 6-element Life Compass navigation system (Part 3+ synthesis)

### Changed

- Added Prompt Content section to 6 skills (generating-mermaid-diagrams, life-dotfiles-manager, life-excel-diff, life-markdown-normalizer, life-pdf-to-ppt, life-subtitle-processor)

### Technical

- All new skills use Bun/JS instead of Python
- Follows skill-builder best practices with complete YAML frontmatter
- Includes Script Directory and Extension Support sections

## 1.2.1 - 2026-01-22

### Updated

- **life-daily-starter**: Complete rewrite based on zw (Zed Work) workflow - Apple Reminders integration, zombie workspace detection, Obsidian bidirectional linking
- **life-file-organizer**: Added quality assessment mode with naming issue detection, duplicate finder via MD5 hash, and Chinese dangerous character detection

### Technical

- Both skills now use Bun/JS instead of Python
- Added dangerous character detection table (【】@：——空格等)
- New --mode=assess and --mode=duplicates modes

## 1.2.0 - 2026-01-22

### Added

- **life-daily-starter**: Morning ritual assistant with habit tracking and daily journal generation
- **life-file-organizer**: Automatic file organization by type, date, and duplicate detection
- **life-knowledge-sync**: Cross-platform note sync with knowledge graph generation

### Changed

- All new scripts use Bun/JS instead of Python for better CLI integration
- Added Script Directory section to all skills per CLAUDE.md guidelines

### Technical

- Version bump to v1.2.0
- 3 new skills added covering the three core directions

## 1.1.0 - 2026-01-22

### Added

- **life-decision-analysis**: Multi-perspective decision analyzer using Six Thinking Hats
- **life-generating-mermaid-diagrams**: Transform text into Mermaid diagrams with CLI tool
- **life-interview-guide**: Interview preparation analyzer with priority-ranked questions
- **life-self-awareness**: Cognitive bias analyzer for self-evaluation documents
- **life-task-breakdown**: Problem decomposition tool with Gantt chart visualization

### Changed

- **life-mermaid-master**: Improved diagram generation with better layout optimization
- **life-transcription**: Enhanced speech recognition cleanup algorithms
- **life-text-proofreader**: Added more grammar correction patterns
- **marketplace.json**: Updated skill registration format

### Removed

- **life-intention-committee**: Deprecated, functionality merged into life-decision-analysis
- **life-problem-solver**: Deprecated, functionality merged into life-task-breakdown
- **life-self-assessment**: Deprecated, functionality merged into life-self-awareness

## 1.0.0 - 2026-01-22

### Initial Release

- Initial release of LifeGoodSkill
- Project structure based on essay-skills template
- Ready for adding life improvement skills
