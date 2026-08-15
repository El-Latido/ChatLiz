const fs = require('fs');
let file = fs.readFileSync('vite.config.ts', 'utf8');
file = file.replace(/base: '\.\/',/g, "base: '/',");
fs.writeFileSync('vite.config.ts', file);
