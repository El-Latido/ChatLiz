const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Sidebars to 110, modals to 120
content = content.replace(/z-\[90\]/g, 'z-[105]'); 
content = content.replace(/z-\[110\]/g, 'z-[120]'); 

fs.writeFileSync('src/App.tsx', content);
