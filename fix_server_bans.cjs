const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const banMsg = { text: \`🚨 El usuario \$\{currentUsername\} ha sido baneado por 15 minutos debido a: \$\{modResult\.reason\}\.\`, sender: "Elizabeth", id: Date\.now\(\)\.toString\(\), createdAt: serverTimestamp\(\) };\n          if \(fdb\) await addDoc\(collection\(fdb, 'messages'\), banMsg\);/g, 
`const banMsg = { text: \`🚨 El usuario \${currentUsername} ha sido baneado por 15 minutos debido a: \${modResult.reason}.\`, sender: "Elizabeth", id: Date.now().toString(), createdAt: Date.now() };
          if (fdb) await addDoc(collection(fdb, 'messages'), { ...banMsg, createdAt: serverTimestamp() });`);

code = code.replace(/const banMsg = { text: \`🚨 El usuario \$\{currentUsername\} ha sido baneado por 15 minutos debido a: \$\{modResult\.reason\}\.\`, sender: "Elizabeth", id: Date\.now\(\)\.toString\(\), createdAt: serverTimestamp\(\) };\n          io\.emit\("receive_global", banMsg\);/g, 
`const banMsg = { text: \`🚨 El usuario \${currentUsername} ha sido baneado por 15 minutos debido a: \${modResult.reason}.\`, sender: "Elizabeth", id: Date.now().toString(), createdAt: Date.now() };
          if (fdb) await addDoc(collection(fdb, 'messages'), { ...banMsg, createdAt: serverTimestamp() });
          io.emit("receive_global", banMsg);`);

fs.writeFileSync('server.ts', code);
console.log("Replaced ban messages");
