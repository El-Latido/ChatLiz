import React, { useState, useEffect, useRef } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Loader2, Music, ListMusic, ChevronDown, ChevronUp } from 'lucide-react';

export function InlineRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [songHistory, setSongHistory] = useState<any[]>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamUrl = "https://listen.moe/stream";

  useEffect(() => {
    let ws = new WebSocket('wss://listen.moe/gateway_v2');
    wsRef.current = ws;
    
    let heartbeatInterval: NodeJS.Timeout;

    ws.onopen = () => {
      // heartbeats setup happens when we get op 0
    };

    ws.onmessage = (event) => {
      try {
        let msg = JSON.parse(event.data);
        if (msg.op === 0) { 
            const hb = msg.d.heartbeat || 35000;
            heartbeatInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ op: 9 }));
                }
            }, hb);
        } else if (msg.op === 1) { // TRACK_UPDATE
           const song = msg.d.song;
           if (song) {
               setCurrentSong(song);
           }
           if (msg.d.lastPlayed) {
               setSongHistory(msg.d.lastPlayed);
           }
        }
      } catch (e) {}
    };

    return () => {
       if (heartbeatInterval) clearInterval(heartbeatInterval);
       if (ws.readyState === WebSocket.OPEN) ws.close();
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Playback failed", err);
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
    if (isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div 
      className="relative flex items-center transition-all duration-300 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowHistory(false); }}
    >
      <div className={`bg-[#121B2A]/80 backdrop-blur-md border border-[#D4AF37]/50 rounded-[16px] w-[46px] h-[46px] shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center overflow-hidden transition-all duration-300 hover:bg-[#D4AF37]/10`}>
        <button 
          onClick={togglePlay}
          className={`w-[30px] h-[30px] flex items-center justify-center rounded-full transition-all ${isPlaying ? 'text-[#D4AF37] bg-[#D4AF37]/20 shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}
          title="Otakus Dream Radio"
        >
          {isLoading ? (
             <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={18} strokeWidth={2.5} />
          ) : (
            <Play size={18} strokeWidth={2.5} className="ml-0.5" />
          )}
        </button>
      </div>

      <div className={`absolute bottom-[56px] left-0 bg-[#121B2A]/90 backdrop-blur-md border border-[#D4AF37]/50 rounded-[12px] p-2 flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300 ${isHovered || isPlaying || showHistory ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <button onClick={toggleMute} className="text-[#D4AF37]/80 hover:text-[#D4AF37]">
          {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-20 accent-[#D4AF37] h-1.5 bg-[#1A2639] rounded-lg appearance-none cursor-pointer"
        />
        <div className="w-px h-4 bg-[#D4AF37]/30 mx-1"></div>
        <button onClick={() => setShowHistory(!showHistory)} className="text-[#D4AF37]/80 hover:text-[#D4AF37] flex items-center gap-1 transition-colors relative group">
           <Music size={14} />
           {currentSong && <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>}
        </button>
      </div>

      {showHistory && (
        <div className="absolute bottom-[104px] left-0 w-64 bg-[#121B2A]/95 backdrop-blur-xl border border-[#D4AF37]/50 rounded-[16px] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
           <div className="flex justify-between items-center pb-2 border-b border-[#D4AF37]/20">
              <h3 className="text-[#E8D9B0] font-bold text-sm flex items-center gap-1.5">
                 <Radio size={14} className="text-pink-400" />
                 Al Aire
              </h3>
              <button onClick={() => setShowHistory(false)} className="text-[#D4AF37]/50 hover:text-[#D4AF37]"><ChevronDown size={16}/></button>
           </div>
           
           {currentSong && (
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
           )}

           {songHistory && songHistory.length > 0 && (
               <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-[#D4AF37]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><ListMusic size={12}/> Escuchadas</span>
                  <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                      {songHistory.slice(0, 4).map((s:any, idx:number) => (
                          <div key={idx} className="flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                              <span className="text-[12px] font-medium text-gray-200 truncate">{s.title}</span>
                              <span className="text-[10px] text-gray-400 truncate">{s.artists?.map((a:any) => a.name).join(", ")}</span>
                          </div>
                      ))}
                  </div>
               </div>
           )}
        </div>
      )}

      <audio 
        ref={audioRef} 
        src={streamUrl} 
        preload="none" 
      />
    </div>
  );
}
