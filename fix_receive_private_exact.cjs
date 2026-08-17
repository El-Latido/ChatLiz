const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = "socket.on('receive_private'";
const endStr = "socket.on('tutifrutti_state'";

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    const newCode = code.slice(0, startIdx) + 
`socket.on('receive_private', (msg: any, fromUser: string) => {
      playNotifySound();
      if (activeChat !== fromUser) {
        setUnreadPMs(prev => ({ ...prev, [fromUser]: true }));
      } else {
        setMessages(prev => { if (prev.some(m => m.id === msg.id)) return prev; return [...prev, msg]; });
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });

    ` + code.slice(endIdx);
    fs.writeFileSync('src/App.tsx', newCode);
}
