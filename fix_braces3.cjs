const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/setActiveChat\('global'\)>/g, "setActiveChat('global'); }}>");
code = code.replace(/setActiveChat\('tutifrutti'\)>/g, "setActiveChat('tutifrutti'); }}>");

fs.writeFileSync('src/App.tsx', code);
