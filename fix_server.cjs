const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');
file = file.replace(/console\.error\("Petición con JSON inválido bloqueada para evitar crash\."\);/g, '// console.error("Invalid JSON blocked");');
fs.writeFileSync('server.ts', file);
