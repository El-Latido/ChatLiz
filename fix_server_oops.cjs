const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const splitPoint = code.indexOf(' from "socket.io";');
let restored = 'import express from "express";\nimport http from "http";\nimport path from "path";\nimport { Server }' + code.substring(splitPoint + 18); // +18 to skip ' from "socket.io";'

fs.writeFileSync('server.ts', restored);
