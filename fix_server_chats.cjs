const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');
file = file.replace(/private_messages/g, 'chats');
fs.writeFileSync('server.ts', file);
