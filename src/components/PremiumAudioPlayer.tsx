import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export const PremiumAudioPlayer = ({ src, className = "" }: { src: string, className?: string }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const updateProgress = () => {
            setProgress((audio.currentTime / audio.duration) * 100 || 0);
        };
        const onEnd = () => {
            setIsPlaying(false);
            setProgress(0);
        };
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', onEnd);
        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', onEnd);
        };
    }, []);

    return (
        <div className={`flex items-center gap-3 bg-[#0a0f1c] px-3 py-2 rounded-full border border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.15)] w-48 max-w-full ${className}`}>
            <button onClick={togglePlay} className="flex-shrink-0 w-8 h-8 rounded-full bg-[#162032] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors">
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>
            <div className="flex-1 h-1.5 bg-[#162032] rounded-full overflow-hidden border border-[#D4AF37]/20 relative">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] rounded-full shadow-[0_0_5px_rgba(212,175,55,0.5)] transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
            </div>
            <audio ref={audioRef} src={src} className="hidden" preload="metadata" />
        </div>
    );
};
