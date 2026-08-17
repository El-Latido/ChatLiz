const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    /socket\.emit\('send_private', payload, activeChat, \(res: any\) => \{/,
    `// Optimistic UI for private messages
      setMessages(prev => [...prev, msgData]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      socket.emit('send_private', payload, activeChat, (res: any) => {`
);

fs.writeFileSync('src/App.tsx', code);
