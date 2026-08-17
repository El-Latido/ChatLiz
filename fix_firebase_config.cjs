const fs = require('fs');
let code = fs.readFileSync('src/firebaseConfig.ts', 'utf8');
code = code.replace(/apiKey: import\.meta\.env\.VITE_FIREBASE_API_KEY \|\| "[^"]+"/, 'apiKey: import.meta.env.VITE_FIREBASE_API_KEY');
fs.writeFileSync('src/firebaseConfig.ts', code);
