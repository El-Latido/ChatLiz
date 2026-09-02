import React from 'react';
import { Phone, PhoneOff, PhoneCall } from 'lucide-react';

interface CallModalProps {
    caller: string;
    onAccept: () => void;
    onReject: () => void;
}

export function CallModal({ caller, onAccept, onReject }: CallModalProps) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-[#12141c] p-8 rounded-3xl w-full max-w-sm shadow-[0_0_40px_rgba(6,182,212,0.3)] relative border border-cyan-500/30 text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <PhoneCall size={40} className="text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Llamada Entrante</h3>
                <p className="text-gray-300 mb-8">
                    El usuario <span className="font-bold text-cyan-400">{caller}</span> te está llamando...
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
