const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/server\.listen\(PORT as number, "0\.0\.0\.0", \(\) => \{\n    console\.log\(`Server running on http:\/\/localhost:\$\{PORT\}`\);\n  \}\);/g, 'server.listen(Number(PORT), "0.0.0.0", () => {\n    console.log(`Server running on http://0.0.0.0:${PORT}`);\n  });');

fs.writeFileSync('server.ts', code);
