const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("  LogOut,", "  PlaySquare,\n  LogOut,");
fs.writeFileSync('src/App.tsx', code);
