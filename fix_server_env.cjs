const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');
file = file.replace(/if\s*\(process\.env\.NODE_ENV\s*!==\s*"production"\)\s*\{/g, 'if (process.env.NODE_ENV !== "production" && !require("fs").existsSync(require("path").join(process.cwd(), "dist", "index.html"))) {');
fs.writeFileSync('server.ts', file);
