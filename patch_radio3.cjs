const fs = require('fs');
let code = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

// Add isVideoPlaying state
code = code.replace(
  /const \[isVideoReady, setIsVideoReady\] = useState\(false\);/,
  "const [isVideoReady, setIsVideoReady] = useState(false);\n  const [isVideoPlaying, setIsVideoPlaying] = useState(false);"
);

// Update UI fallback
const oldUI = `           {currentRequestedSong ? (
               <div className="flex flex-col gap-1 border border-pink-500/30 bg-pink-500/5 rounded-xl p-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                  <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider flex items-center gap-1"><Youtube size={12}/> Pedido Especial</span>
                  <div className="text-sm font-semibold text-white leading-tight break-words">{currentRequestedSong.title}</div>
                  <div className="text-xs text-[#D4AF37]/80 truncate flex items-center gap-1 mt-0.5">
                      <User size={10} /> {currentRequestedSong.requester}
                  </div>
               </div>
           ) : currentSong ? (`

const newUI = `           {currentRequestedSong ? (
               <div className="flex flex-col gap-1 border border-pink-500/30 bg-pink-500/5 rounded-xl p-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                  <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider flex items-center gap-1"><Youtube size={12}/> Pedido Especial</span>
                  <div className="text-sm font-semibold text-white leading-tight break-words">{currentRequestedSong.title}</div>
                  <div className="text-xs text-[#D4AF37]/80 truncate flex items-center gap-1 mt-0.5">
                      <User size={10} /> {currentRequestedSong.requester}
                  </div>
                  {isPlaying && isVideoReady && !isVideoPlaying && (
                     <button onClick={() => { setIsPlaying(false); setTimeout(() => setIsPlaying(true), 50); }} className="mt-1.5 w-full bg-pink-500 hover:bg-pink-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)] text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors animate-pulse">
                        <Play size={12} fill="currentColor" /> Activar Audio
                     </button>
                  )}
               </div>
           ) : currentSong ? (`

code = code.replace(oldUI, newUI);

// Update Player
const oldPlayer = `      {currentRequestedSong && isPlaying && (
         <div className="hidden">
             
             <Player 
                 url={currentRequestedSong.url} 
                 playing={isPlaying} 
                 volume={isMuted ? 0 : volume}
                 onEnded={handleVideoEnded}
                 onReady={() => setIsVideoReady(true)}
                 onError={(e:any) => {
                     console.error("YouTube Player Error", e);
                     handleVideoEnded(); // Skip on error
                 }}
             />
         </div>
      )}`;

const newPlayer = `      {currentRequestedSong && (
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

code = code.replace(/      \{currentRequestedSong && isPlaying && \(\n         <div className="hidden">\n             \n             <Player \n                 url=\{currentRequestedSong\.url\} \n                 playing=\{isPlaying\} \n                 volume=\{isMuted \? 0 : volume\}\n                 onEnded=\{handleVideoEnded\}\n                 onReady=\{\(\) => setIsVideoReady\(true\)\}\n                 onError=\{\(e:any\) => \{\n                     console\.error\("YouTube Player Error", e\);\n                     handleVideoEnded\(\); \/\/ Skip on error\n                 \}\}\n             \/>\n         <\/div>\n      \)\}/, newPlayer);

fs.writeFileSync('src/components/InlineRadio.tsx', code);
