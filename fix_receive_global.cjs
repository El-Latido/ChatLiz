const fs = require('fs');

function fixApp() {
    let code = fs.readFileSync('src/App.tsx', 'utf8');

    code = code.replace(
        /socket\.on\('receive_global', \(msg: any\) => \{\s*if \(msg\.sender === 'Elizabeth' \|\| msg\.isAi\) \{\s*setMessages\(prev => \{ if \(prev\.some\(m => m\.id === msg\.id\)\) return prev; return \[\.\.\.prev, msg\]; \}\);\s*setTimeout\(\(\) => bottomRef\.current\?\.scrollIntoView\(\{ behavior: 'smooth' \}\), 100\);\s*\}\s*\}\);/,
        `socket.on('receive_global', (msg: any) => {
      // In firebase mode, we rely on the onSnapshot listener for most messages.
      // However, we want to ensure immediate optimistic UI or fallback for non-firebase.
      // Also, we need to make sure we don't duplicate. We only push if it's not from us 
      // (since we pushed optimistically) or if it's an AI/System message.
      if (msg.sender !== user.username || msg.sender === 'Elizabeth' || msg.isAi) {
          setMessages(prev => { if (prev.some(m => m.id === msg.id)) return prev; return [...prev, msg]; });
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });`
    );

    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed receive_global in App.tsx");
}

fixApp();
