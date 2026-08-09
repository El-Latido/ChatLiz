const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const splitPoint = code.lastIndexOf('import { createServer as createViteServer } from "vite";');
let restored = 'import express from "express";\nimport http from "http";\nimport path from "path";\nimport { Server } from "socket.io";\n' + code.substring(splitPoint);

fs.writeFileSync('server.ts', restored);
