const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '<div className="flex-1 overflow-y-auto custom-scrollbar">\n                 <div className="px-4 mt-4 grid grid-cols-2 gap-2">',
  '<div className="px-4 mt-4 grid grid-cols-2 gap-2">'
);

fs.writeFileSync('src/App.tsx', code);
