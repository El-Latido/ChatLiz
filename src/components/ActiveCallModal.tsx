import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface ActiveCallModalProps {
    partner: string;
    onEndCall: () => void;
}

export function ActiveCallModal({ partner, onEndCall }: ActiveCallModalProps) {
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-[#0a0a16] p-8 rounded-3xl w-full max-w-md shadow-2xl relative border border-white/10 text-center flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-500/50 mb-4 relative">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partner}`} alt={partner} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-cyan-500/20 animate-pulse"></div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-1">{partner}</h3>
                <p className="text-cyan-400 font-mono text-xl mb-8">{formatTime(duration)}</p>
                
                <div className="flex items-center gap-6 bg-[#12141c] p-4 rounded-full border border-white/5">
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-gray-600/50 text-gray-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    
                    <button 
                        onClick={onEndCall}
                        className="p-5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-transform hover:scale-110"
                    >
                        <PhoneOff size={28} />
                    </button>
                    
                    <button 
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        className={`p-4 rounded-full transition-colors ${!isVideoOn ? 'bg-gray-600/50 text-gray-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {!isVideoOn ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
