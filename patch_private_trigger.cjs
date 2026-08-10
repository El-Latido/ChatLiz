const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const regex = /if \(toUser === "Elizabeth"\) \{\n\s*if \(msg\.text && \(msg\.text\.toLowerCase\(\)\.includes\("elizabeth"\) \|\| msg\.text\.toLowerCase\(\)\.includes\("liz"\)\)\) \{\n\s*triggerPrivateElizabeth = true;\n\s*\}\n\s*if \(modResult\.mentionsElizabeth\) \{\n\s*triggerPrivateElizabeth = true;\n\s*\}\n\s*\}/g;

content = content.replace(regex, `if (toUser === "Elizabeth") {\n          triggerPrivateElizabeth = true;\n      }`);

fs.writeFileSync('server.ts', content);
