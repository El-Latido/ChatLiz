const fs = require('fs');
let code = fs.readFileSync('src/components/AdminConfigLizModal.tsx', 'utf8');

const targetRegex = /<\/form>\n           <\/div>\n           <p className="text-sm text-gray-400 leading-relaxed mb-4">/;

const newContent = `</form>
           </div>
           
           <div className="bg-[#1a1b26] p-4 rounded-xl border border-red-500/20 mb-6">
              <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">Control de Emergencia</h3>
              <button 
                 onClick={() => {
                     socket.emit('admin_cut_transmission');
                     setSuccessMsg('Transmisión de DJ cortada exitosamente.');
                 }}
                 className="w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold py-2 rounded-lg text-sm transition-colors border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                 Cortar Transmisión DJ Activa
              </button>
           </div>

           <p className="text-sm text-gray-400 leading-relaxed mb-4">`;
           
code = code.replace(targetRegex, newContent);
fs.writeFileSync('src/components/AdminConfigLizModal.tsx', code);
