const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix Notification query by removing the multiple where clauses without index
const targetQuery = `        const qNotif = query(
            collection(db, "notifications"), 
            where("recipientUid", "==", user.username),
            where("isRead", "==", false)
        );`;
const replaceQuery = `        const qNotif = query(
            collection(db, "notifications"), 
            where("recipientUid", "==", user.username)
        );`;
file = file.replace(targetQuery, replaceQuery);

// Filter isRead === false manually in the snapshot mapper
const targetSnapshot = `return { ...data, id: doc.id, text, read: data.isRead, type: data.type === 'LIKE' ? 'like' : (data.type === 'REQUEST' ? 'friend_request' : data.type) };`;
const replaceSnapshot = `return { ...data, id: doc.id, text, read: data.isRead, type: data.type === 'LIKE' ? 'like' : (data.type === 'REQUEST' ? 'friend_request' : data.type) };`;
// Oh wait, the map does `read: data.isRead`. So we just need to filter out `isRead === true` AFTER mapping, or filter the array we put in setNotifications.
const targetSetNotif = `            setNotifications(prev => {
                const localNotifs = prev.filter(p => !p.recipientUid); // Keep local socket notifications
                return [...msgs, ...localNotifs];
            });`;
const replaceSetNotif = `            setNotifications(prev => {
                const localNotifs = prev.filter(p => !p.recipientUid); // Keep local socket notifications
                return [...msgs.filter(m => !m.read), ...localNotifs];
            });`;
file = file.replace(targetSetNotif, replaceSetNotif);

// 2. Change "Mensaje" to "Chat Privado" in profile modal
const targetMensaje = `<MessageCircle size={18} />
                         Mensaje
                       </button>`;
const replaceMensaje = `<MessageCircle size={18} />
                         Chat Privado
                       </button>`;
file = file.replace(targetMensaje, replaceMensaje);

// 3. Add private chat header
const targetFeed = `{/* Chat Feed */}
              <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2 space-y-1.5 scrollbar-thin">`;

const replaceFeed = `{activeChat !== 'global' && activeChat !== 'tutifrutti' && (
                  <div className="bg-[#121B2A]/95 backdrop-blur-md border-b border-[#D4AF37]/30 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-lg">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1A2639] border border-[#D4AF37]/50 flex items-center justify-center overflow-hidden shadow-sm">
                             <User size={20} className="text-[#D4AF37]" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[#E8D9B0] font-bold text-lg leading-tight flex items-center gap-1.5">
                                 {activeChat} <span className="text-[10px] bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full border border-pink-500/30 uppercase tracking-wider">Privado</span>
                             </span>
                             <span className="text-[#8B98B0] text-xs font-medium">Solo tú y {activeChat} pueden ver este chat</span>
                          </div>
                      </div>
                      <button onClick={() => setActiveChat('global')} className="text-sm font-bold text-[#D4AF37] hover:text-[#E8D9B0] bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors border border-[#D4AF37]/20 flex items-center gap-2">
                          <Globe size={16} /> Volver al Mundo
                      </button>
                  </div>
              )}
              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2 space-y-1.5 scrollbar-thin">`;

file = file.replace(targetFeed, replaceFeed);

fs.writeFileSync('src/App.tsx', file);
