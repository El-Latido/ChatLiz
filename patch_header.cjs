const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `const targetUser = usersOnline.find(u => u.username === activeChat) || userCache[activeChat];`;
const replace = `
                      const aiChar = ['Elizabeth', 'Sensei', 'Shadow', 'Neko'].includes(activeChat) ? {
                          username: activeChat,
                          profilePic: \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${activeChat}\`,
                          statusMessage: 'Inteligencia Artificial',
                          isAi: true
                      } : null;
                      const targetUser = aiChar || usersOnline.find(u => u.username === activeChat) || userCache[activeChat];
`;

code = code.replace(anchor, replace);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched header");
