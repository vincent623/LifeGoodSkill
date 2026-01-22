# Changelog

English | [中文](./CHANGELOG.zh.md)

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
