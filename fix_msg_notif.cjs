const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const targetMsg = `             // Let socket also know for other features, but don't depend on it for messages
             socket.emit('send_private_event', msgData, activeChat);
        })
        .catch(err => {`;

const replaceMsg = `             // Let socket also know for other features, but don't depend on it for messages
             socket.emit('send_private_event', msgData, activeChat);
             sendNotification(activeChat, 'MESSAGE', { uid: user.username, displayName: user.username });
        })
        .catch(err => {`;

file = file.replace(targetMsg, replaceMsg);
fs.writeFileSync('src/App.tsx', file);
