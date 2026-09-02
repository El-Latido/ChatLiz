import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff, PhoneCall } from 'lucide-react';

interface CallModalProps {
    caller: { username: string, profilePic: string };
    onAccept: () => void;
    onReject: () => void;
}

export function CallModal({ caller, onAccept, onReject }: CallModalProps) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.error("Auto-play prevented", e));
        }
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3" loop />
            <div className="bg-[#12141c] p-8 rounded-3xl w-full max-w-sm shadow-[0_0_40px_rgba(6,182,212,0.3)] relative border border-cyan-500/30 text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-cyan-500/50 mb-4 animate-pulse relative">
                    <img src={caller.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=\${caller.username}`} alt={caller.username} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Llamada Entrante</h3>
                <p className="text-gray-300 mb-8">
                    <span className="font-bold text-cyan-400">{caller.username}</span> te está llamando...
                </p>
                
                <div className="flex gap-4">
                    <button 
                        onClick={onReject}
                        className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all hover:scale-105"
                    >
                        <PhoneOff size={24} />
                        <span className="font-bold">Rechazar</span>
                    </button>
                    <button 
                        onClick={onAccept}
                        className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 transition-all hover:scale-105"
                    >
                        <Phone size={24} className="animate-bounce" />
                        <span className="font-bold">Atender</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
