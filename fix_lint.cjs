const fs = require('fs');
let serverContent = fs.readFileSync('server.ts', 'utf8');

// The Promise.race returned 'unknown', we need to cast it to any or explicitly to QuerySnapshot
serverContent = serverContent.replace(/const snapshot = await Promise\.race\(\[getDocs\(recentQ\), new Promise\(\(_, r\) => setTimeout\(\(\) => r\(new Error\("Firebase Timeout"\)\), 3000\)\)\]\);/g, 
"const snapshot: any = await Promise.race([getDocs(recentQ), new Promise((_, r) => setTimeout(() => r(new Error(\"Firebase Timeout\")), 3000))]);");

fs.writeFileSync('server.ts', serverContent);

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(/const filteredMsgs = msgs\.filter\(m => \{/g, "const filteredMsgs = msgs.filter((m: any) => {");
fs.writeFileSync('src/App.tsx', appContent);
