#!/usr/bin/env bun
/**
 * Daily Starter - Morning Ritual Assistant
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const TEMPLATES = {
  energy: `## Energy & Context
- **Mood**: [😊😐😔😠]
- **Energy Level**: [1-10]
- **Focus Period**: [morning/afternoon/evening]
`,
  yesterday: `## Yesterday Review
- ✅ Completed:
  -
- 🔄 Carried Over:
  -
- 📝 Notes:
  -
`,
  today: `## Today's Priorities
### MIT 1: [Task Name]
**Why it matters**: [Brief explanation]

### MIT 2: [Task Name]
**Why it matters**: [Brief explanation]

### MIT 3: [Task Name]
**Why it matters**: [Brief explanation]
`,
  habits: `## Habit Tracking
- [ ] Habit 1
- [ ] Habit 2
- [ ] Habit 3
`,
  eod: `## End of Day
- **Wins**: What went well today
- **Learnings**: What was discovered
- **Tomorrow**: Things to carry forward
`
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function generateJournal(context = {}) {
  const { mood, energy, focus, completed, carryover, notes, mits, habits } = context;

  return `# ${getToday()} Daily Journal

${TEMPLATES.energy.replace("[1-10]", String(energy || 5)).replace("[morning/afternoon/evening]", focus || "morning")}

${TEMPLATES.yesterday}

${TEMPLATES.today}${mits ? mits.map((m, i) => `### MIT ${i + 1}: ${m.task}
**Why it matters**: ${m.why}`).join("\n\n") : ""}

${TEMPLATES.habits}${habits ? habits.map(h => `- [ ] ${h}`).join("\n") : ""}

${TEMPLATES.eod}`;
}

function interactiveMode() {
  console.log(`
🌅 Daily Starter - Morning Ritual

Let's begin your daily routine.

1. Energy Check-in
2. Yesterday Review
3. Today's Planning
4. Habit Setup
5. Generate Journal

Use --mode flag for non-interactive usage:
  --mode plan    : Generate plan from context
  --mode habit   : Log habit completion
  --mode checkin : Quick energy check
  --mode routine : Full morning ritual
  `);
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args.find(a => a.startsWith("--mode="))?.split("=")[1] || "routine";
  const output = args.find(a => a.startsWith("-o="))?.split("=")[1] || `./daily-${getToday()}.md`;

  if (mode === "interactive" || args.length === 0) {
    interactiveMode();
    return;
  }

  let journal = generateJournal();

  if (mode === "routine" || mode === "plan") {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const yesterdayFile = `./daily-${yesterday}.md`;
    if (existsSync(yesterdayFile)) {
      console.log(`📖 Found yesterday's journal: ${yesterdayFile}`);
    }
    console.log(`🌅 Daily Journal Generated`);
    console.log(`📝 Output: ${output}`);
  } else if (mode === "habit") {
    const habit = args.find(a => a.includes("--habit="))?.split("=")[1] || "Unknown";
    journal = `# Habit Log - ${getToday()}

## Completed
- [x] ${habit}
`;
    console.log(`✅ Habit logged: ${habit}`);
  } else if (mode === "checkin") {
    journal = `# Energy Check-in - ${getToday()}

## Current State
- **Mood**: ?
- **Energy**: ?
- **Focus**: ?

## Quick Notes

`;
    console.log("⚡ Energy check-in generated");
  }

  writeFileSync(output, journal);
  console.log(`✅ Written to: ${output}`);
}

main().catch(console.error);
