const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
/socket\.on\('receive_global', \(msg: any\) => \{\s*if \(msg\.sender === 'Elizabeth' \|\| msg\.isAi\) \{\s*\}\s*\}\);/,
`socket.on('receive_global', (msg: any) => {
      if (msg.sender === 'Elizabeth' || msg.isAi) {
          setMessages(prev => { if (prev.some(m => m.id === msg.id)) return prev; return [...prev, msg]; });
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });`
);

code = code.replace(
/socket\.on\('receive_private', \(msg: any, fromUser: string\) => \{\s*playNotifySound\(\);\s*if \(activeChat !== fromUser\) \{\s*setUnreadPMs\(prev => \(\{ \.\.\.prev, \[fromUser\]: true \}\)\);\s*\}\s*if \(fromUser === 'Elizabeth' && msg\.text\) \{\s*\}\s*\}\);/,
`socket.on('receive_private', (msg: any, fromUser: string) => {
      playNotifySound();
      if (activeChat !== fromUser) {
        setUnreadPMs(prev => ({ ...prev, [fromUser]: true }));
      }
      if (fromUser === 'Elizabeth' && msg.text) {
          if (activeChat === 'Elizabeth') {
             setMessages(prev => { if (prev.some(m => m.id === msg.id)) return prev; return [...prev, msg]; });
             setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
          }
      }
    });`
);

fs.writeFileSync('src/App.tsx', code);
