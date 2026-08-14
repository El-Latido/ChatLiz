const fs = require('fs');
let file = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

// Update "Sonando Ahora" container
const targetSonando = `           ) : currentSong ? (
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">Sonando Ahora</span>
                  <div className="text-sm font-semibold text-white leading-tight break-words">{currentSong.title}</div>
                  <div className="text-xs text-[#D4AF37]/80 truncate">
                      {Array.isArray(currentSong?.artists) ? currentSong.artists.map((a:any) => a.name).join(', ') : ''}
                  </div>
                  {currentSong.sources && currentSong.sources.length > 0 && (
                      <div className="text-[10px] text-gray-400 mt-0.5 px-1.5 py-0.5 bg-white/5 rounded w-fit truncate max-w-full">
                          {currentSong.sources[0].name}
                      </div>
                  )}
               </div>`;

const replaceSonando = `           ) : currentSong ? (
               <div className="flex flex-col gap-0.5 mb-1 px-2 py-1.5 max-h-[70px]" style={{ fontSize: '0.85rem' }}>
                  <span className="text-[9px] text-pink-400 font-bold uppercase tracking-wider">Sonando Ahora</span>
                  <div className="text-xs font-semibold text-white leading-tight break-words truncate">{currentSong.title}</div>
                  <div className="text-[10px] text-[#D4AF37]/80 truncate">
                      {Array.isArray(currentSong?.artists) ? currentSong.artists.map((a:any) => a.name).join(', ') : ''}
                  </div>
               </div>`;
               
file = file.replace(targetSonando, replaceSonando);

// Update Song History container
const targetHistory = `<div className="radio-sidebar max-h-[220px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#D4AF37]/50 scrollbar-track-transparent pr-1 touch-pan-y">`;

// Using inline styles as requested by the user to guarantee compatibility
const replaceHistory = `<div className="radio-sidebar max-h-[220px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#D4AF37]/50 scrollbar-track-transparent pr-1" style={{ WebkitOverflowScrolling: 'touch', padding: '5px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>`;

file = file.replace(targetHistory, replaceHistory);

fs.writeFileSync('src/components/InlineRadio.tsx', file);
