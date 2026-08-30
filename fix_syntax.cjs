const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The faulty string is:
const toRemove = `      const code = Math.floor(1e5 + Math.random() * 9e5).toString();
      recoveryCodes[username] = code;
      callback({ success: true, code });
    });`;

if (code.includes(toRemove)) {
    code = code.replace(toRemove, "");
}

fs.writeFileSync('server.ts', code);
