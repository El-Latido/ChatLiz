const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/setMessages\(prev => \[\.\.\.prev, msg\]\); playNotifySound\(\);/g, "setMessages(prev => [...prev, msg]);");
code = code.replace(/setMessages\(prev => \{ if \(prev\.some\(m => m\.id === msg\.id\)\) return prev; playNotifySound\(\); return \[\.\.\.prev, msg\]; \}\);/g, "setMessages(prev => { if (prev.some(m => m.id === msg.id)) return prev; return [...prev, msg]; });");

fs.writeFileSync('src/App.tsx', code);
