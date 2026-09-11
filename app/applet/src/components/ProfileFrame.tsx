import React from 'react';

export const FRAMES = [
  { id: 'gold_royal', name: 'Rey Dorado', category: 'Premium' },
  { id: 'neon_cyber', name: 'Cyberpunk Neón', category: 'Premium' },
  { id: 'nature_vine', name: 'Naturaleza Mística', category: 'Gratis' },
  { id: 'fire_ring', name: 'Anillo de Fuego', category: 'Premium' },
  { id: 'ice_crown', name: 'Corona de Hielo', category: 'Gratis' },
  { id: 'dark_magic', name: 'Magia Oscura', category: 'Premium' },
  { id: 'love_hearts', name: 'Amor y Flores', category: 'Gratis' },
  { id: 'hacker_matrix', name: 'Matrix Digital', category: 'Premium' },
];

export default function ProfileFrame({ frameId, className = "" }: { frameId?: string, className?: string }) {
  if (!frameId) return null;

  const renderFrame = () => {
    switch (frameId) {
      case 'gold_royal':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl" style={{ overflow: 'visible' }}>
            <circle cx="50" cy="50" r="48" fill="none" stroke="url(#goldGrad)" strokeWidth="4" />
            <circle cx="50" cy="50" r="54" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
            <path d="M 50 2 L 55 10 L 45 10 Z" fill="#FFD700" />
            <path d="M 50 98 L 55 90 L 45 90 Z" fill="#FFD700" />
            <path d="M 2 50 L 10 45 L 10 55 Z" fill="#FFD700" />
            <path d="M 98 50 L 90 45 L 90 55 Z" fill="#FFD700" />
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BF953F" />
                <stop offset="25%" stopColor="#FCF6BA" />
                <stop offset="50%" stopColor="#B38728" />
                <stop offset="75%" stopColor="#FBF5B7" />
                <stop offset="100%" stopColor="#AA771C" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 'neon_cyber':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" style={{ overflow: 'visible', filter: 'drop-shadow(0 0 4px #0ff)' }}>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#00ffff" strokeWidth="3" strokeDasharray="10 5 20 5" className="animate-[spin_4s_linear_infinite]" />
            <circle cx="50" cy="50" r="52" fill="none" stroke="#ff00ff" strokeWidth="2" strokeDasharray="30 10" className="animate-[spin_6s_linear_infinite_reverse]" />
          </svg>
        );
      case 'nature_vine':
         return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" style={{ overflow: 'visible' }}>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#2E8B57" strokeWidth="4" />
            <path d="M 10 50 Q 0 20 20 10 T 50 5" fill="none" stroke="#3CB371" strokeWidth="3" />
            <path d="M 90 50 Q 100 80 80 90 T 50 95" fill="none" stroke="#3CB371" strokeWidth="3" />
            <circle cx="20" cy="20" r="3" fill="#FF69B4" />
            <circle cx="80" cy="80" r="3" fill="#FF69B4" />
          </svg>
         );
      case 'fire_ring':
         return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_#ff4500]" style={{ overflow: 'visible' }}>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#ff4500" strokeWidth="3" className="animate-pulse" />
            <circle cx="50" cy="50" r="52" fill="none" stroke="#ff8c00" strokeWidth="2" strokeDasharray="15 10" className="animate-[spin_2s_linear_infinite]" />
            <circle cx="50" cy="50" r="56" fill="none" stroke="#ffd700" strokeWidth="1" strokeDasharray="5 20" className="animate-[spin_1s_linear_infinite_reverse]" />
          </svg>
         );
      case 'ice_crown':
         return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_5px_#00ffff]" style={{ overflow: 'visible' }}>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#add8e6" strokeWidth="4" />
            <path d="M 50 0 L 55 10 L 45 10 Z M 15 15 L 25 20 L 15 25 Z M 85 15 L 75 20 L 85 25 Z" fill="#00ffff" opacity="0.8"/>
            <circle cx="50" cy="50" r="52" fill="none" stroke="#e0ffff" strokeWidth="1" strokeDasharray="2 8" />
          </svg>
         );
      case 'dark_magic':
         return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_#8a2be2]" style={{ overflow: 'visible' }}>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#4b0082" strokeWidth="5" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="#8a2be2" strokeWidth="2" strokeDasharray="10 30" className="animate-[spin_3s_linear_infinite]" />
            <path d="M 50 2 L 52 15 L 65 15 L 54 22 L 58 35 L 50 27 L 42 35 L 46 22 L 35 15 L 48 15 Z" fill="#9370db" transform="scale(0.5) translate(50, -10)" className="animate-pulse" />
          </svg>
         );
      case 'love_hearts':
         return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" style={{ overflow: 'visible' }}>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#ffb6c1" strokeWidth="4" />
            <path d="M 50 15 C 50 15 45 5 35 5 C 20 5 20 25 20 25 C 20 40 50 55 50 55 C 50 55 80 40 80 25 C 80 25 80 5 70 5 C 60 5 50 15 50 15 Z" fill="#ff69b4" transform="scale(0.3) translate(120, -50)" className="animate-bounce" />
            <path d="M 50 15 C 50 15 45 5 35 5 C 20 5 20 25 20 25 C 20 40 50 55 50 55 C 50 55 80 40 80 25 C 80 25 80 5 70 5 C 60 5 50 15 50 15 Z" fill="#ff1493" transform="scale(0.2) translate(350, 300)" className="animate-pulse" />
          </svg>
         );
      case 'hacker_matrix':
         return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_5px_#00ff00]" style={{ overflow: 'visible' }}>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#003300" strokeWidth="6" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="#00ff00" strokeWidth="2" strokeDasharray="5 5 20 5" className="animate-[spin_2s_steps(10)_infinite]" />
            <text x="10" y="20" fill="#00ff00" fontSize="8" fontFamily="monospace" className="animate-pulse">01</text>
            <text x="80" y="85" fill="#00ff00" fontSize="8" fontFamily="monospace" className="animate-pulse">10</text>
          </svg>
         );
      default:
        return null;
    }
  };

  return (
    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center ${className}`} style={{ width: '135%', height: '135%' }}>
      {renderFrame()}
    </div>
  );
}
