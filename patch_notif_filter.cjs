const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Filter Bell dot
code = code.replace(
  `{notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}`,
  `{notifications.filter(n => !n.read && n.type !== 'MESSAGE' && n.type !== 'CHAT').length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}`
);

// Filter Bell list
code = code.replace(
  `{notifications.length === 0 ? (
                                 <div className="p-4 text-center text-[#8B98B0] text-xs">No hay notificaciones</div>
                             ) : (
                                 notifications.map(n => (`,
  `{notifications.filter(n => n.type !== 'MESSAGE' && n.type !== 'CHAT').length === 0 ? (
                                 <div className="p-4 text-center text-[#8B98B0] text-xs">No hay notificaciones</div>
                             ) : (
                                 notifications.filter(n => n.type !== 'MESSAGE' && n.type !== 'CHAT').map(n => (`
);

// Mark as read in Bell only marks non-messages
code = code.replace(
  `notifications.forEach(n => {
            if (n.recipientUid) updateDoc(doc(db, 'notifications', n.id), { isRead: true });
        });`,
  `notifications.forEach(n => {
            if (n.recipientUid && n.type !== 'MESSAGE' && n.type !== 'CHAT') updateDoc(doc(db, 'notifications', n.id), { isRead: true });
        });`
);

fs.writeFileSync('src/App.tsx', code);
