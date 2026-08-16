const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `let text = data.text || '';`,
  `let text = data.message || data.text || '';`
);

fs.writeFileSync('src/App.tsx', code);
