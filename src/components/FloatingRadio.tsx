import React, { useState, useEffect, useRef } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

export function FloatingRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // You can use actual URL_DEL_STREAM_DE_OTAKUS_DREAM here. 
  // Fallback to listen.moe stream as an anime music example.
  const streamUrl = "https://listen.moe/stream";

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
      className="fixed bottom-4 left-4 z-50 flex items-center transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`bg-[#121B2A]/90 backdrop-blur-md border border-[#D4AF37]/40 p-2 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.15)] flex items-center gap-2 overflow-hidden transition-all duration-300 ${isHovered || isPlaying ? 'w-[200px] opacity-100' : 'w-[52px] opacity-80 hover:opacity-100'}`}>
        <button 
          onClick={togglePlay}
          className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5 hover:bg-[#D4AF37]/30 text-[#D4AF37] transition-all border border-[#D4AF37]/30"
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
        
        <div className={`flex items-center gap-2 transition-opacity duration-300 w-[140px] ${isHovered || isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={toggleMute} className="text-[#D4AF37]/80 hover:text-[#D4AF37]">
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
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
        </div>
      </div>
      <audio 
        ref={audioRef} 
        src={streamUrl} 
        preload="none" 
      />
    </div>
  );
}
