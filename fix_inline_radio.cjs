const fs = require('fs');
let file = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

file = file.replace('title="Otakus Dream Radio"', 'title="Radio Global"');

file = file.replace(
  `{currentLiveDJ ? \`Live: DJ \${currentLiveDJ}\` : 'Al Aire'}`,
  `{currentLiveDJ ? \`Live: DJ \${currentLiveDJ}\` : 'SONANDO AHORA'}`
);

const historyCodeOld = `<span className="text-[10px] text-[#D4AF37]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><ListMusic size={12}/> Escuchadas</span>
                  <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                      {songHistory.map((s:any, idx:number) => (
                          <div key={idx} className="flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                              <span className="text-[12px] font-medium text-gray-200 truncate">{s.title || 'Canción Desconocida'}</span>
                              <span className="text-[10px] text-gray-400 truncate">{s.artists ? s.artists.map((a:any) => a.name).join(", ") : (s.requester ? \`Añadida por: \${s.requester}\` : '')}</span>
                          </div>
                      ))}
                  </div>`;

const historyCodeNew = `<span className="text-[10px] text-[#D4AF37]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><ListMusic size={12}/> ESCUCHADAS (Últimas 30)</span>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {songHistory.map((s:any, idx:number) => (
                          <div key={idx} className="flex flex-col bg-[#1A2639]/50 p-1.5 rounded opacity-80 hover:opacity-100 transition-opacity">
                              <span className="text-[12px] font-medium text-gray-200 truncate">{s.title || 'Canción Desconocida'}</span>
                              <span className="text-[10px] text-gray-400 truncate">{s.artists ? s.artists.map((a:any) => a.name).join(", ") : (s.requester ? \`Añadida por: \${s.requester}\` : '')}</span>
                          </div>
                      ))}
                  </div>`;

file = file.replace(historyCodeOld, historyCodeNew);

const nowPlayingOld = `<h3 className="text-[#E8D9B0] font-bold text-sm flex items-center gap-1.5">
                 <Radio size={14} className="text-pink-400" />
                 {currentLiveDJ ? \`Live: DJ \${currentLiveDJ}\` : 'SONANDO AHORA'}
              </h3>
              <button onClick={() => setShowHistory(false)} className="text-[#D4AF37]/50 hover:text-[#D4AF37]"><ChevronDown size={16}/></button>
           </div>`;

const nowPlayingNew = `<h3 className="text-[#E8D9B0] font-bold text-sm flex items-center gap-1.5">
                 <Radio size={14} className="text-pink-400" />
                 {currentLiveDJ ? \`Live: DJ \${currentLiveDJ}\` : 'SONANDO AHORA'}
              </h3>
              <button onClick={() => setShowHistory(false)} className="text-[#D4AF37]/50 hover:text-[#D4AF37]"><ChevronDown size={16}/></button>
           </div>
           
           {!currentLiveDJ && (currentRequestedSong || currentSong) && (
               <div className="flex flex-col mb-1 pb-2 border-b border-[#D4AF37]/20">
                   <span className="text-[12px] font-bold text-white truncate text-center w-full">
                       {currentRequestedSong ? currentRequestedSong.title : (currentSong?.title || 'Cargando...')}
                   </span>
               </div>
           )}`;

file = file.replace(nowPlayingOld, nowPlayingNew);

fs.writeFileSync('src/components/InlineRadio.tsx', file);
