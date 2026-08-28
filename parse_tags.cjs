const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<\/?([a-zA-Z0-9]+)(\s|>)/g;
let match;
let depth = 0;
const stack = [];

while ((match = regex.exec(code)) !== null) {
    // Only check lines 820 to 940
    const before = code.substring(0, match.index);
    const lineNum = before.split('\n').length;
    
    if (lineNum < 820) continue;
    if (lineNum > 940) break;

    const isClosing = match[0].startsWith('</');
    const tag = match[1];
    
    // Ignore self-closing tags (this is a naive check, we should look at the full tag)
    // Actually, in JSX <img ... /> is self closing. <input /> is self closing.
    // Let's get the full tag content to check if it ends with '/>'
    const endIdx = code.indexOf('>', match.index);
    const fullTag = code.substring(match.index, endIdx + 1);
    
    if (fullTag.endsWith('/>')) continue;

    if (!isClosing) {
        stack.push({tag, line: lineNum});
        depth++;
    } else {
        const top = stack.pop();
        depth--;
        if (top && top.tag !== tag) {
            console.log(`MISMATCH at line ${lineNum}: Expected </${top.tag}> from line ${top.line}, found </${tag}>`);
        }
    }
}
