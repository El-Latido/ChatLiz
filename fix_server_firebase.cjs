const fs = require('fs');
let code = fs.readFileSync('server/firebase.ts', 'utf8');

code = code.replace('else if (process.env.FIREBASE_API_KEY) {', 'else if (process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY) {');
code = code.replace('apiKey: process.env.FIREBASE_API_KEY,', 'apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,');
code = code.replace('authDomain: process.env.FIREBASE_AUTH_DOMAIN,', 'authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "eighth-ability-8szp9.firebaseapp.com",');
code = code.replace('projectId: process.env.FIREBASE_PROJECT_ID,', 'projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "eighth-ability-8szp9",');
code = code.replace('storageBucket: process.env.FIREBASE_STORAGE_BUCKET,', 'storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "eighth-ability-8szp9.appspot.com",');
code = code.replace('messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,', 'messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "389253128291",');
code = code.replace('appId: process.env.FIREBASE_APP_ID', 'appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "1:389253128291:web:087a456f72bbc4bf0b1856", firestoreDatabaseId: "ai-studio-chatliz-19b8032a-22a9-4b1d-9b50-b3d4b9771a26"');

fs.writeFileSync('server/firebase.ts', code);
