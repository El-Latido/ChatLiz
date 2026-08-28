const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.substring(0, 937) + '</div>' + code.substring(937);
fs.writeFileSync('src/App_test.tsx', code);
