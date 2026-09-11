const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We need to implement the ChatLizAdFlowManager logic.
const oldAdLogicRegex = /<button[\s\S]*?setIsWatchingAd\(true\);[\s\S]*?className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-95"[\s\S]*?>[\s\S]*?Ver Video \(\+100 Monedas\)[\s\S]*?<\/button>/;

const newAdLogic = `<button
              onClick={() => {
                  const chatContainer = document.getElementById("chat-messages-container");
                  if (chatContainer) chatContainer.dataset.paused = "true";
                  
                  const resumeChatFlow = (rewardGranted: boolean) => {
                      if (chatContainer) delete chatContainer.dataset.paused;
                      if (rewardGranted) {
                          socket.emit("watch_ad_reward", (res: any) => {
                             if (res.success) {
                                 setUser(prev => ({ ...prev, lizCoins: res.newCoins }));
                                 setOutOfTokensAi(null);
                                 alert("¡Felicidades! Has ganado 100 Liz-Moneditas.");
                             }
                          });
                      }
                  };

                  if (typeof (window as any).AdSDK !== 'undefined' && (window as any).AdSDK.showRewardedAd) {
                      (window as any).AdSDK.showRewardedAd({
                          onOpen: () => console.log("Reproductor publicitario nativo activo."),
                          onSkipped: () => resumeChatFlow(false),
                          onComplete: () => resumeChatFlow(true),
                          onError: (err: any) => {
                              console.error("Error en SDK:", err);
                              resumeChatFlow(false);
                          }
                      });
                  } else {
                      console.warn("SDK externo no disponible. Ejecutando bypass de seguridad...");
                      // Fallback visual temporal si no hay SDK para no bloquear la app
                      setIsWatchingAd(true);
                      setTimeout(() => {
                         setIsWatchingAd(false);
                         resumeChatFlow(true);
                      }, 2000);
                  }
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-95"
            >
              <PlaySquare size={20} />
              Ver Anuncio Nativo (+100 Monedas)
            </button>`;

code = code.replace(oldAdLogicRegex, newAdLogic);

// Remove the old full screen Ad Video UI from App.tsx since AdSDK handles it natively (except we use a small fallback)
const oldAdVideoRegex = /\{isWatchingAd && \([\s\S]*?\}\)/;
const fallbackAd = `{isWatchingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <h2 className="text-xl font-bold">Cargando anuncio...</h2>
            </div>
        </div>
      )}`;
code = code.replace(oldAdVideoRegex, fallbackAd);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated Ad SDK Flow in App.tsx");
