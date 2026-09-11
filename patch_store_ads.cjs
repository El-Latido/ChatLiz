const fs = require('fs');
let code = fs.readFileSync('src/components/StoreModal.tsx', 'utf8');

const importTarget = `import { socket } from '../socket';`;
const importReplacement = `import { socket } from '../socket';
import { ChatLizAdFlowManager } from '../lib/adManager';`;

code = code.replace(importTarget, importReplacement);

const methodTarget = `  const prevCategory = () => {
    setCurrentCategoryIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };`;

const methodReplacement = `  const prevCategory = () => {
    setCurrentCategoryIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const watchAdForCoins = () => {
    if (isPlayingAd) return;
    setIsPlayingAd(true);
    const adManager = new ChatLizAdFlowManager(user.username, (reward) => {
        setIsPlayingAd(false);
        socket.emit('watch_ad_reward', { reward }, (res: any) => {
            if (res.success) {
                // Optimistically update
            } else {
                setError(res.error || 'Error al reclamar recompensa');
            }
        });
    });
    adManager.showRewardedVideoAd();
  };`;

code = code.replace(methodTarget, methodReplacement);

const uiTarget = `<p className="text-[#D4AF37]/80 mt-1 font-medium">Liz-Moneditas: <span className="text-[#121B2A] bg-[#D4AF37] px-2.5 py-0.5 rounded-full font-bold">{user.lizCoins || 0}</span></p>`;

const uiReplacement = `<div className="flex items-center gap-4 mt-1">
              <p className="text-[#D4AF37]/80 font-medium">Liz-Moneditas: <span className="text-[#121B2A] bg-[#D4AF37] px-2.5 py-0.5 rounded-full font-bold">{user.lizCoins || 0}</span></p>
              <button 
                  onClick={watchAdForCoins}
                  disabled={isPlayingAd}
                  className="flex items-center gap-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 px-3 py-1 rounded-full text-xs font-bold transition-colors"
              >
                  <Sparkles size={14} />
                  {isPlayingAd ? 'Viendo...' : 'Ver Video (+10 LM)'}
              </button>
            </div>`;

code = code.replace(uiTarget, uiReplacement);

fs.writeFileSync('src/components/StoreModal.tsx', code);
console.log("Patched StoreModal with Ad Button");
