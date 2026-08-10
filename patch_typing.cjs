const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const typingHandler = `
    socket.on('typing', (data: { username: string, chat: string }) => {
       const targetChat = data.chat === user.username ? data.username : data.chat;
       setTypingUsers(prev => {
          const chatTyping = prev[targetChat] || [];
          if (!chatTyping.includes(data.username)) {
             return { ...prev, [targetChat]: [...chatTyping, data.username] };
          }
          return prev;
       });
       setTimeout(() => {
          setTypingUsers(prev => {
             const chatTyping = prev[targetChat] || [];
             if (chatTyping.includes(data.username)) {
                return { ...prev, [targetChat]: chatTyping.filter(u => u !== data.username) };
             }
             return prev;
          });
       }, 4000);
    });

    socket.on('stop_typing', (data: { username: string, chat: string }) => {
       const targetChat = data.chat === user.username ? data.username : data.chat;
       setTypingUsers(prev => {
          const chatTyping = prev[targetChat] || [];
          return { ...prev, [targetChat]: chatTyping.filter(u => u !== data.username) };
       });
    });
`;

content = content.replace(/socket\.on\('typing',[\s\S]*?socket\.on\('stop_typing',[\s\S]*?\}\);\n    \}\);/m, typingHandler.trim());

fs.writeFileSync('src/App.tsx', content);
