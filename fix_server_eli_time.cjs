const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const t1 = `          const eliMsg: any = { text: cleanText, sender: "Elizabeth", id: Date.now().toString() };
          
          if (fdb) {
            eliMsg.createdAt = serverTimestamp();
            await addDoc(collection(fdb, 'messages'), eliMsg);
          }`;

const r1 = `          const eliMsg: any = { text: cleanText, sender: "Elizabeth", id: Date.now().toString(), createdAt: Date.now() };
          
          if (fdb) {
            await addDoc(collection(fdb, 'messages'), { ...eliMsg, createdAt: serverTimestamp() });
          }`;

if(code.includes(t1)) {
    code = code.replace(t1, r1);
    fs.writeFileSync('server.ts', code);
    console.log("Replaced global Eli msg");
} else {
    console.log("Could not find global Eli msg");
}
