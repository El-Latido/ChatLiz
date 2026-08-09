const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace('import { Server }import { createServer as createViteServer } from "vite";', 'import { Server } from "socket.io";\nimport { createServer as createViteServer } from "vite";');

fs.writeFileSync('server.ts', code);
