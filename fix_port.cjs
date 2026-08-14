const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

file = file.replace(
  /const PORT = process\.env\.APPLET_ID \? 3000 : \(process\.env\.PORT \|\| 7860\);/g,
  "const PORT = 3000;"
);

fs.writeFileSync('server.ts', file);
