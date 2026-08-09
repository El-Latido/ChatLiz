const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const PORT = 3000;/g, 'const PORT = process.env.APPLET_ID ? 3000 : (process.env.PORT || 7860);');

code = code.replace(/server\.listen\(PORT, "0\.0\.0\.0", \(\) => \{/g, 'server.listen(PORT as number, "0.0.0.0", () => {');

fs.writeFileSync('server.ts', code);
