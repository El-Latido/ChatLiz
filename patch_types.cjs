const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace('role?: string;', 'role?: string;\n  djSchedule?: { start: string, end: string };');
fs.writeFileSync('src/types.ts', code);
