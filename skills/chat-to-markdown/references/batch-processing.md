# Batch Processing

Processing multiple chat log files at once.

## Shell Script Approach

Create a batch conversion script:

```bash
#!/bin/bash
# batch-convert.sh

INPUT_DIR="$1"
OUTPUT_DIR="$2"

if [ -z "$INPUT_DIR" ] || [ -z "$OUTPUT_DIR" ]; then
  echo "Usage: $0 <input-dir> <output-dir>"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

for file in "$INPUT_DIR"/*.jsonl; do
  if [ -f "$file" ]; then
    basename=$(basename "$file" .jsonl)
    echo "Converting: $basename"
    node skills/chat-to-markdown/scripts/main.js \
      -i "$file" \
      -o "$OUTPUT_DIR/${basename}.md" \
      --compact
  fi
done

echo "Done! Output in: $OUTPUT_DIR"
```

## Usage

```bash
chmod +x batch-convert.sh
./batch-convert.sh ./chats ./converted
```

## Find with xargs

```bash
find ~/.claude/chat -name "*.jsonl" | head -5 | \
  xargs -I {} node skills/chat-to-markdown/scripts/main.js -i {} -o {}.md
```

## Parallel Processing

For large numbers of files:

```bash
#!/bin/bash
# parallel-convert.sh

find "$1" -name "*.jsonl" | \
  xargs -P 4 -I {} sh -c \
    'node skills/chat-to-markdown/scripts/main.js -i "{}" -o "{}.md" --compact'
```

## Date-Based Filtering

Convert only recent files:

```bash
# Convert files modified in last 7 days
find ~/.claude/chat -name "*.jsonl" -mtime -7 | \
  while read f; do
    node skills/chat-to-markdown/scripts/main.js -i "$f" -o "./recent/$(basename $f .jsonl).md"
  done
```

## Output Organization

### By Date

```bash
#!/bin/bash
# organize-by-date.sh

node skills/chat-to-markdown/scripts/main.js -i "$1" -o "./output/$(date +%Y-%m-%d)-chat.md"
```

### By Session Count

```bash
# Split large logs by session
node skills/chat-to-markdown/scripts/main.js \
  -i chat.jsonl \
  --format json | jq -r 'keys[]' | \
  while read session; do
    node skills/chat-to-markdown/scripts/main.js \
      -i chat.jsonl \
      --session "$session" \
      -o "./sessions/${session:0:8}.md"
  done
```

## Automation with Cron

Add to crontab for daily backups:

```bash
# Edit crontab
crontab -e

# Add line - run at 6pm daily
0 18 * * * /Users/path/to/batch-convert.sh ~/.claude/chat ~/chat-backups
```
