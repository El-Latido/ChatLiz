const fs = require('fs');
let file = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

const target = `<div className="song-history-container flex flex-col gap-2">
                      {songHistory.map((s:any, index:number) => (
                          <div key={index} className="flex flex-col bg-[#1A2639]/50 p-1.5 rounded opacity-80 hover:opacity-100 transition-opacity" style={{ marginBottom: '5px' }}>
                              <span className="text-[12px] font-medium text-gray-200 truncate">
                                  <strong className="text-[#D4AF37] mr-1">{index + 1}.</strong> {s?.title || 'Canción Desconocida'}
                              </span>
                              <span className="text-[10px] text-gray-400 truncate ml-4">
                                  {Array.isArray(s?.artists) ? s.artists.map((a:any) => a.name).join(', ') : (s?.requester ? \`Añadida por: \${s?.requester}\` : '')}
                              </span>
                          </div>
                      ))}
                  </div>`;
                  
const replacement = `<div className="radio-sidebar" style={{ height: '400px', overflowY: 'scroll', border: '1px solid #333', padding: '10px' }}>
                      <ol className="flex flex-col gap-2">
                      {songHistory.map((s:any, index:number) => (
                          <li key={index} className="flex flex-col bg-[#1A2639]/50 p-1.5 rounded opacity-80 hover:opacity-100 transition-opacity" style={{ marginBottom: '8px' }}>
                              <span className="text-[12px] font-medium text-gray-200 truncate">
                                  <strong className="text-[#D4AF37] mr-1">{index + 1}.</strong> {s?.title || 'Canción Desconocida'} - {Array.isArray(s?.artists) ? s.artists.map((a:any) => a.name).join(', ') : (s?.requester ? \`Añadida por: \${s?.requester}\` : 'Desconocido')}
                              </span>
                          </li>
                      ))}
                      </ol>
                  </div>`;
                  
file = file.replace(target, replacement);
fs.writeFileSync('src/components/InlineRadio.tsx', file);
