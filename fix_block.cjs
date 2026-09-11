const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
    `    });
      if (!currentUsername) return;`,
    `    });
    
    socket.on("toggle_block", async (targetUser) => {
      if (!currentUsername) return;`
);

fs.writeFileSync('server.ts', code);
console.log("Fixed toggle_block syntax error");
