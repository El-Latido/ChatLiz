const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    if (activeChat === 'global' || activeChat === 'tutifrutti') {
      // Backend handles global chat moderation via socket, but we can also use addDoc if requested.
      // The prompt asks to use addDoc for private chats. We'll use socket for global to keep moderation, 
      // or addDoc for both to ensure real-time as requested.
      // Let's use addDoc for global too if they want instant sync, but wait, the prompt says "en la colección específica del chat privado".
      socket.emit('send_global', payload);
    } else {`;

const replacement = `    if (activeChat === 'global' || activeChat === 'tutifrutti') {
      setMessages(prev => [...prev, msgData]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      socket.emit('send_global', payload);
    } else {`;

file = file.replace(target, replacement);
fs.writeFileSync('src/App.tsx', file);
