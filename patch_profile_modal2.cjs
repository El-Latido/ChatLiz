const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

const targetUI = `                {/* Bubble Settings */}`;

const newUI = `                {/* Name & Chat Settings */}
                <hr className="border-white/5" />
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                    <User size={16} className="text-pink-400" />
                    Personalizar Nombre y Chat
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400">Color de Nombre</label>
                        <input type="color" value={nameColor} onChange={(e) => setNameColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400">Fuente de Nombre</label>
                        <select value={nameFont} onChange={(e) => setNameFont(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                           <option value="default">Por Defecto</option>
                           <option value="Playfair Display, serif">Elegante (Playfair)</option>
                           <option value="Orbitron, sans-serif">Cyberpunk (Orbitron)</option>
                           <option value="Press Start 2P, cursive">Arcade (Pixel)</option>
                           <option value="Pacifico, cursive">Cursiva (Pacifico)</option>
                        </select>
                     </div>
                     
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400">Fuente de Chat</label>
                        <select value={chatFont} onChange={(e) => setChatFont(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                           <option value="default">Por Defecto</option>
                           <option value="Playfair Display, serif">Elegante (Playfair)</option>
                           <option value="Courier New, monospace">Máquina de escribir</option>
                           <option value="Comic Sans MS, cursive">Divertida (Comic Sans)</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400">Color de Texto (Chat)</label>
                        <select value={chatColorStyle} onChange={(e) => setChatColorStyle(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                           <option value="default">Por Defecto (Blanco)</option>
                           <option value="colorful">Colorido (Se adapta al nombre)</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-white/5">
                     <label className="text-sm font-semibold text-white flex items-center justify-between">
                       <span>Efecto Neón en Nombre</span>
                       <input type="checkbox" checked={nameNeon !== 'none'} onChange={(e) => setNameNeon(e.target.checked ? 'color1' : 'none')} className="rounded bg-black/50 border-white/20 text-pink-500 focus:ring-pink-500" />
                     </label>
                     
                     {nameNeon !== 'none' && (
                       <div className="space-y-3 pt-2">
                          <label className="flex items-center gap-2 text-xs text-gray-300">
                             <input type="checkbox" checked={nameRainbow} onChange={(e) => setNameRainbow(e.target.checked)} className="rounded bg-black/50 border-white/20 text-cyan-500 focus:ring-cyan-500" />
                             Activar Mezcla de Neón Arcoiris
                          </label>
                          <div className="flex gap-4">
                             <div className="flex-1 space-y-1">
                               <label className="text-xs text-gray-500">{nameRainbow ? 'Color Inicio' : 'Color Neón'}</label>
                               <input type="color" value={nameNeonColor1} onChange={(e) => setNameNeonColor1(e.target.value)} className="w-full h-8 rounded border-0 bg-transparent cursor-pointer" />
                             </div>
                             {nameRainbow && (
                               <div className="flex-1 space-y-1">
                                 <label className="text-xs text-gray-500">Color Fin</label>
                                 <input type="color" value={nameNeonColor2} onChange={(e) => setNameNeonColor2(e.target.value)} className="w-full h-8 rounded border-0 bg-transparent cursor-pointer" />
                               </div>
                             )}
                          </div>
                       </div>
                     )}
                  </div>
                </div>

                {/* Bubble Settings */}`;

code = code.replace(targetUI, newUI);

fs.writeFileSync('src/components/ProfileConfigModal.tsx', code);
console.log("Patched ProfileConfigModal UI");
