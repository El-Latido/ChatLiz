const fs = require('fs');

let content = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

// Replace CSS variables with explicit Tailwind colors
content = content.replace(/var\(--bg-modal\)/g, '#12141c');
content = content.replace(/var\(--text-primary\)/g, '#ffffff');
content = content.replace(/var\(--text-secondary\)/g, '#9ca3af'); // gray-400
content = content.replace(/var\(--border-color\)/g, 'rgba(255,255,255,0.1)'); // border-white/10
content = content.replace(/var\(--text-accent\)/g, '#D4AF37');
content = content.replace(/var\(--bg-card\)/g, '#1a1d27');
content = content.replace(/var\(--bg-input\)/g, '#0f111a');

fs.writeFileSync('src/components/ProfileConfigModal.tsx', content);
