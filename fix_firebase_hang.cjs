const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// replace await addDoc with addDoc(...).catch(e => console.error('Firebase DB Error:', e))
// But wait, there are places like:
// await addDoc(collection(fdb, 'messages'), { ...eliMsg, createdAt: serverTimestamp() });
content = content.replace(/await addDoc\((.*?)\);/g, "addDoc($1).catch(e => console.error('Firebase addDoc Error:', e));");

fs.writeFileSync('server.ts', content);
