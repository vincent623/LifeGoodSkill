# Styling Options

Customizing the appearance of converted Markdown output.

## Output Formats

### Markdown (Default)
Plain text Markdown suitable for:
- Version control
- Documentation
- Text editors
- Further processing

### HTML
Full HTML document with embedded styles:
- Ready to share
- Preserves code highlighting
- Includes metadata styling

## Markdown Styling

### Code Blocks

The converter preserves code blocks from tool outputs:

```markdown
Here's the result:

```javascript
const result = process(data);
console.log(result);
```
```

### Emphasis and Bold

Markdown syntax is preserved:
- `*italic*` → *italic*
- `**bold**` → **bold**
- `` `code` `` → `code`

### Blockquotes

Metadata and quotes use blockquotes:
```markdown
> Session ID: abc123
> Created: 2026-01-22
```

## HTML Styling

The default HTML template includes:

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 6px;
}

blockquote {
  background: #f8f9fa;
  border-left: 4px solid #2563eb;
}
```

## Custom CSS Classes

Add custom styles by modifying `buildHtml()`:

```javascript
function buildHtml(markdown) {
  const customStyles = `
    <style>
      .user-message { background: #e3f2fd; }
      .assistant-message { background: #f3e5f5; }
      .timestamp { color: #9e9e9e; font-size: 0.8em; }
    </style>
  `;
  // ... rest of function
}
```

## Syntax Highlighting

For enhanced code highlighting, add Prism.js:

```html
<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
```

## Custom Templates

Create a custom template file:

```javascript
// templates/custom.js
export function buildCustomHtml(markdown, options) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>${options.title || 'Chat Conversation'}</title>
  <link rel="stylesheet" href="${options.css || 'style.css'}">
</head>
<body>
  ${markdown}
</body>
</html>`;
}
```

Then import in main.js:
```javascript
import { buildCustomHtml } from './templates/custom.js';
```
