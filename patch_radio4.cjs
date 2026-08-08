const fs = require('fs');
let code = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

const oldPlayer = `      {currentRequestedSong && (
         <div className="w-0 h-0 overflow-hidden opacity-0 pointer-events-none fixed top-0 left-0">
             <Player 
                 url={currentRequestedSong.url} 
                 playing={isPlaying} 
                 volume={isMuted ? 0 : volume}
                 onEnded={handleVideoEnded}
                 onReady={() => setIsVideoReady(true)}
                 onPlay={() => setIsVideoPlaying(true)}
                 onPause={() => setIsVideoPlaying(false)}
                 onError={(e:any) => {
                     console.error("YouTube Player Error", e);
                     handleVideoEnded(); // Skip on error
                 }}
                 config={{
                     youtube: {
                         playerVars: { autoplay: 1, controls: 0 }
                     }
                 }}
             />
         </div>
      )}`;

const newPlayer = `      <div className="fixed top-0 left-0 w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden" aria-hidden="true">
         {currentRequestedSong && (
             <Player 
                 url={currentRequestedSong.url} 
                 playing={isPlaying} 
                 volume={isMuted ? 0 : volume}
                 onEnded={handleVideoEnded}
                 onReady={() => setIsVideoReady(true)}
                 onPlay={() => setIsVideoPlaying(true)}
                 onPause={() => setIsVideoPlaying(false)}
                 onError={(e:any) => {
                     console.error("YouTube Player Error", e);
                     handleVideoEnded(); // Skip on error
                 }}
                 config={{
                     youtube: {
                         playerVars: { 
                             autoplay: 1, 
                             controls: 0, 
                             disablekb: 1,
                             origin: window.location.origin
                         }
                     },
                     file: {
                         attributes: {
                             allow: "autoplay; encrypted-media"
                         }
                     }
                 }}
             />
         )}
      </div>`;

code = code.replace(oldPlayer, newPlayer);

const oldButton = `                  {isPlaying && isVideoReady && !isVideoPlaying && (
                     <button onClick={() => { setIsPlaying(false); setTimeout(() => setIsPlaying(true), 50); }} className="mt-1.5 w-full bg-pink-500 hover:bg-pink-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)] text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors animate-pulse">
                        <Play size={12} fill="currentColor" /> Activar Audio
                     </button>
                  )}`;

const newButton = `                  {isPlaying && isVideoReady && !isVideoPlaying && (
                     <button onClick={() => { setIsPlaying(false); setTimeout(() => setIsPlaying(true), 150); }} className="mt-1.5 w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)] text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all animate-pulse transform hover:scale-[1.02]">
                        <Play size={14} fill="currentColor" /> ▶ Reproducir Siguiente Pedido
                     </button>
                  )}`;

code = code.replace(oldButton, newButton);

fs.writeFileSync('src/components/InlineRadio.tsx', code);
