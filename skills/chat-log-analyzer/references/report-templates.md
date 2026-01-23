# Report Templates

Customizing output from chat-log-analyzer.

## Available Templates

### 1. Basic HTML (Default)
Generates a clean, responsive HTML page with:
- Session overview cards
- Hour distribution bar chart
- Top tools table
- Recent sessions list

```bash
npx -y bun skills/chat-log-analyzer/scripts/main.js -i ./chat.jsonl -o report.html
```

### 2. Minimal Markdown
Lightweight text-based output for documentation.

```bash
npx -y bun skills/chat-log-analyzer/scripts/main.js -i ./chat.jsonl --format markdown -o report.md
```

### 3. JSON Data
Machine-readable output for further processing.

```bash
npx -y bun skills/chat-log-analyzer/scripts/main.js -i ./chat.jsonl --json > stats.json
```

## Customizing HTML Reports

Modify the `generateHtmlReport()` function in `scripts/main.js` to add:

### Additional Sections

```javascript
function generateHtmlReport(stats, sessions) {
  return `<html>...` + customSection + `</html>`;
}
```

### Custom Styling

Edit the `<style>` section in the HTML template:

```css
/* Change primary color */
.stat-value { color: #your-color; }

/* Adjust grid layout */
.stat-grid { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
```

### Chart Types

The default uses CSS bar charts. For advanced visualizations:

1. **Chart.js**: Add `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`
2. **D3.js**: Use D3 for complex visualizations
3. **SVG**: Generate inline SVG charts

## Report Sections Explained

### Overview Card
- Total sessions and messages
- Active days calculation
- Average messages per session

### Activity by Hour
- 24-hour bar chart
- Peak hour identification
- Work pattern analysis

### Top Tools
- CLI tools extracted from messages
- Usage frequency count
- Top 5 ranking

### Session Details
- Recent session IDs
- Message count per session
- Duration calculation
- Tools used per session

## Scheduled Reports

Create a shell script for daily reports:

```bash
#!/bin/bash
# daily-report.sh
DATE=$(date +%Y%m%d)
node skills/chat-log-analyzer/scripts/main.js \
  -i ~/.claude/chat/chat_latest.jsonl \
  -o ~/reports/claude-report-$DATE.html \
  --days 1
```

Add to crontab:
```bash
0 18 * * * ~/daily-report.sh
```
