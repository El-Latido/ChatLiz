import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, MessageSquare, AlertTriangle, Send } from 'lucide-react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
const ChessboardAny = Chessboard as any;
import { socket } from '../socket';
import { UserObj } from '../types';

interface ChessGameModalProps {
  onClose: () => void;
  user: UserObj;
  gameId: string;
  opponent: UserObj;
  bet: number;
  isHost: boolean;
}

export function ChessGameModal({ onClose, user, gameId, opponent, bet, isHost }: ChessGameModalProps) {
  const [game, setGame] = useState(new Chess());
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [status, setStatus] = useState('playing'); // playing, won, lost, draw, abandoned
  const [winner, setWinner] = useState('');
  
  const myColor = isHost ? 'w' : 'b';

  useEffect(() => {
    socket.emit('join_chess_game', gameId);

    socket.on('chess_move', (moveInfo: { move: any, fen: string }) => {
      const newGame = new Chess(moveInfo.fen);
      setGame(newGame);
    });

    socket.on('chess_chat', (msg: { sender: string, text: string }) => {
      setMessages(prev => [...prev, msg]);
      if (['😂', '🤔', '😡', '👏', '😱'].includes(msg.text)) {
          try {
              const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3');
              audio.play();
          } catch(e) {}
      }
    });

    socket.on('chess_end', (data: { reason: string, winner: string }) => {
      setStatus(data.winner === user.username ? 'won' : data.winner ? 'lost' : 'draw');
      setWinner(data.winner);
    });

    return () => {
      socket.emit('leave_chess_game', gameId);
      socket.off('chess_move');
      socket.off('chess_chat');
      socket.off('chess_end');
    };
  }, [gameId, user.username]);

  function onDrop(sourceSquare: string, targetSquare: string) {
    if (status !== 'playing' || game.turn() !== myColor) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });
      if (move === null) return false;
      
      const newGame = new Chess(game.fen());
      setGame(newGame);
      socket.emit('chess_move', { gameId, move, fen: newGame.fen() });
      
      if (newGame.isGameOver()) {
        socket.emit('chess_game_over', { gameId, result: newGame.isCheckmate() ? 'checkmate' : 'draw', winner: user.username });
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit('chess_chat', { gameId, text: chatInput });
    setChatInput('');
  };

  const abandonGame = () => {
    if (confirm("¿Seguro que quieres abandonar? Si has hecho al menos un movimiento, perderás tu apuesta.")) {
      socket.emit('abandon_chess_game', gameId);
      onClose();
    }
  };
  
  const getEloRank = (elo: number = 0) => {
      if (elo <= 300) return { name: 'Cobre', color: 'text-orange-700' };
      if (elo <= 600) return { name: 'Bronce', color: 'text-orange-400' };
      if (elo <= 900) return { name: 'Plata', color: 'text-gray-300' };
      if (elo <= 1200) return { name: 'Platino', color: 'text-cyan-200' };
      return { name: 'Oro', color: 'text-yellow-400' };
  };
  
  const getCapturedPieces = () => {
      const board = game.board();
      const initialCounts: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
      const currentCounts: Record<string, number> = { wp: 0, wn: 0, wb: 0, wr: 0, wq: 0, bp: 0, bn: 0, bb: 0, br: 0, bq: 0 };
      
      board.forEach(row => {
          row.forEach(piece => {
              if (piece) {
                  currentCounts[piece.color + piece.type]++;
              }
          });
      });

      const capturedWhite = []; // Black captured these
      const capturedBlack = []; // White captured these
      
      for (const [type, count] of Object.entries(initialCounts)) {
          const wDiff = count - currentCounts['w' + type];
          const bDiff = count - currentCounts['b' + type];
          for (let i = 0; i < wDiff; i++) capturedWhite.push(type);
          for (let i = 0; i < bDiff; i++) capturedBlack.push(type);
      }

      return {
          whiteCaptured: capturedWhite, // Captured by Black
          blackCaptured: capturedBlack  // Captured by White
      };
  };

  const captured = getCapturedPieces();
  const myCaptured = isHost ? captured.blackCaptured : captured.whiteCaptured; // Host is white, captures black
  const opCaptured = isHost ? captured.whiteCaptured : captured.blackCaptured; // Guest is black, captures white

  const pieceSymbols: Record<string, string> = { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕' };

  const myRank = getEloRank(user.elo);
  const opRank = getEloRank(opponent.elo);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-6 animate-in fade-in">
      <div className="bg-gradient-to-b from-[#0a0f1c] to-[#121B2A] border border-[#D4AF37]/30 rounded-3xl w-full max-w-6xl max-h-[95vh] flex flex-col md:flex-row overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]">
        
        {/* Left Side: Game Board (3D effect container) */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* 3D Table Background */}
            <div className="absolute inset-x-10 bottom-0 top-1/4 bg-[#3d2314] rounded-[100%] shadow-[inset_0_-20px_50px_rgba(0,0,0,0.8)] opacity-50 transform perspective-[1000px] rotateX(60deg) scale-150 pointer-events-none"></div>

            <div className="w-full max-w-[500px] flex justify-between items-center mb-4 relative z-10 bg-black/40 px-4 py-2 rounded-xl border border-[#D4AF37]/20">
                <div className="flex items-center gap-3">
                    <img src={opponent.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponent.username}`} className="w-12 h-12 rounded-full border-2 border-red-500/50" alt="" />
                    <div>
                        <div className="font-bold text-white text-lg">{opponent.username}</div>
                        <div className={`text-xs font-bold ${opRank.color}`}>Nivel: {opRank.name} ({opponent.elo || 0})</div>
                    </div>
                </div>
                <div className="text-xl tracking-tight text-white/70">
                    {opCaptured.map((p, i) => <span key={i} className={isHost ? 'text-white' : 'text-gray-500'}>{pieceSymbols[p]}</span>)}
                </div>
            </div>

            <div className="w-full max-w-[500px] aspect-square relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-md border-4 border-[#8B5A2B] bg-[#f0d9b5]">
                <ChessboardAny 
                    position={game.fen()} 
                    onPieceDrop={onDrop}
                    boardOrientation={isHost ? 'white' : 'black'}
                    customDarkSquareStyle={{ backgroundColor: '#b58863' }}
                    customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                />
            </div>

            <div className="w-full max-w-[500px] flex justify-between items-center mt-4 relative z-10 bg-black/40 px-4 py-2 rounded-xl border border-[#D4AF37]/20">
                <div className="flex items-center gap-3">
                    <img src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="w-12 h-12 rounded-full border-2 border-[#D4AF37]" alt="" />
                    <div>
                        <div className="font-bold text-[#D4AF37] text-lg">{user.username} (Tú)</div>
                        <div className={`text-xs font-bold ${myRank.color}`}>Nivel: {myRank.name} ({user.elo || 0})</div>
                    </div>
                </div>
                 <div className="text-xl tracking-tight text-[#D4AF37]">
                    {myCaptured.map((p, i) => <span key={i} className={isHost ? 'text-gray-500' : 'text-white'}>{pieceSymbols[p]}</span>)}
                </div>
            </div>
            
            {status !== 'playing' && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in zoom-in">
                    <div className="bg-[#121B2A] border border-[#D4AF37]/50 p-8 rounded-3xl flex flex-col items-center shadow-2xl">
                        <Trophy size={64} className={status === 'won' ? 'text-yellow-400 mb-4' : 'text-gray-500 mb-4'} />
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {status === 'won' ? '¡Has Ganado!' : status === 'lost' ? 'Has Perdido' : 'Empate'}
                        </h2>
                        <p className="text-[#D4AF37] text-lg mb-6">
                            {status === 'won' ? `+${bet} Liz-Moneditas y ELO` : status === 'lost' ? `-${bet} Liz-Moneditas` : 'No hay cambios'}
                        </p>
                        <button onClick={onClose} className="px-6 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Right Side: Chat & Controls */}
        <div className="w-full md:w-80 border-l border-[#D4AF37]/20 bg-black/40 flex flex-col z-10">
            <div className="p-4 border-b border-[#D4AF37]/20 flex justify-between items-center bg-[#D4AF37]/5">
                <div className="font-bold text-[#D4AF37] flex items-center gap-2">
                    <Trophy size={18} /> Apuesta: {bet * 2} LM
                </div>
                <button onClick={abandonGame} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
                    <AlertTriangle size={16} /> Salir
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
                {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.sender === user.username ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-gray-500 mb-0.5 px-1">{m.sender}</span>
                        <div className={`px-3 py-1.5 rounded-xl max-w-[85%] text-sm ${m.sender === user.username ? 'bg-[#D4AF37]/20 text-[#E8D9B0]' : 'bg-white/10 text-gray-200'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={sendChat} className="p-3 border-t border-[#D4AF37]/20 flex gap-2">
                <input 
                    type="text" 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    placeholder="Escribe en la mesa..." 
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                />
                <button type="submit" className="p-2 bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 rounded-xl transition-colors">
                    <Send size={18} />
                </button>
            </form>
            
            {/* Emoticons Bar */}
            <div className="p-2 bg-black/60 flex justify-center gap-2 border-t border-[#D4AF37]/10">
                {['😂', '🤔', '😡', '👏', '😱'].map(emo => (
                    <button key={emo} type="button" onClick={() => {
                        socket.emit('chess_chat', { gameId, text: emo });
                        try {
                            const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3');
                            audio.play();
                        } catch(e) {}
                    }} className="text-2xl hover:scale-110 transition-transform p-1">
                        {emo}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
