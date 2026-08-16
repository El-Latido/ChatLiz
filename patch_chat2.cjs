const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = "setIsSidebarOpen(false);\n}}";
const replacement = "setIsSidebarOpen(false);\nnotifyOwner(selectedUserModal.username, 'CHAT', user.username);\n}}";

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
