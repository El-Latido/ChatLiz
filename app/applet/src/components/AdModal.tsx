import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Coins } from 'lucide-react';
import { socket } from '../socket';

interface AdModalProps {
  onClose: () => void;
  onSuccess: (newCoins: number) => void;
}

export default function AdModal({ onClose, onSuccess }: AdModalProps) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [canClose, setCanClose] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // A strict 15s timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClaim = () => {
    if (claiming) return;
    setClaiming(true);
    socket.emit("watch_ad_reward", (res: any) => {
      if (res.success) {
         onSuccess(res.newCoins);
      } else {
         setError("Error al reclamar la recompensa. Intenta de nuevo.");
         setClaiming(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
       {/* Real Video Element to simulate the Ad */}
       <div className="relative w-full max-w-3xl aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-white/10">
         <video
           ref={videoRef}
           src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
           autoPlay
           playsInline
           className="w-full h-full object-cover"
           onEnded={() => { setTimeLeft(0); setCanClose(true); }}
           onError={() => { 
             console.log("Video ad fallback triggered due to loading error."); 
           }}
         />
         
         <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-white text-xs font-bold uppercase tracking-wider">Publicidad</span>
         </div>

         <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold border border-white/20 shadow-lg">
           {canClose ? "Recompensa Lista" : `Anuncio: ${timeLeft}s`}
         </div>
       </div>

       {/* Action Area */}
       <div className="mt-8 h-20 flex flex-col items-center justify-center">
         {canClose ? (
           <button 
             onClick={handleClaim} 
             disabled={claiming}
             className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 px-8 py-4 rounded-2xl text-white font-bold text-xl shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-transform hover:scale-110 active:scale-95 flex items-center gap-3 disabled:opacity-50"
           >
             {claiming ? <Loader2 className="animate-spin" size={28} /> : <Coins size={28} />}
             {claiming ? "Reclamando..." : "Reclamar 100 Monedas"}
           </button>
         ) : (
           <p className="text-gray-400 animate-pulse font-bold text-lg">Por favor, espera a que termine el video para reclamar...</p>
         )}
       </div>

       {error && <p className="text-red-400 font-bold mt-4">{error}</p>}
       
       <p className="absolute bottom-6 px-4 text-xs text-gray-500 max-w-2xl text-center leading-relaxed">
          * Ver este video recarga los tokens (Liz-Moneditas) para que puedas seguir interactuando con la inteligencia artificial. Al mismo tiempo, generas ganancias reales para el administrador (Axiss) ayudando a mantener los servidores activos.
       </p>
    </div>
  );
}
