const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const t4 = `{messages.slice(-15).map((m: any, idx) => (
                                        <div key={idx} className="bg-blue-50/50 p-2 rounded-2xl">
                                            <span className="font-bold text-blue-600 text-xs mr-2">{m.sender}:</span>
                                            {m.image ? (
                                                <img src={m.image} className="h-20 rounded-lg mt-1" alt="Adjunto" />
                                            ) : m.audio ? (
                                                <div className="mt-1"><PremiumAudioPlayer src={m.audio} /></div>
                                            ) : (
                                                <span className="text-gray-700 text-sm font-medium">{m.text}</span>
                                            )}
                                        </div>
                                    ))}`;

const r4 = `{messages.slice(-15).map((m: any, idx) => {
                                        const senderInfo = usersOnline.find(u => u.username === m.sender) || userCache[m.sender];
                                        const avatarUrl = senderInfo?.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${m.sender}\`;
                                        const date = m.createdAt?.toDate ? m.createdAt.toDate() : new Date();
                                        const timeStr = isNaN(date.getTime()) ? '10:00' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        return (
                                        <div key={idx} className="flex gap-2 w-full">
                                            <img src={avatarUrl} className="w-6 h-6 rounded-full border border-blue-200 shrink-0 bg-white" alt={m.sender} />
                                            <div className="bg-blue-50/50 p-2 rounded-2xl flex-1 relative flex flex-col -mt-1">
                                                <div className="flex items-baseline flex-wrap gap-1.5">
                                                    <span className="text-gray-400 text-[10px] font-mono shrink-0">[{timeStr}]</span>
                                                    <span className="font-bold text-blue-600 text-[12px] shrink-0">{m.sender}:</span>
                                                    {!m.image && !m.audio && (
                                                       <span className="text-gray-700 text-sm font-medium leading-snug ml-0.5">{m.text}</span>
                                                    )}
                                                </div>
                                                {m.image && (
                                                    <img src={m.image} className="h-20 rounded-lg mt-1 object-cover" alt="Adjunto" />
                                                )}
                                                {m.audio && (
                                                    <div className="mt-1"><PremiumAudioPlayer src={m.audio} /></div>
                                                )}
                                            </div>
                                        </div>
                                        );
                                    })}`;

if(code.includes(t4)) {
    code = code.replace(t4, r4);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Success");
} else {
    console.log("t4 not found, wait...");
}
