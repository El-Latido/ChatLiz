const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexToRemove = /    return \(\) => \{\n            \};\n  \}, \[isLoggedIn, activeChat, user\.username\]\);\n/;
code = code.replace(regexToRemove, "");

fs.writeFileSync('src/App.tsx', code);
