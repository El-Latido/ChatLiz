const fs = require('fs');

// server.ts
let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(/collection\(fdb, 'messages'\)/g, "collection(fdb, 'global_chat')");
// To avoid replacing private messages accidentally:
// Actually, let's just replace `createdAt: serverTimestamp()` with `timestamp: serverTimestamp()` for the ones going to global_chat.
// Let's use a regex that matches `addDoc(collection(fdb, 'global_chat'), { ... , createdAt: serverTimestamp() })`
server = server.replace(/createdAt: serverTimestamp\(\)/g, "timestamp: serverTimestamp()");
fs.writeFileSync('server.ts', server);

// src/App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/collection\(db, 'messages'\)/g, "collection(db, 'global_chat')");
app = app.replace(/orderBy\('createdAt', 'asc'\)/g, "orderBy('timestamp', 'asc')");
// For the frontend local date fallback
app = app.replace(/if \(m\.createdAt\) \{/g, "if (m.createdAt || m.timestamp) {");
app = app.replace(/m\.createdAt\.seconds/g, "(m.createdAt?.seconds || m.timestamp?.seconds)");
app = app.replace(/typeof m\.createdAt === 'number'/g, "(typeof m.createdAt === 'number' || typeof m.timestamp === 'number')");
app = app.replace(/const time = m\.createdAt\?\.seconds \? m\.createdAt\.seconds \* 1000 : \(typeof m\.createdAt === 'number' \? m\.createdAt : Date\.now\(\)\);/g, "const time = m.timestamp?.seconds ? m.timestamp.seconds * 1000 : (m.createdAt?.seconds ? m.createdAt.seconds * 1000 : (typeof m.timestamp === 'number' ? m.timestamp : (typeof m.createdAt === 'number' ? m.createdAt : Date.now())));");
app = app.replace(/createdAt: Date\.now\(\)/g, "timestamp: Date.now(), createdAt: Date.now()");

fs.writeFileSync('src/App.tsx', app);
