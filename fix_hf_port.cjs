const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

file = file.replace(
  /const PORT = 3000;/g,
  "const PORT = process.env.APPLET_ID ? 3000 : (process.env.PORT ? parseInt(process.env.PORT, 10) : 7860);"
);

fs.writeFileSync('server.ts', file);
