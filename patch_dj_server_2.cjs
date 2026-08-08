const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const loginSuccessOld = `socket.emit("login_success", { username });
      socket.emit("queue_update", { queue: songQueue, current: currentRequestedSong });`;

const loginSuccessNew = `socket.emit("login_success", { username });
      socket.emit("queue_update", { queue: songQueue, current: currentRequestedSong });
      socket.emit("radio_state_update", { currentLiveDJ, streamUrl: djStreamUrl || "https://listen.moe/stream" });`;

code = code.replace(loginSuccessOld, loginSuccessNew);

fs.writeFileSync('server.ts', code);
