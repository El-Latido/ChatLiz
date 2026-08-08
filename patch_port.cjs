const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldPort = 'const PORT = parseInt(process.env.PORT as string, 10) || 3000;';
const newPort = 'const PORT = 3000;';

code = code.replace(oldPort, newPort);
fs.writeFileSync('server.ts', code);
