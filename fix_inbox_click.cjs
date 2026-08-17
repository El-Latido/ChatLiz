const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /setActiveChat\(sender\);\n\s*setShowInbox\(false\);/,
  `setActiveChat(sender);
                                         setShowInbox(false);
                                         setUnreadPMs(prev => ({...prev, [sender]: false}));
                                         import('firebase/firestore').then(({ doc, updateDoc }) => {
                                             notifications.forEach(n => {
                                                 if (!n.read && (n.type === 'MESSAGE' || n.type === 'CHAT') && n.senderUid === sender) {
                                                     updateDoc(doc(db, 'notifications', n.id), { isRead: true });
                                                 }
                                             });
                                         });`
);

fs.writeFileSync('src/App.tsx', code);
