## Unreleased

### Added

- **skill-searcher**: Enhanced with multi-strategy search and Chinese keyword expansion
  - Fixed spawn bug, added JSON output parsing
  - Auto-install detection via Homebrew for life-mole-cleaner
  - Multi-strategy search with keyword expansion (效率→productivity, task, organize...)
  - Result deduplication and display improvements

- **life-mole-cleaner**: New Mac cleanup skill using Mole
  - Safe preview → confirm → execute workflow
  - Auto-installs Mole via Homebrew if not present
  - Whitelist protection for critical directories
  - Frees ~4-6GB of disk space safely

### Technical

- Added `./skills/life-mole-cleaner` to marketplace.json

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

---

English | [中文](./CHANGELOG.zh.md)

## 1.4.0 - 2026-01-24

### Added

- **skill-searcher**: Enhanced with multi-strategy search and Chinese keyword expansion
  - Fixed spawn bug, added JSON output parsing
  - Auto-install detection via Homebrew for life-mole-cleaner
  - Multi-strategy search with keyword expansion (效率→productivity, task, organize...)
  - Result deduplication and display improvements

- **life-mole-cleaner**: New Mac cleanup skill using Mole
  - Safe preview → confirm → execute workflow
  - Auto-installs Mole via Homebrew if not present
  - Whitelist protection for critical directories
  - Frees ~4-6GB of disk space safely

### Technical

- Added `./skills/life-mole-cleaner` to marketplace.json
- Updated marketplace version to 1.4.0

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
