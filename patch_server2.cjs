const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const onConnect = `      socket.emit("update_users", Object.values(activeUsers));
      socket.emit("queue_update", { queue: songQueue, current: currentRequestedSong });`;

code = code.replace(`      socket.emit("update_users", Object.values(activeUsers));`, onConnect);
fs.writeFileSync('server.ts', code);
