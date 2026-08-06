const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const t1 = `const decId = senderInfo?.activeDecoration;
                     const decUrl = decId ? DECORATIONS.find(d => d.id === decId)?.url : null;
                     return (`;
const r1 = `const decId = senderInfo?.activeDecoration;
                     const decUrl = decId ? DECORATIONS.find(d => d.id === decId)?.url : null;
                     const avatarUrl = senderInfo?.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${m.sender}\`;
                     return (`;

code = code.replace(t1, r1);

const t2 = `{isLiz ? (
                                 <div className="pl-2.5 py-0.5 flex flex-col max-w-[98%] border-l-[3px] border-[#D4AF37]/20 ml-1">
                                     <div className="flex items-baseline flex-wrap">
                                         <span className="text-[#8B98B0] mr-1.5 text-[13px] font-mono">[{timeStr}]</span>
                                         <div className="flex items-center relative mr-1.5 shrink-0">
                                            {decUrl && (
                                                <div className="absolute -inset-2 pointer-events-none z-10 flex items-center justify-center">
                                                    <img src={decUrl} className="w-full h-full object-contain filter drop-shadow-sm" style={{ imageRendering: 'pixelated' }} alt="" />
                                                </div>
                                            )}
                                            <span className="font-bold text-[#D4AF37] text-[14px] relative z-20">ELIZABETH {m.isAi && '(IA Administradora Gemini ✨)'}:</span>
                                         </div>
                                         <span className="text-[#E8D9B0] text-[14px] leading-snug ml-1">{m.text}</span>
                                     </div>
                                     {m.image && <div className="mt-1"><img src={m.image} className="rounded-xl border border-white/10 max-w-full shadow-md h-28 object-cover" alt="adjunto"/></div>}
                                     {(m.type === 'audio' || m.audio) && <div className="mt-1"><PremiumAudioPlayer src={m.audio} /></div>}
                                 </div>
                             ) : (
                                 <div className="bg-[#F2E3C6] rounded-[20px] px-3.5 py-1 max-w-[95%] shadow-sm flex items-baseline flex-wrap">
                                     <span className="text-[#6B7280] mr-1.5 text-[13px] font-mono">[{timeStr}]</span>
                                     <div className="flex items-center relative mr-1.5 shrink-0">
                                        {decUrl && (
                                            <div className="absolute -inset-3 pointer-events-none z-10 flex items-center justify-center">
                                                <img src={decUrl} className="w-[120%] h-[120%] object-contain filter drop-shadow-sm opacity-80 mix-blend-multiply" style={{ imageRendering: 'pixelated' }} alt="" />
                                            </div>
                                        )}
                                        <span className="font-bold text-[#5A52A5] text-[14px] relative z-20 px-1">{m.sender}:</span>
                                     </div>
                                     <span className="text-[#1A2035] text-[14px] leading-snug ml-1">{m.text}</span>
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
                                     {m.image && <div className="w-full mt-1"><img src={m.image} className="rounded-xl border border-black/10 max-w-full shadow-md h-28 object-cover" alt="adjunto"/></div>}
                                     {(m.type === 'audio' || m.audio) && <div className="w-full mt-1"><PremiumAudioPlayer src={m.audio} /></div>}
                                 </div>
                             )}`;

const r2 = `{isLiz ? (
                                 <div className="flex gap-2 w-full max-w-[98%] mt-1 group">
                                     <div className="shrink-0 pt-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
                                         <img src={avatarUrl} className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]/50" alt={m.sender} />
                                     </div>
                                     <div className="flex-1 flex flex-col border-l-[3px] border-[#D4AF37]/20 pl-2 ml-1">
                                         <div className="flex items-baseline flex-wrap gap-1.5">
                                             <span className="text-[#8B98B0] text-[12px] font-mono shrink-0">[{timeStr}]</span>
                                             <div className="flex items-center relative shrink-0">
                                                {decUrl && (
                                                    <div className="absolute -inset-2 pointer-events-none z-10 flex items-center justify-center">
                                                        <img src={decUrl} className="w-full h-full object-contain filter drop-shadow-sm" style={{ imageRendering: 'pixelated' }} alt="" />
                                                    </div>
                                                )}
                                                <span className="font-bold text-[#D4AF37] text-[14px] relative z-20">ELIZABETH {m.isAi && '(IA Administradora Gemini ✨)'}:</span>
                                             </div>
                                             <span className="text-[#E8D9B0] text-[14px] leading-snug">{m.text}</span>
                                         </div>
                                         {m.image && <div className="mt-1"><img src={m.image} className="rounded-xl border border-white/10 max-w-full shadow-md h-28 object-cover" alt="adjunto"/></div>}
                                         {(m.type === 'audio' || m.audio) && <div className="mt-1"><PremiumAudioPlayer src={m.audio} /></div>}
                                     </div>
                                 </div>
                             ) : (
                                 <div className="flex gap-2.5 w-full mt-1.5 group">
                                     <div className="shrink-0 pt-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                         <img src={avatarUrl} className="w-8 h-8 rounded-full object-cover border border-[#5A52A5]/30 shadow-sm bg-white/5" alt={m.sender} />
                                     </div>
                                     <div className="bg-[#F2E3C6] rounded-[20px] rounded-tl-sm px-3.5 py-1.5 max-w-[95%] shadow-sm flex flex-col relative">
                                         <div className="flex items-baseline flex-wrap gap-1.5">
                                             <span className="text-[#6B7280] text-[12px] font-mono shrink-0">[{timeStr}]</span>
                                             <div className="flex items-center relative shrink-0">
                                                {decUrl && (
                                                    <div className="absolute -inset-3 pointer-events-none z-10 flex items-center justify-center">
                                                        <img src={decUrl} className="w-[120%] h-[120%] object-contain filter drop-shadow-sm opacity-80 mix-blend-multiply" style={{ imageRendering: 'pixelated' }} alt="" />
                                                    </div>
                                                )}
                                                <span className="font-bold text-[#5A52A5] text-[14px] relative z-20 px-1">{m.sender}:</span>
                                             </div>
                                             <span className="text-[#1A2035] text-[14px] leading-snug">{m.text}</span>
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

if(code.includes(t2)) {
    code = code.replace(t2, r2);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Success");
} else {
    console.log("t2 not found, wait...");
}
