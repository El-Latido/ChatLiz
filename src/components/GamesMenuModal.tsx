import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Trophy, Swords, Sparkles } from 'lucide-react';
import { UserObj } from '../types';

interface GamesMenuModalProps {
  onClose: () => void;
  onSelectGame: (gameId: string) => void;
  user: UserObj;
}

export function GamesMenuModal({ onClose, onSelectGame, user }: GamesMenuModalProps) {
  const games = [

    {
      id: 'pool',
      title: 'Billar Multijugador',
      icon: '🎱',
      description: 'Partidas 1v1 con físicas reales, control de potencia y apuestas LM.',
      color: 'from-green-500 to-emerald-500',
      shadow: 'rgba(34,197,94,0.2)',
      bg: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
      border: 'border-green-400/30'
    },    {
      id: 'tutifrutti',
      title: 'Tuti Frutti Kawaii',
      icon: '🍓',
      description: 'Juega con tus amigos a descubrir palabras. 5 rondas, validación estricta y puntos.',
      color: 'from-pink-500 to-purple-500',
      shadow: 'rgba(236,72,153,0.2)',
      bg: 'bg-gradient-to-br from-pink-500/10 to-purple-500/10',
      border: 'border-pink-400/30'
    },
    {
      id: 'chess',
      title: 'Ajedrez 3D',
      icon: '♟️',
      description: 'Compite y sube tu nivel ELO (Cobre a Oro). Apuestas duplicadas y chat de voz/emoticones.',
      color: 'from-indigo-500 to-blue-500',
      shadow: 'rgba(99,102,241,0.2)',
      bg: 'bg-gradient-to-br from-indigo-500/10 to-blue-500/10',
      border: 'border-indigo-400/30'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [chessBet, setChessBet] = useState(10);
  const currentGame = games[currentIndex];

  const nextGame = () => setCurrentIndex((prev) => (prev + 1) % games.length);
  const prevGame = () => setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f111a] border border-[#D4AF37]/30 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)] animate-in zoom-in-95">
        <div className="p-6 border-b border-[#D4AF37]/20 flex items-center justify-between bg-gradient-to-r from-[#0a0f1c] to-[#121B2A]">
          <div>
            <h2 className="text-2xl font-bold text-[#E8D9B0] flex items-center gap-2">
              <span className="text-3xl">🎮</span> Menú de Juegos
            </h2>
            <p className="text-[#D4AF37]/70 text-sm mt-1 font-medium">Selecciona una partida</p>
          </div>
          <button onClick={onClose} className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-[#121B2A]/50">
          <div className="flex items-center justify-between w-full mb-6">
            <button onClick={prevGame} className="p-2 text-[#D4AF37]/80 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-full transition-colors">
              <ChevronLeft size={32} />
            </button>
            <div className="w-24 h-24 flex items-center justify-center bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/30 shadow-lg">
                <span className="text-5xl drop-shadow-md">{currentGame.icon}</span>
            </div>
            <button onClick={nextGame} className="p-2 text-[#D4AF37]/80 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-full transition-colors">
              <ChevronRight size={32} />
            </button>
          </div>
          
          <h3 className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${currentGame.color} mb-3`}>
            {currentGame.title}
          </h3>
          <p className="text-[#E8D9B0]/80 text-center text-sm px-4 mb-8">
            {currentGame.description}
          </p>

          <div className="w-full px-4">
              {currentGame.id === 'chess' && (
                  <div className="flex flex-col gap-3 mb-4">
                      <select value={chessBet} onChange={(e) => setChessBet(Number(e.target.value))} className="bg-[#121B2A] border border-indigo-500/30 rounded-xl text-indigo-300 font-bold p-3 w-full outline-none">
                          <option value={0}>Partida Amistosa (0 LM)</option>
                          <option value={5}>Apuesta: 5 LM</option>
                          <option value={10}>Apuesta: 10 LM</option>
                          <option value={20}>Apuesta: 20 LM</option>
                          <option value={30}>Apuesta: 30 LM</option>
                          <option value={40}>Apuesta: 40 LM</option>
                      </select>
                      <button onClick={() => { onSelectGame(`chess_${chessBet}`); onClose(); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">
                          <Swords size={20} /> Crear Reto Global
                      </button>
                  </div>
              )}
              
              {currentGame.id === 'pool' && (
                  <div className="flex flex-col gap-3 mb-4">
                      <select value={chessBet} onChange={(e) => setChessBet(Number(e.target.value))} className="bg-[#121B2A] border border-green-500/30 rounded-xl text-green-300 font-bold p-3 w-full outline-none">
                          <option value={0}>Partida Amistosa (0 LM)</option>
                          <option value={5}>Apuesta: 5 LM</option>
                          <option value={10}>Apuesta: 10 LM</option>
                          <option value={20}>Apuesta: 20 LM</option>
                          <option value={50}>Apuesta: 50 LM</option>
                      </select>
                      
                      <button onClick={() => { onSelectGame(`pool_${chessBet}`); onClose(); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">
                          <Trophy size={20} /> Crear Reto Global
                      </button>

                  </div>
              )}
              {currentGame.id === 'tutifrutti' && (
                  <button onClick={() => { onSelectGame('tutifrutti'); onClose(); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">
                      <Sparkles size={20} /> Jugar Ahora
                  </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
