const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

const targetDisconnect = `        if (activeUsers[currentUsername]) {
          delete activeUsers[currentUsername];
          emitActiveUsers();
        }`;
const replaceDisconnect = `        if (activeUsers[currentUsername] && activeUsers[currentUsername].socketId === socket.id) {
          delete activeUsers[currentUsername];
          emitActiveUsers();
        }`;
file = file.replace(targetDisconnect, replaceDisconnect);
fs.writeFileSync('server.ts', file);
