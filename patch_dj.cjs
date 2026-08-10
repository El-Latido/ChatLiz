const fs = require('fs');
let content = fs.readFileSync('src/components/DjControlPanelModal.tsx', 'utf8');

if (!content.includes('micActive')) {
    content = content.replace(/const \[isLive, setIsLive\] = useState\(false\);/, 
    "const [isLive, setIsLive] = useState(false);\n  const [micActive, setMicActive] = useState(false);\n  const [locutionText, setLocutionText] = useState('');");

    const newControls = `
          {isLive && (
              <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                      <h3 className="text-[#D4AF37] font-semibold text-sm flex items-center gap-2">
                          <Mic size={16} /> Fader Virtual (Ducking)
                      </h3>
                      <button 
                          onClick={() => {
                              const nextMic = !micActive;
                              setMicActive(nextMic);
                              socket.emit('dj_fader_update', { micActive: nextMic });
                          }}
                          className={\`px-4 py-2 rounded-lg font-bold text-sm transition-colors border \${micActive ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}\`}
                      >
                          {micActive ? 'MIC ON (Música Baja)' : 'MIC OFF (Música Normal)'}
                      </button>
                  </div>
                  <div>
                      <h3 className="text-[#D4AF37] font-semibold text-sm flex items-center gap-2 mb-2">
                          📝 Locución Automática al Chat
                      </h3>
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              value={locutionText}
                              onChange={e => setLocutionText(e.target.value)}
                              placeholder="Ej. ¡Seguimos con más música en vivo!"
                              className="flex-1 bg-[#1A2639] border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#D4AF37]"
                          />
                          <button
                              onClick={() => {
                                  if (locutionText.trim()) {
                                      socket.emit('send_global', { text: "🎙️ [Locución]: " + locutionText, isAi: false });
                                      setLocutionText('');
                                  }
                              }}
                              className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#E8D9B0] transition-colors"
                          >
                              Enviar
                          </button>
                      </div>
                  </div>
              </div>
          )}
    `;

    content = content.replace(/<div className="flex-1 flex flex-col min-h-\[300px\]">/, newControls + "\n          <div className=\"flex-1 flex flex-col min-h-[300px]\">");
    
    fs.writeFileSync('src/components/DjControlPanelModal.tsx', content);
}
