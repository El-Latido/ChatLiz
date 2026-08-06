const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const t1 = `                                        return (
                                        <div key={idx} className="flex gap-2 w-full">
                                            <img src={avatarUrl} className="w-6 h-6 rounded-full border border-blue-200 shrink-0 bg-white" alt={m.sender} />
                                            <div className="bg-blue-50/50 p-2 rounded-2xl flex-1 relative flex flex-col -mt-1">
                                                <div className="flex items-baseline flex-wrap gap-1.5 justify-between">
                                                    <div className="flex items-baseline flex-wrap gap-1.5 flex-1">
                                                        <span className="font-bold text-blue-600 text-[12px] shrink-0">{m.sender}:</span>
                                                        {!m.image && !m.audio && (
                                                           <span className="text-gray-700 text-sm font-medium leading-snug ml-0.5">{m.text}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-gray-400 text-[10px] font-mono shrink-0 ml-auto pl-2">{timeStr}</span>
                                                </div>
                                                {m.image && (
                                                    <img src={m.image} className="h-20 rounded-lg mt-1 object-cover" alt="Adjunto" />
                                                )}
                                                {m.audio && (
                                                    <div className="mt-1"><PremiumAudioPlayer src={m.audio} /></div>
                                                )}
                                            </div>
                                        </div>
                                        );`;

const r1 = `                                        return (
                                        <div key={idx} className="flex gap-2 w-full mt-1.5">
                                            <div className="relative shrink-0 mt-1">
                                                <img src={avatarUrl} className="w-7 h-7 rounded-full border border-blue-200 object-cover bg-white" alt={m.sender} />
                                            </div>
                                            <div className="bg-blue-50/50 rounded-[18px] rounded-tl-sm px-3 py-2 max-w-[85%] shadow-sm flex flex-col relative flex-1 min-w-[150px]">
                                                <span className="font-bold text-blue-600 text-[12px] mb-1">{m.sender}</span>
                                                <div className="flex flex-wrap items-end justify-between gap-2">
                                                    <span className="text-gray-700 text-[13px] leading-snug flex-1">{m.text}</span>
                                                    <span className="text-gray-400 text-[10px] font-mono shrink-0 ml-auto pl-2 pt-1">{timeStr}</span>
                                                </div>
                                                {m.image && <div className="w-full mt-1.5"><img src={m.image} className="rounded-xl border border-black/5 max-w-full shadow-md h-20 object-cover" alt="adjunto"/></div>}
                                                {(m.type === 'audio' || m.audio) && <div className="w-full mt-1.5"><PremiumAudioPlayer src={m.audio} /></div>}
                                            </div>
                                        </div>
                                        );`;

if(code.includes(t1)) {
    code = code.replace(t1, r1);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Replaced tutifrutti chat rendering");
} else {
    console.log("Could not find tutifrutti chat rendering block");
}
