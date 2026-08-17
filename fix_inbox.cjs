const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = code.indexOf('<div className="max-h-64 overflow-y-auto scrollbar-thin">');
const endIndex = code.indexOf('<div className="relative">', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = '<div className="max-h-64 overflow-y-auto scrollbar-thin">' +
'                             {chatList.length === 0 ? (' +
'                                 <div className="p-4 text-center text-[#8B98B0] text-xs">No hay mensajes recientes</div>' +
'                             ) : (' +
'                                 chatList.map(chat => {' +
'                                     const sender = chat.withUser;' +
'                                     const senderInfo = usersOnline.find(u => u.username === sender) || userCache[sender];' +
'                                     const senderPic = senderInfo?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender}`;' +
'                                     const isUnread = unreadPMs[sender] || notifications.some(n => !n.read && (n.type === "MESSAGE" || n.type === "CHAT") && n.senderUid === sender);' +
'                                     return (' +
'                                     <div key={sender} className={`p-3 border-b border-white/5 flex items-center justify-between transition-colors cursor-pointer ${isUnread ? "bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20" : "bg-white/5 hover:bg-white/10"}`} onClick={() => {' +
'                                         setIsSidebarOpen(false);' +
'                                         setIsFriendsSidebarOpen(false);' +
'                                         setActiveChat(sender);' +
'                                         setShowInbox(false);' +
'                                         setUnreadPMs(prev => ({...prev, [sender]: false}));' +
'                                         import("firebase/firestore").then(({ doc, updateDoc }) => {' +
'                                             notifications.forEach(n => {' +
'                                                 if (!n.read && (n.type === "MESSAGE" || n.type === "CHAT") && n.senderUid === sender) {' +
'                                                     updateDoc(doc(db, "notifications", n.id), { isRead: true });' +
'                                                 }' +
'                                             });' +
'                                         });' +
'                                     }}>' +
'                                         <div className="flex items-center gap-3 min-w-0">' +
'                                             <div className="relative">' +
'                                                <img src={senderPic} alt={sender} className="w-10 h-10 rounded-full bg-white/5 object-cover" />' +
'                                                {isUnread && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#121B2A]"></span>}' +
'                                             </div>' +
'                                             <div className="flex flex-col min-w-0">' +
'                                                 <span className={`font-medium text-sm truncate ${isUnread ? "text-white font-bold" : "text-[#E8D9B0]"}`}>{sender}</span>' +
'                                                 <span className="text-gray-400 text-xs truncate max-w-[150px]">{chat.lastMessage || "Conversación"}</span>' +
'                                             </div>' +
'                                         </div>' +
'                                         <MessageCircle size={16} className={isUnread ? "text-[#D4AF37]" : "text-gray-500"} />' +
'                                     </div>' +
'                                 )})' +
'                             )}' +
'                         </div>' +
'                     </div>' +
'                 )}' +
'             </div>' +
'             ';
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('src/App.tsx', code);
}
