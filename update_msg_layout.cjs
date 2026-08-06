const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const t1 = `{isLiz ? (
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
                                         </div>`;

const r1 = `{isLiz ? (
                                 <div className="flex gap-2 w-full max-w-[98%] mt-1 group">
                                     <div className="shrink-0 pt-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
                                         <img src={avatarUrl} className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]/50" alt={m.sender} />
                                     </div>
                                     <div className="flex-1 flex flex-col border-l-[3px] border-[#D4AF37]/20 pl-2 ml-1">
                                         <div className="flex items-baseline flex-wrap gap-1.5 justify-between">
                                             <div className="flex items-baseline flex-wrap gap-1.5 flex-1">
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
                                             <span className="text-[#8B98B0] text-[11px] font-mono shrink-0 ml-auto pl-2 pt-1">{timeStr}</span>
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
                                     <div className="bg-[#F2E3C6] rounded-[20px] rounded-tl-sm px-3.5 py-1.5 max-w-[95%] shadow-sm flex flex-col relative min-w-[200px]">
                                         <div className="flex items-baseline flex-wrap gap-1.5 justify-between">
                                             <div className="flex items-baseline flex-wrap gap-1.5 flex-1">
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
                                             <span className="text-[#8B98B0] text-[11px] font-mono shrink-0 ml-auto pl-2 pt-1">{timeStr}</span>
                                         </div>`;

code = code.replace(t1, r1);

const t2 = `<div className="flex items-baseline flex-wrap gap-1.5">
                                                    <span className="text-gray-400 text-[10px] font-mono shrink-0">[{timeStr}]</span>
                                                    <span className="font-bold text-blue-600 text-[12px] shrink-0">{m.sender}:</span>
                                                    {!m.image && !m.audio && (
                                                       <span className="text-gray-700 text-sm font-medium leading-snug ml-0.5">{m.text}</span>
                                                    )}
                                                </div>`;

const r2 = `<div className="flex items-baseline flex-wrap gap-1.5 justify-between">
                                                    <div className="flex items-baseline flex-wrap gap-1.5 flex-1">
                                                        <span className="font-bold text-blue-600 text-[12px] shrink-0">{m.sender}:</span>
                                                        {!m.image && !m.audio && (
                                                           <span className="text-gray-700 text-sm font-medium leading-snug ml-0.5">{m.text}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-gray-400 text-[10px] font-mono shrink-0 ml-auto pl-2">{timeStr}</span>
                                                </div>`;

code = code.replace(t2, r2);

const t3 = `<div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                                    <span className="text-gray-400 text-[11px] font-mono shrink-0">[{m.time}]</span>
                                                    <span className="text-purple-600 font-bold text-[13px]">{m.sender}:</span>
                                                    {!m.image && !m.audio && (
                                                       <span className="text-gray-700 text-sm font-medium leading-snug ml-1">{m.text}</span>
                                                    )}
                                                </div>`;

const r3 = `<div className="flex items-baseline gap-1.5 mb-0.5 flex-wrap justify-between">
                                                    <div className="flex items-baseline gap-1.5 flex-1 flex-wrap">
                                                        <span className="text-purple-600 font-bold text-[13px]">{m.sender}:</span>
                                                        {!m.image && !m.audio && (
                                                           <span className="text-gray-700 text-sm font-medium leading-snug ml-1">{m.text}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-gray-400 text-[11px] font-mono shrink-0 ml-auto pl-2">{m.time}</span>
                                                </div>`;

code = code.replace(t3, r3);

fs.writeFileSync('src/App.tsx', code);
console.log("Success");
