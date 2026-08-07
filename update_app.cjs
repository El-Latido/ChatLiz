const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importStatement = `import { InlineRadio } from './components/InlineRadio';
import { SongRequestModal } from './components/SongRequestModal';`;
code = code.replace(`import { InlineRadio } from './components/InlineRadio';`, importStatement);

const stateStatement = `  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [storeCategory, setStoreCategory] = useState<string | undefined>(undefined);
  const [isSongRequestOpen, setIsSongRequestOpen] = useState(false);`;
code = code.replace(/const \[isStoreOpen, setIsStoreOpen\] = useState\(false\);\s*const \[storeCategory, setStoreCategory\] = useState<string \| undefined>\(undefined\);/g, stateStatement);

const renderModal = `      {isStoreOpen && (
           <StoreModal `;
const songRequestModal = `      {isSongRequestOpen && (
          <SongRequestModal
              onClose={() => setIsSongRequestOpen(false)}
              onSubmit={(title, url) => {
                  socket.emit('send_global', {
                      text: \`¡Pedido de canción de \${user.username}!\`,
                      type: 'song_request',
                      requestData: { title, url }
                  });
                  setIsSongRequestOpen(false);
              }}
          />
      )}

      {isStoreOpen && (
           <StoreModal `;
code = code.replace(renderModal, songRequestModal);

const buttonChat = `                              <>
                                  <input 
                                     value={inputValue}
                                     onChange={handleInputChange}
                                     onKeyDown={e => {
                                        if (e.key === 'Enter') handleSendMessage();
                                     }}
                                     className="flex-1 min-w-0 py-2 h-full bg-transparent outline-none text-[#E8D9B0] placeholder-[#D4AF37]/60 text-[14px]" 
                                     placeholder="Escribe tu mensaje... @Elizabeth"
                                  />
                                  <div className="flex items-center gap-0.5 text-[#D4AF37]/80 shrink-0 ml-1">
                                      <div className="relative flex items-center justify-center">
                                          <button onClick={() => setIsSongRequestOpen(true)} className="flex items-center justify-center hover:text-pink-400 p-1 transition-colors" title="Pedir Canción"><Music size={18} strokeWidth={1.5} /></button>
                                      </div>
                                      <div className="relative flex items-center justify-center">
                                          <button onClick={() => setIsGamesMenuOpen(true)} className="flex items-center justify-center hover:text-[#D4AF37] p-1 transition-colors" title="Juegos"><Gamepad2 size={18} strokeWidth={1.5} /></button>
                                      </div>
                                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex items-center justify-center hover:text-[#D4AF37] p-1 transition-colors"><Smile size={18} strokeWidth={1.5} /></button>
                                      <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center hover:text-[#D4AF37] p-1 transition-colors"><Paperclip size={18} strokeWidth={1.5} /></button>
                                  </div>
                              </>`;

const originalButtonChat = `                              <>
                                  <input 
                                     value={inputValue}
                                     onChange={handleInputChange}
                                     onKeyDown={e => {
                                        if (e.key === 'Enter') handleSendMessage();
                                     }}
                                     className="flex-1 min-w-0 py-2 h-full bg-transparent outline-none text-[#E8D9B0] placeholder-[#D4AF37]/60 text-[14px]" 
                                     placeholder="Escribe tu mensaje... @Elizabeth"
                                  />
                                  <div className="flex items-center gap-0.5 text-[#D4AF37]/80 shrink-0 ml-1">
                                      <div className="relative flex items-center justify-center">
                                          <button onClick={() => setIsGamesMenuOpen(true)} className="flex items-center justify-center hover:text-[#D4AF37] p-1 transition-colors" title="Juegos"><Gamepad2 size={18} strokeWidth={1.5} /></button>
                                      </div>
                                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex items-center justify-center hover:text-[#D4AF37] p-1 transition-colors"><Smile size={18} strokeWidth={1.5} /></button>
                                      <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center hover:text-[#D4AF37] p-1 transition-colors"><Paperclip size={18} strokeWidth={1.5} /></button>
                                  </div>
                              </>`;
code = code.replace(originalButtonChat, buttonChat);


const buttonTutifrutti = `                                            <>
                                                <input 
                                                    value={inputValue}
                                                    onChange={e => setInputValue(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && inputValue.trim()) handleSendMessage();
                                                    }}
                                                    className="flex-1 min-w-0 py-2 outline-none text-gray-700 text-sm placeholder-blue-300 bg-transparent h-full"
                                                    placeholder="Escribe un mensaje..."
                                                />
                                                <div className="flex items-center gap-1 text-blue-400 shrink-0">
                                                    <button onClick={() => setIsSongRequestOpen(true)} className="hover:text-pink-500 p-1 transition-colors"><Music size={18} strokeWidth={2} /></button>
                                                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="hover:text-pink-500 p-1 transition-colors"><Smile size={18} strokeWidth={2} /></button>
                                                    <button onClick={() => fileInputRef.current?.click()} className="hover:text-pink-500 p-1 transition-colors"><Paperclip size={18} strokeWidth={2} /></button>
                                                </div>
                                            </>`;
                                            
const originalButtonTutifrutti = `                                            <>
                                                <input 
                                                    value={inputValue}
                                                    onChange={e => setInputValue(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && inputValue.trim()) handleSendMessage();
                                                    }}
                                                    className="flex-1 min-w-0 py-2 outline-none text-gray-700 text-sm placeholder-blue-300 bg-transparent h-full"
                                                    placeholder="Escribe un mensaje..."
                                                />
                                                <div className="flex items-center gap-1 text-blue-400 shrink-0">
                                                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="hover:text-pink-500 p-1 transition-colors"><Smile size={18} strokeWidth={2} /></button>
                                                    <button onClick={() => fileInputRef.current?.click()} className="hover:text-pink-500 p-1 transition-colors"><Paperclip size={18} strokeWidth={2} /></button>
                                                </div>
                                            </>`;

code = code.replace(originalButtonTutifrutti, buttonTutifrutti);

const customMsgRender = `                                         {m.type === 'chess_invite' && m.inviteData && (
                                             <button onClick={() => {
                                                 if (m.sender === user.username) return; // Can't accept own invite
                                                 if ((user.lizCoins || 0) < m.inviteData!.bet) {
                                                     alert("No tienes suficientes Liz-Moneditas.");
                                                     return;
                                                 }
                                                 socket.emit('accept_chess_invite', m.inviteData, (res: any) => {
                                                     if (res.success) {
                                                         setActiveChessGame({ id: m.inviteData!.gameId, opponent: usersOnline.find(u => u.username === m.sender) || {username: m.sender}, bet: m.inviteData!.bet, isHost: false });
                                                     } else {
                                                         alert(res.error || "Error al aceptar el reto.");
                                                     }
                                                 });
                                             }} className="w-full mt-2 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:from-blue-500 hover:to-indigo-500 transition-colors flex items-center justify-center gap-2">
                                                 <Gamepad2 size={16} /> [Jugar]
                                             </button>
                                         )}
                                         {m.type === 'song_request' && m.requestData && (
                                             <div className="mt-2 bg-[#1A2639]/50 border border-pink-500/30 rounded-xl p-3 flex flex-col gap-1 shadow-sm relative overflow-hidden">
                                                 <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                                                 <div className="text-pink-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1"><Music size={12}/> Pedido de Radio</div>
                                                 <div className="text-white font-medium text-sm leading-tight">{m.requestData.title}</div>
                                                 {m.requestData.url && (
                                                     <a href={m.requestData.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:text-blue-300 hover:underline flex items-center gap-1 mt-1 transition-colors w-fit">
                                                         Ver en YouTube
                                                     </a>
                                                 )}
                                             </div>
                                         )}
                                         {m.image && <div className="w-full mt-1.5"><img src={m.image} className="rounded-xl border border-black/10 max-w-full shadow-md h-28 object-cover" alt="adjunto"/></div>}`;
const originalCustomMsgRender = `                                         {m.type === 'chess_invite' && m.inviteData && (
                                             <button onClick={() => {
                                                 if (m.sender === user.username) return; // Can't accept own invite
                                                 if ((user.lizCoins || 0) < m.inviteData!.bet) {
                                                     alert("No tienes suficientes Liz-Moneditas.");
                                                     return;
                                                 }
                                                 socket.emit('accept_chess_invite', m.inviteData, (res: any) => {
                                                     if (res.success) {
                                                         setActiveChessGame({ id: m.inviteData!.gameId, opponent: usersOnline.find(u => u.username === m.sender) || {username: m.sender}, bet: m.inviteData!.bet, isHost: false });
                                                     } else {
                                                         alert(res.error || "Error al aceptar el reto.");
                                                     }
                                                 });
                                             }} className="w-full mt-2 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:from-blue-500 hover:to-indigo-500 transition-colors flex items-center justify-center gap-2">
                                                 <Gamepad2 size={16} /> [Jugar]
                                             </button>
                                         )}
                                         {m.image && <div className="w-full mt-1.5"><img src={m.image} className="rounded-xl border border-black/10 max-w-full shadow-md h-28 object-cover" alt="adjunto"/></div>}`;
code = code.replace(originalCustomMsgRender, customMsgRender);

const iconsImport = `import { 
  Send, User, MessageCircle, Settings, Bot, 
  Image as ImageIcon, Mic, StopCircle, 
  Menu, X, Hash, MessageSquare, LogOut, Search, Gamepad2, Music, Youtube,`;
code = code.replace(`import { \n  Send, User, MessageCircle, Settings, Bot, \n  Image as ImageIcon, Mic, StopCircle, \n  Menu, X, Hash, MessageSquare, LogOut, Search, Gamepad2,\n`, iconsImport);


fs.writeFileSync('src/App.tsx', code);
