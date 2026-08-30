const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Looking at line 48:
// `const ai = new GoogleGenAI({ ... },` -- wait, `},async function`
// The `sed -i '/});/d'` deleted the `});` that was closing the `GoogleGenAI` constructor!
code = code.replace(/},\nasync function/, '});\nasync function');

fs.writeFileSync('server.ts', code);
