import React, { useEffect, useRef } from 'react';
import { PhoneOff } from 'lucide-react';

interface OutgoingCallModalProps {
    partner: { username: string, profilePic: string };
    onCancel: () => void;
}

export function OutgoingCallModal({ partner, onCancel }: OutgoingCallModalProps) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.error("Auto-play prevented", e));
        }
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2972/2972-preview.mp3" loop />
            <div className="bg-[#12141c] p-8 rounded-3xl w-full max-w-sm shadow-[0_0_40px_rgba(6,182,212,0.3)] relative border border-cyan-500/30 text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-cyan-500/50 mb-4 animate-pulse relative">
                    <img src={partner.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=\${partner.username}`} alt={partner.username} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Llamando...</h3>
                <p className="text-gray-300 mb-8">
                    Esperando respuesta de <span className="font-bold text-cyan-400">{partner.username}</span>
                </p>
                
                <button 
                    onClick={onCancel}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all hover:scale-105"
                >
                    <PhoneOff size={24} />
                    <span className="font-bold">Cancelar Llamada</span>
                </button>
            </div>
        </div>
    );
}
