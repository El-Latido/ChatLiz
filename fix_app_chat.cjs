const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// The snapshot for global chat:
app = app.replace(/const q = query\(collection\(db, 'global_chat'\), orderBy\('timestamp', 'asc'\), limitToLast\(30\)\);/, 
    "const q = query(collection(db, 'global_chat'), orderBy('timestamp', 'asc'), limitToLast(30));"); // It's already there

// The snapshot timestamp checking:
// Let's replace the messages filter to properly parse the timestamp
app = app.replace(/const time = m\.createdAt\?\.seconds \? \(m\.createdAt\?\.seconds \|\| m\.timestamp\?\.seconds\) \* 1000 : \(\(typeof m\.createdAt === 'number' \|\| typeof m\.timestamp === 'number'\) \? m\.createdAt : Date\.now\(\)\);/g, 
    "const time = m.timestamp?.seconds ? m.timestamp.seconds * 1000 : (m.createdAt?.seconds ? m.createdAt.seconds * 1000 : (typeof m.timestamp === 'number' ? m.timestamp : (typeof m.createdAt === 'number' ? m.createdAt : Date.now())));");

fs.writeFileSync('src/App.tsx', app);
