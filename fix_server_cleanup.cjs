const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(/orderBy\('createdAt', 'asc'\)/g, "orderBy('timestamp', 'asc')");
fs.writeFileSync('server.ts', server);
