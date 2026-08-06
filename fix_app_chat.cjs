const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const t1 = `                             {isLiz ? (
                                 <div className="flex flex-col max-w-[98%] border-l-[3px] border-[#D4AF37]/20 pl-2.5 ml-1 mt-1 group">
                                     <div className="flex items-center flex-wrap gap-1.5 justify-between w-full">
                                         <div className="flex items-center flex-wrap gap-2 flex-1">
                                             <div className="flex items-center relative shrink-0 gap-1.5">
                                                <img src={avatarUrl} className="w-6 h-6 rounded-full object-cover border border-[#D4AF37]/50" alt={m.sender} />
                                                {decUrl && (
                                                    <div className="absolute -inset-2 pointer-events-none z-10 flex items-center justify-center">
                                                        <img src={decUrl} className="w-full h-full object-contain filter drop-shadow-sm" style={{ imageRendering: 'pixelated' }} alt="" />
                                                    </div>
                                                )}
                                                <span className="font-bold text-[#D4AF37] text-[14px] relative z-20">ELIZABETH {m.isAi && '(IA Administradora Gemini ✨)'}:</span>
                                             </div>
                                             <span className="text-[#E8D9B0] text-[14px] leading-snug">{m.text}</span>
                                         </div>
                                         <span className="text-[#8B98B0] text-[11px] font-mono shrink-0 ml-auto pl-2 self-end mt-1 sm:mt-0">{timeStr}</span>
                                     </div>
                                     {m.image && <div className="mt-1.5"><img src={m.image} className="rounded-xl border border-white/10 max-w-full shadow-md h-28 object-cover" alt="adjunto"/></div>}
                                     {(m.type === 'audio' || m.audio) && <div className="mt-1.5"><PremiumAudioPlayer src={m.audio} /></div>}
                                 </div>
                             ) : (
                                 <div className="bg-[#F2E3C6] rounded-[20px] rounded-tl-sm px-3.5 py-2 max-w-[95%] shadow-sm flex flex-col relative min-w-[200px] mt-1.5 group">
                                     <div className="flex items-center flex-wrap gap-1.5 justify-between w-full">
                                         <div className="flex items-center flex-wrap gap-2 flex-1">
                                             <div className="flex items-center relative shrink-0 gap-1.5">
                                                <img src={avatarUrl} className="w-6 h-6 rounded-full object-cover border border-[#5A52A5]/30 shadow-sm bg-white/5" alt={m.sender} />
                                                {decUrl && (
                                                    <div className="absolute -inset-3 pointer-events-none z-10 flex items-center justify-center">
                                                        <img src={decUrl} className="w-[120%] h-[120%] object-contain filter drop-shadow-sm opacity-80 mix-blend-multiply" style={{ imageRendering: 'pixelated' }} alt="" />
                                                    </div>
                                                )}
                                                <span className="font-bold text-[#5A52A5] text-[14px] relative z-20 px-1">{m.sender}:</span>
                                             </div>
                                             <span className="text-[#1A2035] text-[14px] leading-snug">{m.text}</span>
                                         </div>
                                         <span className="text-[#8B98B0] text-[11px] font-mono shrink-0 ml-auto pl-2 self-end mt-1 sm:mt-0">{timeStr}</span>
                                     </div>
                                         {m.type === 'chess_invite' && m.inviteData && (
                                             <button onClick={() => {
                                                 if (m.sender === user.username) return; // Can't accept own invite
                                                 if ((user.lizCoins || 0) < m.inviteData!.bet) {
                                                     alert("No tienes suficientes Liz-Moneditas.");
                                                     return;
                                                 }
                                                 socket.emit('accept_chess_invite', m.inviteData, (res: any) => {
                                                     if (res.success) {
                                                         setActiveChessGame({ id: m.inviteData!.gameId, opponent: usersOnline.find(u => u.username === m.sender) || {username: m.sender}, bet: m.inviteData!.bet, isHost: false });
                                                     } else {
                                                         alert(res.error || "Error al aceptar el reto.");
                                                     }
                                                 });
                                             }} className="w-full mt-2 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:from-blue-500 hover:to-indigo-500 transition-colors flex items-center justify-center gap-2">
                                                 <Gamepad2 size={16} /> [Jugar]
                                             </button>
                                         )}
                                         {m.image && <div className="w-full mt-1.5"><img src={m.image} className="rounded-xl border border-black/10 max-w-full shadow-md h-28 object-cover" alt="adjunto"/></div>}
                                         {(m.type === 'audio' || m.audio) && <div className="w-full mt-1.5"><PremiumAudioPlayer src={m.audio} /></div>}
                                 </div>
                             )}`;

const r1 = `                             {isLiz ? (
                                 <div className="flex gap-2 w-full max-w-[98%] mt-1 group">
                                     <div className="relative shrink-0 mt-1">
                                        <img src={avatarUrl} className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]/50" alt={m.sender} />
                                        {decUrl && (
                                            <div className="absolute -inset-3 pointer-events-none z-10 flex items-center justify-center">
                                                <img src={decUrl} className="w-[130%] h-[130%] object-contain filter drop-shadow-sm" style={{ imageRendering: 'pixelated' }} alt="" />
                                            </div>
                                        )}
                                     </div>
                                     <div className="flex flex-col border-l-[3px] border-[#D4AF37]/20 pl-2.5 ml-1 flex-1 min-w-[200px]">
                                         <div className="flex flex-col w-full relative">
                                             <span className="font-bold text-[#D4AF37] text-[13px] relative z-20 mb-1">ELIZABETH {m.isAi && '(IA Administradora Gemini ✨)'}</span>
                                             <div className="flex flex-wrap items-end justify-between gap-2">
                                                <span className="text-[#E8D9B0] text-[14px] leading-snug flex-1">{m.text}</span>
                                                <span className="text-[#8B98B0] text-[11px] font-mono shrink-0 ml-auto pl-2">{timeStr}</span>
                                             </div>
                                         </div>
                                         {m.image && <div className="mt-1.5"><img src={m.image} className="rounded-xl border border-white/10 max-w-full shadow-md h-28 object-cover" alt="adjunto"/></div>}
                                         {(m.type === 'audio' || m.audio) && <div className="mt-1.5"><PremiumAudioPlayer src={m.audio} /></div>}
                                     </div>
                                 </div>
                             ) : (
                                 <div className="flex gap-2 w-full mt-1.5 group">
                                     <div className="relative shrink-0 mt-1">
                                        <img src={avatarUrl} className="w-8 h-8 rounded-full object-cover border border-[#5A52A5]/30 shadow-sm bg-white/5" alt={m.sender} />
                                        {decUrl && (
                                            <div className="absolute -inset-3 pointer-events-none z-10 flex items-center justify-center">
                                                <img src={decUrl} className="w-[130%] h-[130%] object-contain filter drop-shadow-sm opacity-80 mix-blend-multiply" style={{ imageRendering: 'pixelated' }} alt="" />
                                            </div>
                                        )}
                                     </div>
                                     <div className="bg-[#F2E3C6] rounded-[20px] rounded-tl-sm px-3.5 py-2 max-w-[85%] shadow-sm flex flex-col relative min-w-[150px]">
                                         <span className="font-bold text-[#5A52A5] text-[13px] mb-1">{m.sender}</span>
                                         <div className="flex flex-wrap items-end justify-between gap-2">
                                             <span className="text-[#1A2035] text-[14px] leading-snug flex-1">{m.text}</span>
                                             <span className="text-[#8B98B0] text-[11px] font-mono shrink-0 ml-auto pl-2 pt-1">{timeStr}</span>
                                         </div>
                                         {m.type === 'chess_invite' && m.inviteData && (
                                             <button onClick={() => {
                                                 if (m.sender === user.username) return; // Can't accept own invite
                                                 if ((user.lizCoins || 0) < m.inviteData!.bet) {
                                                     alert("No tienes suficientes Liz-Moneditas.");
                                                     return;
                                                 }
                                                 socket.emit('accept_chess_invite', m.inviteData, (res: any) => {
                                                     if (res.success) {
                                                         setActiveChessGame({ id: m.inviteData!.gameId, opponent: usersOnline.find(u => u.username === m.sender) || {username: m.sender}, bet: m.inviteData!.bet, isHost: false });
                                                     } else {
                                                         alert(res.error || "Error al aceptar el reto.");
                                                     }
                                                 });
                                             }} className="w-full mt-2 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:from-blue-500 hover:to-indigo-500 transition-colors flex items-center justify-center gap-2">
                                                 <Gamepad2 size={16} /> [Jugar]
                                             </button>
                                         )}
                                         {m.image && <div className="w-full mt-1.5"><img src={m.image} className="rounded-xl border border-black/10 max-w-full shadow-md h-28 object-cover" alt="adjunto"/></div>}
                                         {(m.type === 'audio' || m.audio) && <div className="w-full mt-1.5"><PremiumAudioPlayer src={m.audio} /></div>}
                                     </div>
                                 </div>
                             )}`;

if(code.includes(t1)) {
    code = code.replace(t1, r1);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Replaced chat rendering");
} else {
    console.log("Could not find chat rendering block");
}
