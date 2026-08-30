const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');

const t1 = '`Historial de chat reciente:` +\n                contextMsgs\n                  .map(\n                    (m) =>\n                      `[${new Date(m.createdAt?.seconds ? m.createdAt.seconds * 1e3 : typeof m.createdAt === "number" ? m.createdAt : Date.now()).toLocaleTimeString()}] ${m.sender}: ${m.text}`,\n                  )\n                  .join("\\n") +\n                `Responde al \\xFAltimo mensaje de ${currentUsername}.`,';

const r1 = '`Historial de chat reciente:\\n` +\n                contextMsgs\n                  .map(\n                    (m) =>\n                      `[${new Date(m.createdAt?.seconds ? m.createdAt.seconds * 1e3 : typeof m.createdAt === "number" ? m.createdAt : Date.now()).toLocaleTimeString()}] ${m.sender}: ${m.text}`,\n                  )\n                  .join("\\n") +\n                `\\n\\nNUEVO MENSAJE DE ${currentUsername}: "${msg.text}"\\nResponde directamente a este nuevo mensaje como Elizabeth.`,';

const t2 = '`Historial de chat privado con ${currentUsername}:` +\n                contextMsgs\n                  .map(\n                    (m) =>\n                      `[${new Date(m.timestamp?.seconds ? m.timestamp.seconds * 1e3 : typeof m.timestamp === "number" ? m.timestamp : Date.now()).toLocaleTimeString()}] ${m.sender}: ${m.text}`,\n                  )\n                  .join("\\n") +\n                `Responde al \\xFAltimo mensaje de ${currentUsername}.`,';

const r2 = '`Historial de chat privado con ${currentUsername}:\\n` +\n                contextMsgs\n                  .map(\n                    (m) =>\n                      `[${new Date(m.timestamp?.seconds ? m.timestamp.seconds * 1e3 : typeof m.timestamp === "number" ? m.timestamp : Date.now()).toLocaleTimeString()}] ${m.sender}: ${m.text}`,\n                  )\n                  .join("\\n") +\n                `\\n\\nNUEVO MENSAJE DE ${currentUsername}: "${msg.text}"\\nResponde de forma privada y directa a este nuevo mensaje como Elizabeth.`,';

c = c.replace(t1, r1);
c = c.replace(t2, r2);

fs.writeFileSync('server.ts', c);
