const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/const closeAllModals = \(\) => \{/, 'const closeAllModals = () => {\n    setIsSidebarOpen(false);\n    setIsFriendsSidebarOpen(false);');

fs.writeFileSync('src/App.tsx', content);
