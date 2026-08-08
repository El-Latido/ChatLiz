const fs = require('fs');
let code = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

const oldPlayerState = `  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);`;

const newPlayerState = `  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);`;
code = code.replace(oldPlayerState, newPlayerState);


const effect1 = `  useEffect(() => {
     if (currentRequestedSong && isPlaying && audioRef.current) {
        audioRef.current.pause();
     } else if (!currentRequestedSong && isPlaying && audioRef.current) {
        audioRef.current.play().catch(e => console.error("Resume failed", e));
     }
  }, [currentRequestedSong, isPlaying]);`;

const effect2 = `  useEffect(() => {
     if (currentRequestedSong && isPlaying && audioRef.current) {
        audioRef.current.pause();
        // Force YouTube to play explicitly
        if (playerRef.current && typeof playerRef.current.getInternalPlayer === 'function') {
            const internalPlayer = playerRef.current.getInternalPlayer();
            if (internalPlayer && typeof internalPlayer.playVideo === 'function') {
                internalPlayer.playVideo();
            }
        }
     } else if (!currentRequestedSong && isPlaying && audioRef.current) {
        audioRef.current.play().catch(e => console.error("Resume failed", e));
     }
  }, [currentRequestedSong, isPlaying, isVideoReady]);`;
code = code.replace(effect1, effect2);

const playerRender1 = `         {currentRequestedSong && (
             <Player 
                 url={currentRequestedSong.url}`;

const playerRender2 = `         {currentRequestedSong && (
             <Player 
                 ref={playerRef}
                 url={currentRequestedSong.url}`;
code = code.replace(playerRender1, playerRender2);

const onReady1 = `                 onReady={() => setIsVideoReady(true)}`;
const onReady2 = `                 onReady={() => {
                     setIsVideoReady(true);
                     if (isPlaying && playerRef.current) {
                         const internal = playerRef.current.getInternalPlayer();
                         if (internal && internal.playVideo) internal.playVideo();
                     }
                 }}`;
code = code.replace(onReady1, onReady2);


const button1 = `                     <button onClick={() => { setIsPlaying(false); setTimeout(() => setIsPlaying(true), 150); }} className="mt-1.5 w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)] text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all animate-pulse transform hover:scale-[1.02]">
                        <Play size={14} fill="currentColor" /> ▶ Reproducir Siguiente Pedido
                     </button>`;

const button2 = `                     <button 
                        onClick={() => { 
                            setIsPlaying(true); 
                            if (playerRef.current) {
                                const internal = playerRef.current.getInternalPlayer();
                                if (internal && internal.playVideo) internal.playVideo();
                            }
                        }} 
                        className="mt-1.5 w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)] text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all animate-pulse transform hover:scale-[1.02]"
                     >
                        <Play size={14} fill="currentColor" /> ▶ Reproducir Siguiente Pedido
                     </button>`;
code = code.replace(button1, button2);

fs.writeFileSync('src/components/InlineRadio.tsx', code);
