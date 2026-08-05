import React, { useState, useEffect, useRef } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

export function InlineRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Otakus Dream / Anime Radio stream URL
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
      className="relative flex items-center transition-all duration-300 z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

      <div className={`absolute bottom-[56px] left-0 bg-[#121B2A]/90 backdrop-blur-md border border-[#D4AF37]/50 rounded-[12px] p-2 flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300 ${isHovered || isPlaying ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
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
      </div>

      <audio 
        ref={audioRef} 
        src={streamUrl} 
        preload="none" 
      />
    </div>
  );
}
