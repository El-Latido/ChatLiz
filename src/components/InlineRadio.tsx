import React, { useState, useEffect, useRef } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Loader2, Music, ListMusic, ChevronDown, ChevronUp, Youtube, User } from 'lucide-react';
import ReactPlayer from 'react-player';
const Player = ReactPlayer as any;
import { socket } from '../socket';

export function InlineRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [songHistory, setSongHistory] = useState<any[]>([]);
  
  const [songQueue, setSongQueue] = useState<any[]>([]);
  const [currentRequestedSong, setCurrentRequestedSong] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState("https://listen.moe/stream");
  const [currentLiveDJ, setCurrentLiveDJ] = useState<string | null>(null);
  const [djQueue, setDjQueue] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [announcementState, setAnnouncementState] = useState<'idle' | 'playing' | 'done'>('done');
  const [lastSongId, setLastSongId] = useState<string | null>(null);
  const announcementAudioRef = useRef<HTMLAudioElement>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws = new WebSocket('wss://listen.moe/gateway_v2');
    wsRef.current = ws;
    
    let heartbeatInterval: NodeJS.Timeout;

    ws.onopen = () => {
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
    const handleQueueUpdate = (data: { queue: any[], current: any, history?: any[] }) => {
       setSongQueue(data.queue);
       setCurrentRequestedSong(data.current);
       if (data.history) setSongHistory(data.history);
    };
    const handleRadioState = (data: { currentLiveDJ: string | null, streamUrl: string }) => {
       setCurrentLiveDJ(data.currentLiveDJ);
       setStreamUrl(data.streamUrl);
    };
    const handleDjQueueUpdate = (queue: any[]) => {
       setDjQueue(queue);
    };
    const handleDjRequestStatus = (req: { id: string, status: string, title: string }) => {
       setMyRequests(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(r => r.id === req.id);
          if (idx !== -1) {
              updated[idx] = req;
          } else {
              updated.push(req);
          }
          return updated;
       });
    };
    
    socket.on('queue_update', handleQueueUpdate);
    socket.on('radio_history_update', (history: any[]) => setSongHistory(history));
    socket.on('radio_state_update', handleRadioState);
    socket.on('dj_queue_update', handleDjQueueUpdate);
    socket.on('dj_request_status', handleDjRequestStatus);
    
    return () => {
       socket.off('queue_update', handleQueueUpdate);
       socket.off('radio_history_update');
       socket.off('radio_state_update', handleRadioState);
       socket.off('dj_queue_update', handleDjQueueUpdate);
       socket.off('dj_request_status', handleDjRequestStatus);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlaying = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handleError = () => setIsLoading(false);
    
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('error', handleError);
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    
    // Set volume correctly depending on state
    if (currentRequestedSong) {
      // Mute main radio when YouTube is playing to ensure separation
      audioRef.current.volume = 0;
    } else {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, currentRequestedSong]);

  useEffect(() => {
    if (isPlaying) {
      if (currentRequestedSong) {
         // Pause main radio
         if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
         }
         // Force YouTube to play explicitly
         if (playerRef.current && typeof playerRef.current.getInternalPlayer === 'function') {
            const internalPlayer = playerRef.current.getInternalPlayer();
            if (internalPlayer && typeof internalPlayer.playVideo === 'function') {
                internalPlayer.playVideo();
            }
         }
      } else {
         // Play main radio
         if (audioRef.current && audioRef.current.paused) {
             // Reload to catch up to live if it was paused
             audioRef.current.load();
             const playPromise = audioRef.current.play();
             if (playPromise !== undefined) {
                 playPromise.catch((e: any) => {
                     if (e.name === 'AbortError') {
                         console.log('Reproducción de radio cancelada por nueva petición.');
                         return;
                     }
                     console.error("Radio play error:", e);
                     setIsPlaying(false);
                 });
             }
         }
      }
    } else {
      // Pause both
      if (audioRef.current && !audioRef.current.paused) {
         audioRef.current.pause();
      }
      if (playerRef.current && typeof playerRef.current.getInternalPlayer === 'function') {
         const internalPlayer = playerRef.current.getInternalPlayer();
         if (internalPlayer && typeof internalPlayer.pauseVideo === 'function') {
             internalPlayer.pauseVideo();
         }
      }
    }
  }, [isPlaying, currentRequestedSong]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
    if (isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

    useEffect(() => {
    if (currentRequestedSong && currentRequestedSong.id !== lastSongId) {
        setLastSongId(currentRequestedSong.id);
        setIsVideoReady(false);
        setIsVideoPlaying(false);
        if (currentRequestedSong.announcementUrl) {
            setAnnouncementState('idle');
        } else {
            setAnnouncementState('done');
        }
    }
  }, [currentRequestedSong, lastSongId]);

  useEffect(() => {
      if (isPlaying && announcementState === 'idle' && currentRequestedSong?.announcementUrl && announcementAudioRef.current) {
          setAnnouncementState('playing');
          announcementAudioRef.current.play().catch((e: any) => {
              if (e.name === 'AbortError') return;
              console.error("Auto-play blocked for announcement", e);
              setAnnouncementState('done');
          });
      }
  }, [isPlaying, announcementState, currentRequestedSong]);

  const handleVideoEnded = () => {
     if (currentRequestedSong) {
         socket.emit("song_ended", { id: currentRequestedSong.id });
     }
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
          title="Radio Global"
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
           {(currentRequestedSong || currentSong) && <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>}
        </button>
      </div>

      {showHistory && (
        <div className="absolute bottom-[104px] left-0 w-64 max-h-[60vh] overflow-y-auto scrollbar-thin bg-[#121B2A]/95 backdrop-blur-xl border border-[#D4AF37]/50 rounded-[16px] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
           <div className="flex justify-between items-center pb-2 border-b border-[#D4AF37]/20">
              <h3 className="text-[#E8D9B0] font-bold text-sm flex items-center gap-1.5">
                 <Radio size={14} className="text-pink-400" />
                 {currentLiveDJ ? `Live: DJ ${currentLiveDJ}` : 'SONANDO AHORA'}
              </h3>
              <button onClick={() => setShowHistory(false)} className="text-[#D4AF37]/50 hover:text-[#D4AF37]"><ChevronDown size={16}/></button>
           </div>
           

           
           {Array.isArray(myRequests) && myRequests.length > 0 && (
               <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-[#D4AF37]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><ListMusic size={12}/> Mis Pedidos DJ</span>
                  <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                      {myRequests.map((req:any, idx:number) => (
                          <div key={idx} className="flex flex-col bg-white/5 p-1.5 rounded">
                              <span className="text-[11px] font-medium text-gray-200 truncate">{req?.title}</span>
                              <span className={`text-[10px] font-bold ${req?.status === 'accepted' ? 'text-green-400' : req?.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>
                                  {req?.status === 'accepted' ? '✔ Aceptado' : req?.status === 'rejected' ? '❌ Rechazado' : '⏳ Pendiente'}
                              </span>
                          </div>
                      ))}
                  </div>
               </div>
           )}
           {currentRequestedSong && (!currentLiveDJ || currentLiveDJ === 'Elizabeth') ? (
               <div className="flex flex-col gap-1 border border-pink-500/30 bg-pink-500/5 rounded-xl p-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                  <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider flex items-center gap-1"><Youtube size={12}/> Pedido Especial</span>
                  <div className="text-sm font-semibold text-white leading-tight break-words">{currentRequestedSong.title}</div>
                  <div className="text-xs text-[#D4AF37]/80 truncate flex items-center gap-1 mt-0.5">
                      <User size={10} /> {currentRequestedSong.requester}
                  </div>
                  {isPlaying && (isVideoReady || announcementState === 'playing') && !isVideoPlaying && announcementState === 'done' && (
                     <button 
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
                     </button>
                  )}
               </div>
           ) : currentSong ? (
               <div className="flex flex-col gap-0.5 mb-1 px-2 py-1.5 max-h-[70px]" style={{ fontSize: '0.85rem' }}>
                  <span className="text-[9px] text-pink-400 font-bold uppercase tracking-wider">Sonando Ahora</span>
                  <div className="text-xs font-semibold text-white leading-tight break-words truncate">{currentSong.title}</div>
                  <div className="text-[10px] text-[#D4AF37]/80 truncate">
                      {Array.isArray(currentSong?.artists) ? currentSong.artists.map((a:any) => a.name).join(', ') : ''}
                  </div>
               </div>
           ) : null}

           {Array.isArray(songQueue) && songQueue.length > 0 && (
               <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-[#D4AF37]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><ListMusic size={12}/> En Cola ({songQueue.length})</span>
                  <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                      {songQueue.map((s:any, idx:number) => (
                          <div key={idx} className="flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                              <span className="text-[12px] font-medium text-gray-200 truncate">{s?.title}</span>
                              <span className="text-[10px] text-pink-400/80 truncate flex items-center gap-1"><User size={10}/> {s?.requester}</span>
                          </div>
                      ))}
                  </div>
               </div>
           )}

           {Array.isArray(songHistory) && songHistory.length > 0 && (
               <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-[#D4AF37]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><ListMusic size={12}/> ESCUCHADAS (Últimas 30)</span>
                  <div className="radio-sidebar max-h-[220px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#D4AF37]/50 scrollbar-track-transparent pr-1" style={{ WebkitOverflowScrolling: 'touch', padding: '5px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <ol className="flex flex-col gap-2">
                      {songHistory.map((s:any, index:number) => (
                          <li key={index} className="flex flex-col bg-[#1A2639]/50 p-1.5 rounded opacity-80 hover:opacity-100 transition-opacity" >
                              <span className="text-[12px] font-medium text-gray-200 truncate">
                                  <strong className="text-[#D4AF37] mr-1">{index + 1}.</strong> {s?.title || 'Canción Desconocida'} - {Array.isArray(s?.artists) ? s.artists.map((a:any) => a.name).join(', ') : (s?.requester ? `Añadida por: ${s?.requester}` : 'Desconocido')}
                              </span>
                          </li>
                      ))}
                      </ol>
                  </div>
               </div>
           )}
        </div>
      )}

      <div className="fixed top-0 left-0 w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden" aria-hidden="true">
         {currentRequestedSong && (!currentLiveDJ || currentLiveDJ === 'Elizabeth') && (
             <Player 
                 ref={playerRef}
                 url={currentRequestedSong.url} 
                 playing={isPlaying && announcementState === 'done'} 
                 volume={isMuted ? 0 : volume}
                 onEnded={handleVideoEnded}
                 onReady={() => {
                     setIsVideoReady(true);
                     if (isPlaying && playerRef.current) {
                         const internal = playerRef.current.getInternalPlayer();
                         if (internal && internal.playVideo) internal.playVideo();
                     }
                 }}
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
      </div>

      <audio 
        ref={audioRef} 
        src={streamUrl} 
        preload="none" 
      />
    </div>
  );
}
