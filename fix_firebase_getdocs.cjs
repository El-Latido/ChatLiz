const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// replace await getDocs(recentQ) with await Promise.race([getDocs(recentQ), new Promise((_, r) => setTimeout(() => r(new Error("Timeout Firebase")), 3000))])
content = content.replace(/await getDocs\(recentQ\)/g, 'await Promise.race([getDocs(recentQ), new Promise((_, r) => setTimeout(() => r(new Error("Firebase Timeout")), 3000))])');

fs.writeFileSync('server.ts', content);
