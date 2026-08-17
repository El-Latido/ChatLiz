const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /  useEffect\(\(\) => \{\n    if \(!isLoggedIn\) return;\n    \n    \n  useEffect\(\(\) => \{\n    if \(!isLoggedIn\) return;/;

code = code.replace(regex, `  useEffect(() => {\n    if (!isLoggedIn) return;`);

fs.writeFileSync('src/App.tsx', code);
