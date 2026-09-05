const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
if (!code.includes('deleteDoc,')) {
    code = code.replace('doc,', 'doc, deleteDoc,');
    fs.writeFileSync('src/App.tsx', code);
}
