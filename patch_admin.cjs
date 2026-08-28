const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const adminCode = `
  if (activeChat === 'cloud_admin') {
    return <CloudAdminPanel onClose={() => setActiveChat('global')} />;
  }
`;

code = code.replace(
  "  if (activeChat === 'builder') {",
  adminCode + "\n  if (activeChat === 'builder') {"
);

fs.writeFileSync('src/App.tsx', code);
