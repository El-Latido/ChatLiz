const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldModal = `      {isSongRequestOpen && (
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
      )}`;

const newModal = `      {isSongRequestOpen && (
          <SongRequestModal
              onClose={() => setIsSongRequestOpen(false)}
              onSubmit={(title, url) => {
                  socket.emit('song_request', { title, url });
                  setIsSongRequestOpen(false);
              }}
          />
      )}`;

code = code.replace(oldModal, newModal);

const chatRender1 = `                                         {m.type === 'song_request' && m.requestData && (
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
                                         )}`;

code = code.replace(chatRender1, '');

fs.writeFileSync('src/App.tsx', code);
