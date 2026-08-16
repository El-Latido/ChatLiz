const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = "setIsSidebarOpen(false);}}";
const replacement = "setIsSidebarOpen(false); notifyOwner(selectedUserModal.username, 'CHAT', user.username);}}";

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
