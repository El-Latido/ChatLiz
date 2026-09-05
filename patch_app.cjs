const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Notification Clear bug
const notifSearch = `                  {notifications.length > 0 && (
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Limpiar
                    </button>
                  )}`;
                  
const notifReplace = `                  {notifications.length > 0 && (
                    <button 
                      onClick={async () => {
                        const firestoreNotifs = notifications.filter(n => n.id && n.id.length > 10);
                        setNotifications([]);
                        for (const n of firestoreNotifs) {
                           try {
                               // Assuming updateDoc and doc are imported from firebaseConfig
                               await updateDoc(doc(db, "notifications", n.id), { isRead: true });
                           } catch(e) {}
                        }
                      }}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Limpiar
                    </button>
                  )}`;
                  
code = code.replace(notifSearch, notifReplace);


// 2. Out of tokens state
const stateSearch = `  const [aiProfileForm, setAiProfileForm] = useState({
    profilePic: "",
    statusMessage: "Administradora",
    systemInstruction: "",
  });`;

const stateReplace = `  const [aiProfileForm, setAiProfileForm] = useState({
    profilePic: "",
    statusMessage: "Administradora",
    systemInstruction: "",
  });
  const [outOfTokensAi, setOutOfTokensAi] = useState<string | null>(null);
  const [isWatchingAd, setIsWatchingAd] = useState(false);`;

code = code.replace(stateSearch, stateReplace);


// 3. Socket event for out_of_tokens
const socketSearch = `    socket.on("receive_private", (msg: any, fromUser: string) => {`;
const socketReplace = `    socket.on("out_of_tokens", (data: { aiName: string }) => {
        setOutOfTokensAi(data.aiName);
    });

    socket.on("receive_private", (msg: any, fromUser: string) => {`;

code = code.replace(socketSearch, socketReplace);


// 4. Render out_of_tokens modal inside the chat area
const chatRenderSearch = `                  {/* Input Area */}`;
const chatRenderReplace = `                  {/* Out of Tokens AI Prompt */}
                  {outOfTokensAi && activeChat === outOfTokensAi && (
                      <div className="absolute bottom-20 left-4 right-4 bg-[#121B2A]/95 backdrop-blur-xl border border-amber-500/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.2)] z-10 animate-in slide-in-from-bottom-4">
                          <h4 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                             <Coins size={18} /> ¡Te has quedado sin tokens!
                          </h4>
                          <p className="text-sm text-gray-300 mb-4">
                             No tienes suficientes LizCoins para seguir hablando con {outOfTokensAi}. ¿Quieres ver un video publicitario corto para recargar 100 LizCoins gratis?
                             <br/><span className="text-[10px] text-gray-500 mt-1 block">*Los anuncios ayudan a mantener la plataforma gratuita y permiten a los creadores monetizar.</span>
                          </p>
                          <div className="flex gap-3">
                              <button 
                                onClick={() => {
                                    setIsWatchingAd(true);
                                    setTimeout(() => {
                                        socket.emit("watch_ad_reward");
                                        setIsWatchingAd(false);
                                        setOutOfTokensAi(null);
                                    }, 15000);
                                }}
                                disabled={isWatchingAd}
                                className="flex-1 bg-amber-500/20 text-amber-400 py-2 rounded-xl text-sm font-bold border border-amber-500/30 hover:bg-amber-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                              >
                                  {isWatchingAd ? <span className="animate-pulse">Reproduciendo video (15s)...</span> : <><Play size={16} /> Ver Video Publicitario</>}
                              </button>
                              <button 
                                onClick={() => setOutOfTokensAi(null)}
                                className="px-4 py-2 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-colors text-sm"
                              >
                                  Cancelar
                              </button>
                          </div>
                          {isWatchingAd && (
                              <div className="mt-3 relative w-full h-32 bg-black rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                                  <div className="text-white text-xs opacity-50 absolute top-2 right-2">Ad</div>
                                  <Play className="text-white/20 animate-ping" size={32} />
                                  <div className="absolute bottom-0 left-0 h-1 bg-amber-500 animate-[progress_15s_linear]" style={{width: '100%'}}></div>
                              </div>
                          )}
                      </div>
                  )}

                  {/* Input Area */}`;

code = code.replace(chatRenderSearch, chatRenderReplace);

// We need to add 'Play' to imports from lucide-react if not present, and 'Coins'
// Let's check imports

fs.writeFileSync('src/App.tsx', code);
