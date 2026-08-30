const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');

c = c.replace(/`Responde al \\xFAltimo mensaje de \$\{currentUsername\}\.`/g, '`\\n\\nNUEVO MENSAJE DE ${currentUsername}: "${msg.text}"\\nResponde al nuevo mensaje de ${currentUsername}.`');

fs.writeFileSync('server.ts', c);
