const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(/socket\.on\("update_profile", async \(data, callback\) => \{[\s\S]*?\}\);/, `socket.on("broadcast_profile_change", (data) => {
      if (activeUsers[data.username]) {
          activeUsers[data.username].profilePic = data.profilePic;
          activeUsers[data.username].statusMessage = data.statusMessage;
          io.emit("active_users", Object.values(activeUsers));
      }
    });`);

fs.writeFileSync('server.ts', server);
