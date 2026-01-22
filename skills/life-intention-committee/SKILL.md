---
name: life-intention-committee
description: Intention discovery assistant using Six Thinking Hats framework. Analyzes user goals from multiple perspectives to uncover true intent, hidden needs, and underlying motivations. Use when user needs deep intent analysis, decision making support, or multi-perspective exploration.
---

# Intention Discovery Assistant

Discover true intent through multi-perspective analysis using the Six Thinking Hats framework.

## Usage

```bash
# Start intention discovery session
/life-intention-committee

# Provide your goal or question when prompted
# e.g., "I want to start a business but feel uncertain"
```

## About Six Thinking Hats

| Hat | Color | Role | Focus |
|-----|-------|------|-------|
| 💙 | Blue | Process Controller | Organization, summary, decision |
| 🤍 | White | Data Analyst | Facts, data, information |
| ❤️ | Red | Emotion Expert | Intuition, feelings, emotions |
| 🖤 | Black | Critical Thinker | Risks, problems, potential issues |
| 💛 | Yellow | Optimist | Value, advantages, opportunities |
| 💚 | Green | Innovator | Creativity, possibilities, alternatives |

## Modes

- **[A] Auto Mode**: All hats run sequentially, each perspective presented
- **[M] Manual Mode**: Control which hat speaks (input 1-6)
  - 1=White, 2=Red, 3=Black, 4=Yellow, 5=Green, 6=Blue
  - 0=Progress, 9=Switch to auto
- **[H] Hybrid Mode**: AI proceeds automatically, consults at key points

## Best For

- Business decision making
- Product design planning
- Personal goal clarification
- Problem solving
- Strategy development

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-intention-committee/EXTEND.md` (project)
2. `~/.life-good-skill/life-intention-committee/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.
