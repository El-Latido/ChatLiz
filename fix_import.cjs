const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("Image as ImageIcon, Mic, StopCircle,", "Image as ImageIcon, Mic, StopCircle, Cloud,");
fs.writeFileSync('src/App.tsx', code);
