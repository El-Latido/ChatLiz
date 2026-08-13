const fs = require('fs');
let file = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

const historyCodeOld = `<span className="text-[10px] text-[#D4AF37]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><ListMusic size={12}/> ESCUCHADAS (Últimas 30)</span>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {songHistory.map((s:any, idx:number) => (
                          <div key={idx} className="flex flex-col bg-[#1A2639]/50 p-1.5 rounded opacity-80 hover:opacity-100 transition-opacity">
                              <span className="text-[12px] font-medium text-gray-200 truncate">{s.title || 'Canción Desconocida'}</span>
                              <span className="text-[10px] text-gray-400 truncate">{s.artists ? s.artists.map((a:any) => a.name).join(", ") : (s.requester ? \`Añadida por: \${s.requester}\` : '')}</span>
                          </div>
                      ))}
                  </div>`;

const historyCodeNew = `<span className="text-[10px] text-[#D4AF37]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><ListMusic size={12}/> ESCUCHADAS (Últimas 30)</span>
                  <div className="song-history-container flex flex-col gap-2">
                      {songHistory.map((s:any, index:number) => (
                          <div key={index} className="flex flex-col bg-[#1A2639]/50 p-1.5 rounded opacity-80 hover:opacity-100 transition-opacity" style={{ marginBottom: '5px' }}>
                              <span className="text-[12px] font-medium text-gray-200 truncate">
                                  <strong className="text-[#D4AF37] mr-1">{index + 1}.</strong> {s.title || 'Canción Desconocida'}
                              </span>
                              <span className="text-[10px] text-gray-400 truncate ml-4">
                                  {s.artists ? s.artists.map((a:any) => a.name).join(", ") : (s.requester ? \`Añadida por: \${s.requester}\` : '')}
                              </span>
                          </div>
                      ))}
                  </div>`;

file = file.replace(historyCodeOld, historyCodeNew);

fs.writeFileSync('src/components/InlineRadio.tsx', file);
