const fs = require('fs');
let file = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');
file = file.replace('const savePromise = setDoc(userRef, {', 'const savePromise = setDoc(doc(db, "users", user.username!), {');
fs.writeFileSync('src/components/ProfileConfigModal.tsx', file);
