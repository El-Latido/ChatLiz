const fs = require('fs');
let code = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

const imports = `import React, { useState, useEffect, useRef } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Loader2, Music, ListMusic, ChevronDown, ChevronUp, Youtube, User } from 'lucide-react';
import ReactPlayer from 'react-player/youtube';
import { socket } from '../socket';`;

code = code.replace(/import React.*?\nimport { .*? } from 'lucide-react';/, imports);

const stateAndEffect = `  const [currentSong, setCurrentSong] = useState<any>(null);
  const [songHistory, setSongHistory] = useState<any[]>([]);
  
  const [songQueue, setSongQueue] = useState<any[]>([]);
  const [currentRequestedSong, setCurrentRequestedSong] = useState<any>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamUrl = "https://listen.moe/stream";

  useEffect(() => {
    const handleQueueUpdate = (data: { queue: any[], current: any }) => {
       setSongQueue(data.queue);
       setCurrentRequestedSong(data.current);
    };
    socket.on('queue_update', handleQueueUpdate);
    return () => {
       socket.off('queue_update', handleQueueUpdate);
    };
  }, []);

  useEffect(() => {
     if (currentRequestedSong && isPlaying && audioRef.current) {
        audioRef.current.pause();
     } else if (!currentRequestedSong && isPlaying && audioRef.current) {
        audioRef.current.play().catch(e => console.error("Resume failed", e));
     }
  }, [currentRequestedSong, isPlaying]);

  const handleVideoEnded = () => {
     if (currentRequestedSong) {
         socket.emit("song_ended", { id: currentRequestedSong.id });
     }
  };
`;

code = code.replace(/  const \[currentSong, setCurrentSong\] = useState<any>\(null\);\n  const \[songHistory, setSongHistory\] = useState<any\[\]>\(\[\]\);\n\n  const audioRef = useRef<HTMLAudioElement>\(null\);\n  const wsRef = useRef<WebSocket \| null>\(null\);\n  const streamUrl = "https:\/\/listen.moe\/stream";/, stateAndEffect);


const songHistoryUI = `           {currentRequestedSong ? (
               <div className="flex flex-col gap-1 border border-pink-500/30 bg-pink-500/5 rounded-xl p-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                  <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider flex items-center gap-1"><Youtube size={12}/> Pedido Especial</span>
                  <div className="text-sm font-semibold text-white leading-tight break-words">{currentRequestedSong.title}</div>
                  <div className="text-xs text-[#D4AF37]/80 truncate flex items-center gap-1 mt-0.5">
                      <User size={10} /> {currentRequestedSong.requester}
                  </div>
               </div>
           ) : currentSong ? (
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">Sonando Ahora</span>
                  <div className="text-sm font-semibold text-white leading-tight break-words">{currentSong.title}</div>
                  <div className="text-xs text-[#D4AF37]/80 truncate">
                      {currentSong.artists?.map((a:any) => a.name).join(", ")}
                  </div>
                  {currentSong.sources && currentSong.sources.length > 0 && (
                      <div className="text-[10px] text-gray-400 mt-0.5 px-1.5 py-0.5 bg-white/5 rounded w-fit truncate max-w-full">
                          {currentSong.sources[0].name}
                      </div>
                  )}
               </div>
           ) : null}

           {songQueue && songQueue.length > 0 && (
               <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-[#D4AF37]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><ListMusic size={12}/> En Cola ({songQueue.length})</span>
                  <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                      {songQueue.map((s:any, idx:number) => (
                          <div key={idx} className="flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                              <span className="text-[12px] font-medium text-gray-200 truncate">{s.title}</span>
                              <span className="text-[10px] text-pink-400/80 truncate flex items-center gap-1"><User size={10}/> {s.requester}</span>
                          </div>
                      ))}
                  </div>
               </div>
           )}

           {!currentRequestedSong && songHistory && songHistory.length > 0 && (`;

code = code.replace(/           \{currentSong && \(\n               <div className="flex flex-col gap-1">\n                  <span className="text-\[10px\] text-pink-400 font-bold uppercase tracking-wider">Sonando Ahora<\/span>\n                  <div className="text-sm font-semibold text-white leading-tight break-words">\{currentSong.title\}<\/div>\n                  <div className="text-xs text-\[\#D4AF37\]\/80 truncate">\n                      \{currentSong.artists\?\.map\(\(a:any\) => a.name\).join\(\", \"\)\}\n                  <\/div>\n                  \{currentSong.sources && currentSong.sources.length > 0 && \(\n                      <div className="text-\[10px\] text-gray-400 mt-0.5 px-1.5 py-0.5 bg-white\/5 rounded w-fit truncate max-w-full">\n                          \{currentSong.sources\[0\].name\}\n                      <\/div>\n                  \)\}\n               <\/div>\n           \)\}\n\n           \{songHistory && songHistory.length > 0 && \(/, songHistoryUI);

const renderPlayer = `      {currentRequestedSong && isPlaying && (
         <div className="hidden">
             <ReactPlayer 
                 url={currentRequestedSong.url} 
                 playing={isPlaying} 
                 volume={isMuted ? 0 : volume}
                 onEnded={handleVideoEnded}
                 onReady={() => setIsVideoReady(true)}
                 onError={(e) => {
                     console.error("YouTube Player Error", e);
                     handleVideoEnded(); // Skip on error
                 }}
             />
         </div>
      )}

      <audio 
        ref={audioRef} 
        src={streamUrl} 
        preload="none" 
      />
    </div>`;
code = code.replace(/      <audio \n        ref=\{audioRef\} \n        src=\{streamUrl\} \n        preload="none" \n       \/>\n    <\/div>/, renderPlayer);


fs.writeFileSync('src/components/InlineRadio.tsx', code);
