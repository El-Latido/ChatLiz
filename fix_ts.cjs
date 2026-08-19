const fs = require('fs');

// Fix App.tsx UserObj avatar -> profilePic
let appStr = fs.readFileSync('src/App.tsx', 'utf8');
appStr = appStr.replace(/user\.avatar/g, 'user.profilePic');
appStr = appStr.replace(/opponent\.avatar/g, 'opponent.profilePic');
fs.writeFileSync('src/App.tsx', appStr);

// Fix PoolGameModal UserObj avatar -> profilePic
let poolStr = fs.readFileSync('src/components/PoolGameModal.tsx', 'utf8');
poolStr = poolStr.replace(/user\.avatar/g, 'user.profilePic');
fs.writeFileSync('src/components/PoolGameModal.tsx', poolStr);

// Create env.d.ts for vite env types
fs.writeFileSync('src/env.d.ts', `/// <reference types="vite/client" />\n`);

// Create declarations.d.ts for images
fs.writeFileSync('src/declarations.d.ts', `declare module '*.jpg';\ndeclare module '*.png';\ndeclare module '*.svg';\n`);
