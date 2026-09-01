const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `      } else if (toUser === "Elizabeth") {
        callback({ success: true, msg });
      } else {`;
      
const replacement1 = `      } else if (AI_CHARACTERS[toUser]) {
        callback({ success: true, msg });
      } else {`;

code = code.replace(target1, replacement1);
fs.writeFileSync('server.ts', code);
console.log("Patched callback");
