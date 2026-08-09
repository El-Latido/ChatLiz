const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/onClick=\{\(\) => \{ setIsSidebarOpen\(false\); setIsFriendsSidebarOpen\(false\); setActiveChat\('global'\)>/g, "onClick={() => { setIsSidebarOpen(false); setIsFriendsSidebarOpen(false); setActiveChat('global'); }}>");
code = code.replace(/onClick=\{\(\) => \{ setIsSidebarOpen\(false\); setIsFriendsSidebarOpen\(false\); setActiveChat\('tutifrutti'\)>/g, "onClick={() => { setIsSidebarOpen(false); setIsFriendsSidebarOpen(false); setActiveChat('tutifrutti'); }}>");

fs.writeFileSync('src/App.tsx', code);
