const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileConfigModal.tsx', 'utf8');

// We need to add state variables for the new fields
// 1. Find state declarations
const stateMatch = /const \[bubbleTexture, setBubbleTexture\] = useState\(user\.bubbleTexture \|\| "none"\);/;
if (stateMatch.test(code)) {
    code = code.replace(stateMatch, `const [bubbleTexture, setBubbleTexture] = useState(user.bubbleTexture || "none");
  const [nameColor, setNameColor] = useState(user.nameColor || "#FFFFFF");
  const [nameNeon, setNameNeon] = useState(user.nameNeon || ""); // If empty, no neon. If "rainbow", rainbow neon.
  const [nameFont, setNameFont] = useState(user.nameFont || "font-sans");
  const [chatFont, setChatFont] = useState(user.chatFont || "font-sans");
  const [bgImage, setBgImage] = useState(user.bgImage || "");`);
}

// 2. Update save object
const saveMatch = /bubbleTexture,\s*is_friends_public:\s*isFriendsPublic,\s*incognito\s*}/;
if (saveMatch.test(code)) {
    code = code.replace(saveMatch, `bubbleTexture,
        nameColor,
        nameNeon,
        nameFont,
        chatFont,
        bgImage,
        is_friends_public: isFriendsPublic,
        incognito
      }`);
}

// 3. Replace the Apariencia Tab content with extended options
const aparienciaTabRegex = /\{activeTab === 'apariencia' && \([\s\S]*?\}\)[\s]*\{activeTab === 'cuenta'/;
const newApariencia = `{activeTab === 'apariencia' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* 1. Fondo de Pantalla Global */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-sm font-bold text-white mb-2">Fondo de Pantalla del Chat</h4>
                  <div>
                      <input
                          type="text"
                          value={bgImage}
                          placeholder="https://ejemplo.com/fondo.jpg"
                          onChange={(e) => setBgImage(e.target.value)}
                          className="w-full bg-black/30 p-3 rounded-xl border border-white/10 focus:border-cyan-400 outline-none text-white transition-colors text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-2">Pega la URL de una imagen. Se guardará en tu perfil y la verás en el fondo del chat en todos tus dispositivos.</p>
                  </div>
                </div>

                {/* 2. Personalización del Nombre */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-sm font-bold text-white mb-2">Estilo de tu Nombre</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400">Fuente del Nombre</label>
                        <select
                          value={nameFont}
                          onChange={e => setNameFont(e.target.value)}
                          className="w-full bg-black/30 p-3 rounded-xl border border-white/10 outline-none text-sm text-white"
                        >
                            <option value="font-sans">Clásica (Sans)</option>
                            <option value="font-serif">Elegante (Serif)</option>
                            <option value="font-mono">Robótica (Mono)</option>
                            <option value="font-['Courier_New']">Máquina de escribir</option>
                            <option value="font-['Impact']">Impacto (Gruesa)</option>
                            <option value="font-['Comic_Sans_MS']">Divertida (Comic)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                         <label className="text-xs font-semibold text-gray-400">Color Principal</label>
                         <div className="flex gap-2">
                           <input
                             type="color"
                             value={nameColor}
                             onChange={e => setNameColor(e.target.value)}
                             className="h-10 w-full bg-transparent border-0 rounded cursor-pointer"
                           />
                         </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-semibold text-gray-400">Efecto Neón del Nombre</label>
                        <select
                          value={nameNeon}
                          onChange={e => setNameNeon(e.target.value)}
                          className="w-full bg-black/30 p-3 rounded-xl border border-white/10 outline-none text-sm text-white"
                        >
                            <option value="">Sin Neón</option>
                            <option value="cyan">Neón Cyan</option>
                            <option value="fuchsia">Neón Fucsia</option>
                            <option value="green">Neón Verde</option>
                            <option value="yellow">Neón Amarillo</option>
                            <option value="red">Neón Rojo</option>
                            <option value="rainbow">🌈 Arcoiris Animado (Épico)</option>
                        </select>
                      </div>
                  </div>
                  
                  {/* Vista Previa Nombre */}
                  <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center">
                      <span className={\`text-lg font-bold \${nameFont} \${nameNeon === 'rainbow' ? 'animate-rainbow-text' : ''}\`}
                            style={{
                                color: nameNeon === 'rainbow' ? 'transparent' : nameColor,
                                backgroundClip: nameNeon === 'rainbow' ? 'text' : 'initial',
                                backgroundImage: nameNeon === 'rainbow' ? 'linear-gradient(to right, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #800080)' : 'none',
                                textShadow: nameNeon && nameNeon !== 'rainbow' ? \`0 0 10px \${nameNeon}, 0 0 20px \${nameNeon}\` : 'none'
                            }}>
                         {user.username} (Vista Previa)
                      </span>
                  </div>
                </div>

                {/* 3. Personalización del Chat y Burbujas */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-sm font-bold text-white mb-2">Tipografía del Chat</h4>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400">Fuente de tus mensajes</label>
                    <select
                      value={chatFont}
                      onChange={e => setChatFont(e.target.value)}
                      className="w-full bg-black/30 p-3 rounded-xl border border-white/10 outline-none text-sm text-white"
                    >
                        <option value="font-sans">Clásica (Legible)</option>
                        <option value="font-serif">Serif (Libro)</option>
                        <option value="font-mono">Terminal (Código)</option>
                        <option value="font-['Verdana']">Verdana (Ancha)</option>
                        <option value="font-['Trebuchet_MS']">Moderna (Trebuchet)</option>
                    </select>
                  </div>
                  
                  <div className="w-full h-[1px] bg-white/10 my-4"></div>
                  
                  <h4 className="text-sm font-bold text-white mb-2">Diseño de tus Burbujas (¡Miles de combinaciones!)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400">Color Base</label>
                        <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/10">
                           <input
                             type="color"
                             value={bubbleColor.startsWith('rgba') || bubbleColor.startsWith('#') || bubbleColor.startsWith('transparent') ? (bubbleColor.length === 7 ? bubbleColor : '#3b82f6') : '#3b82f6'}
                             onChange={e => {
                                // Convert hex to rgba for slight transparency or keep solid
                                setBubbleColor(e.target.value);
                             }}
                             className="h-8 w-12 bg-transparent border-0 rounded cursor-pointer"
                            />
                           <span className="text-xs text-gray-300 font-mono overflow-hidden text-ellipsis">{bubbleColor}</span>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400">Efecto / Textura Wow</label>
                        <select
                           value={bubbleTexture}
                           onChange={e => setBubbleTexture(e.target.value)}
                           className="w-full bg-black/30 p-3 rounded-xl border border-white/10 outline-none text-sm text-white"
                        >
                            <option value="none">Plano (Liso)</option>
                            <option value="glass">Cristal / Glassmorphism</option>
                            <option value="glow">Resplandor Neón Intenso</option>
                            <option value="cyberpunk">Cyberpunk Glitch</option>
                            <option value="matrix">Matrix Digital (Verde)</option>
                            <option value="holo">Holograma Brillante</option>
                            <option value="pixel">Pixel Art (Retro 8-bit)</option>
                            <option value="kawaii">Kawaii Pastel (Rosa/Burbujas)</option>
                            <option value="fire">Fuego Infernal</option>
                            <option value="ice">Hielo Congelado</option>
                            <option value="gold">Oro Lujoso (VIP)</option>
                            <option value="rainbow">Arcoiris Flotante</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400">Borde Especial</label>
                        <select
                           value={bubbleBorder}
                           onChange={e => setBubbleBorder(e.target.value)}
                           className="w-full bg-black/30 p-3 rounded-xl border border-white/10 outline-none text-sm text-white"
                        >
                            <option value="border-transparent">Sin Borde</option>
                            <option value="border-white/20">Sutil Claro</option>
                            <option value="border-cyan-500 shadow-[0_0_10px_#06b6d4]">Cyan Neón Radiante</option>
                            <option value="border-fuchsia-500 shadow-[0_0_10px_#d946ef]">Fucsia Neón Radiante</option>
                            <option value="border-yellow-400 shadow-[0_0_10px_#facc15]">Oro Radiante</option>
                            <option value="border-red-500 shadow-[0_0_10px_#ef4444]">Rojo Peligro</option>
                            <option value="border-[3px] border-dashed border-white/50">Línea Punteada</option>
                            <option value="border-l-[4px] border-l-blue-500">Cita (Barra lateral)</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400">Forma de la Burbuja</label>
                        <select
                           value={bubbleShape}
                           onChange={e => setBubbleShape(e.target.value)}
                           className="w-full bg-black/30 p-3 rounded-xl border border-white/10 outline-none text-sm text-white"
                        >
                            <option value="rounded-2xl rounded-tr-sm">Clásica de Chat</option>
                            <option value="rounded-3xl">Píldora Máxima</option>
                            <option value="rounded-md">Caja Cuadrada (Discord)</option>
                            <option value="rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm">Hoja Asimétrica</option>
                            <option value="rounded-none border-b-2">Subrayado (Sin caja)</option>
                            <option value="rounded-lg skew-x-[-5deg]">Inclinada (Dinámica)</option>
                            <option value="rounded-full shadow-[0_4px_0_rgba(0,0,0,0.5)]">Estilo Botón 3D</option>
                        </select>
                     </div>
                  </div>
                  
                  {/* Vista Previa Burbuja */}
                  <div className="mt-4 p-6 bg-black/40 rounded-xl border border-white/5 flex flex-col items-end justify-center min-h-[120px] relative overflow-hidden"
                       style={{ backgroundImage: bgImage ? \`url(\${bgImage})\` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      <div className="absolute inset-0 bg-black/40"></div>
                      <div 
                         className={\`relative px-4 py-2 text-white \${chatFont} \${bubbleShape} border \${bubbleBorder}\`}
                         style={{
                             backgroundColor: bubbleTexture === 'glass' ? 'rgba(255,255,255,0.1)' : 
                                              bubbleTexture === 'none' ? bubbleColor :
                                              bubbleTexture === 'glow' ? bubbleColor :
                                              bubbleTexture === 'cyberpunk' ? '#000000' :
                                              bubbleTexture === 'matrix' ? '#001a00' :
                                              bubbleTexture === 'holo' ? 'rgba(0, 255, 255, 0.2)' :
                                              bubbleTexture === 'pixel' ? '#0000ff' :
                                              bubbleTexture === 'kawaii' ? '#ffb6c1' :
                                              bubbleTexture === 'fire' ? '#ff4500' :
                                              bubbleTexture === 'ice' ? '#e0ffff' :
                                              bubbleTexture === 'gold' ? '#ffd700' :
                                              bubbleTexture === 'rainbow' ? 'transparent' : bubbleColor,
                             backdropFilter: bubbleTexture === 'glass' || bubbleTexture === 'holo' ? 'blur(10px)' : 'none',
                             boxShadow: bubbleTexture === 'glow' ? \`0 0 15px \${bubbleColor}, inset 0 0 10px \${bubbleColor}\` : 
                                        bubbleTexture === 'cyberpunk' ? '3px 3px 0 #00ffff, -3px -3px 0 #ff00ff' : 
                                        bubbleTexture === 'matrix' ? '0 0 10px #00ff00' : 'none',
                             color: bubbleTexture === 'kawaii' || bubbleTexture === 'ice' || bubbleTexture === 'gold' ? 'black' : 
                                    bubbleTexture === 'matrix' ? '#00ff00' : 'white',
                             backgroundImage: bubbleTexture === 'rainbow' ? 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)' : 'none',
                             fontFamily: bubbleTexture === 'pixel' ? '"Courier New", monospace' : undefined,
                             border: bubbleTexture === 'pixel' ? '4px solid black' : undefined
                         }}>
                         ¡Wow! Así se verá tu mensaje.
                      </div>
                  </div>
                </div>

              </div>
            )}
            {activeTab === 'cuenta'`;

code = code.replace(aparienciaTabRegex, newApariencia);
fs.writeFileSync('src/components/ProfileConfigModal.tsx', code);
console.log("Updated ProfileConfigModal.tsx");
