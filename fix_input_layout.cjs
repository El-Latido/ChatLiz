const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const t1 = `                      <div className="flex-1 bg-[#121B2A]/60 border border-[#D4AF37]/50 rounded-[24px] flex items-center relative shadow-[0_0_15px_rgba(212,175,55,0.05)] focus-within:border-[#D4AF37] focus-within:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all overflow-hidden h-[46px]">
                          {isRecording ? (
                              <div className="w-full h-full"><PremiumAudioVisualizer stream={recordingStream} /></div>
                          ) : (
                              <div className="flex-1 min-w-0 flex items-center pl-3 pr-2 h-full">
                                  <input 
                                     value={inputValue}
                                     onChange={handleInputChange}
                                     onKeyDown={e => {
                                        if (e.key === 'Enter') handleSendMessage();
                                     }}
                                     className="flex-1 min-w-0 bg-transparent outline-none text-[#E8D9B0] placeholder-[#D4AF37]/60 text-[14px]" 
                                     placeholder="Escribe tu mensaje... @Elizabeth"
                                  />
                                  <div className="flex items-center gap-0.5 text-[#D4AF37]/80 shrink-0 ml-1">
                                      <div className="relative">
                                          <button onClick={() => setIsGamesMenuOpen(true)} className="flex items-center justify-center hover:text-[#D4AF37] p-1.5 transition-colors" title="Juegos"><Gamepad2 size={18} strokeWidth={1.5} /></button>
                                      </div>
                                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex items-center justify-center hover:text-[#D4AF37] p-1.5 transition-colors"><Smile size={18} strokeWidth={1.5} /></button>
                                      <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center hover:text-[#D4AF37] p-1.5 transition-colors"><Paperclip size={18} strokeWidth={1.5} /></button>
                                  </div>
                              </div>
                          )}
                      </div>`;

const r1 = `                      <div className="flex-1 bg-[#121B2A]/60 border border-[#D4AF37]/50 rounded-[24px] flex items-center px-3 relative shadow-[0_0_15px_rgba(212,175,55,0.05)] focus-within:border-[#D4AF37] focus-within:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all overflow-hidden h-[46px]">
                          {isRecording ? (
                              <div className="w-full h-full"><PremiumAudioVisualizer stream={recordingStream} /></div>
                          ) : (
                              <>
                                  <input 
                                     value={inputValue}
                                     onChange={handleInputChange}
                                     onKeyDown={e => {
                                        if (e.key === 'Enter') handleSendMessage();
                                     }}
                                     className="flex-1 min-w-0 py-2 h-full bg-transparent outline-none text-[#E8D9B0] placeholder-[#D4AF37]/60 text-[14px]" 
                                     placeholder="Escribe tu mensaje... @Elizabeth"
                                  />
                                  <div className="flex items-center gap-0.5 text-[#D4AF37]/80 shrink-0 ml-1">
                                      <div className="relative flex items-center justify-center">
                                          <button onClick={() => setIsGamesMenuOpen(true)} className="flex items-center justify-center hover:text-[#D4AF37] p-1 transition-colors" title="Juegos"><Gamepad2 size={18} strokeWidth={1.5} /></button>
                                      </div>
                                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex items-center justify-center hover:text-[#D4AF37] p-1 transition-colors"><Smile size={18} strokeWidth={1.5} /></button>
                                      <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center hover:text-[#D4AF37] p-1 transition-colors"><Paperclip size={18} strokeWidth={1.5} /></button>
                                  </div>
                              </>
                          )}
                      </div>`;

if(code.includes(t1)) {
    code = code.replace(t1, r1);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Replaced global input layout");
} else {
    console.log("Could not find global input layout");
}
