const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /socket\.on\('receive_private', \(msg: any, fromUser: string\) => \{/,
  "socket.on('receive_private', (msg: any, fromUser: string) => {\n      playNotifySound();"
);

fs.writeFileSync('src/App.tsx', code);
