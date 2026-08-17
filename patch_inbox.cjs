const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add showInbox state
code = code.replace(
  `const [showNotifications, setShowNotifications] = useState(false);`,
  `const [showNotifications, setShowNotifications] = useState(false);\n  const [showInbox, setShowInbox] = useState(false);`
);

// 2. Add Inbox Icon next to Bell
code = code.replace(
  `<div className="relative">
                 <button onClick={() => setShowNotifications(!showNotifications)}`,
  `
             <div className="relative">
                 {/* Inbox Button */}
                 <button onClick={() => { setShowInbox(!showInbox); setShowNotifications(false); }} className="w-8 h-8 rounded-full flex items-center justify-center text-[#D4AF37] hover:text-[#E8D9B0] hover:bg-white/5 transition-colors relative mr-2">
                    <MessageSquare size={18} strokeWidth={1.5} />
                    {Array.from(new Set([...Object.keys(unreadPMs).filter(k => unreadPMs[k]), ...notifications.filter(n => !n.read && (n.type === 'MESSAGE' || n.type === 'CHAT')).map(n => n.senderUid)])).length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                 </button>
                 {showInbox && (
                     <div className="absolute top-full mt-2 right-0 w-80 bg-[#0f111a]/95 backdrop-blur-xl border border-[#D4AF37]/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)] rounded-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                         <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#121B2A]/80">
                             <span className="text-[#E8D9B0] font-semibold text-sm">Buzón de Mensajes</span>
                             <button onClick={() => {
                                 const senders = Array.from(new Set([...Object.keys(unreadPMs).filter(k => unreadPMs[k]), ...notifications.filter(n => !n.read && (n.type === 'MESSAGE' || n.type === 'CHAT')).map(n => n.senderUid)]));
                                 setUnreadPMs({});
                                 import('firebase/firestore').then(({ doc, updateDoc }) => {
                                     notifications.forEach(n => {
                                         if (!n.read && (n.type === 'MESSAGE' || n.type === 'CHAT')) {
                                             updateDoc(doc(db, 'notifications', n.id), { isRead: true });
                                         }
                                     });
                                 });
                             }} className="text-xs text-[#D4AF37] hover:text-white">Marcar leídos</button>
                         </div>
                         <div className="max-h-64 overflow-y-auto scrollbar-thin">
                             {Array.from(new Set([...Object.keys(unreadPMs).filter(k => unreadPMs[k]), ...notifications.filter(n => !n.read && (n.type === 'MESSAGE' || n.type === 'CHAT')).map(n => n.senderUid)])).length === 0 ? (
                                 <div className="p-4 text-center text-[#8B98B0] text-xs">No hay mensajes nuevos</div>
                             ) : (
                                 Array.from(new Set([...Object.keys(unreadPMs).filter(k => unreadPMs[k]), ...notifications.filter(n => !n.read && (n.type === 'MESSAGE' || n.type === 'CHAT')).map(n => n.senderUid)])).map(sender => {
                                     const senderInfo = usersOnline.find(u => u.username === sender) || userCache[sender];
                                     const senderPic = senderInfo?.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${sender}\`;
                                     return (
                                     <div key={sender} className="p-3 border-b border-white/5 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => {
                                         setIsSidebarOpen(false);
                                         setIsFriendsSidebarOpen(false);
                                         setActiveChat(sender);
                                         setShowInbox(false);
                                         setUnreadPMs(prev => { const n = {...prev}; delete n[sender]; return n; });
                                         import('firebase/firestore').then(({ doc, updateDoc }) => {
                                             notifications.forEach(n => {
                                                 if (!n.read && (n.type === 'MESSAGE' || n.type === 'CHAT') && n.senderUid === sender) {
                                                     updateDoc(doc(db, 'notifications', n.id), { isRead: true });
                                                 }
                                             });
                                         });
                                     }}>
                                         <div className="flex items-center gap-3">
                                             <img src={senderPic} alt={sender} className="w-8 h-8 rounded-full bg-white/5 object-cover" />
                                             <div className="flex flex-col">
                                                 <span className="text-[#E8D9B0] font-medium text-sm">{sender}</span>
                                                 <span className="text-cyan-400 text-xs">¡Te envió un mensaje!</span>
                                             </div>
                                         </div>
                                         <MessageCircle size={16} className="text-[#D4AF37]" />
                                     </div>
                                 )})
                             )}
                         </div>
                     </div>
                 )}
             </div>

             <div className="relative">
                 <button onClick={() => { setShowNotifications(!showNotifications); setShowInbox(false); }}`
);

fs.writeFileSync('src/App.tsx', code);
