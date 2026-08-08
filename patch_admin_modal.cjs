const fs = require('fs');
let code = fs.readFileSync('src/components/AdminConfigLizModal.tsx', 'utf8');

const oldModalContent = `         <div className="space-y-4">
           <p className="text-sm text-gray-400 leading-relaxed mb-4">
             Como administrador (Axiss), puedes modificar el perfil de la IA.
           </p>`;

const newModalContent = `         <div className="space-y-4">
           <div className="bg-[#1a1b26] p-4 rounded-xl border border-white/5 mb-6">
              <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">Asignar Rol de DJ</h3>
              <form onSubmit={(e) => {
                 e.preventDefault();
                 const target = (e.target as any).djTarget.value;
                 const start = (e.target as any).djStart.value;
                 const end = (e.target as any).djEnd.value;
                 if (target && start && end) {
                    socket.emit('admin_set_dj_schedule', { targetUser: target, schedule: { start, end } });
                    (e.target as any).reset();
                 }
              }} className="flex flex-col gap-3">
                 <input name="djTarget" type="text" placeholder="Nombre de usuario" className="w-full bg-[#0a0a16] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-400" required />
                 <div className="flex gap-2">
                    <input name="djStart" type="time" className="flex-1 bg-[#0a0a16] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-400" required />
                    <span className="text-gray-500 self-center">-</span>
                    <input name="djEnd" type="time" className="flex-1 bg-[#0a0a16] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-400" required />
                 </div>
                 <button type="submit" className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 font-medium py-2 rounded-lg text-sm transition-colors border border-cyan-500/30">
                    Asignar DJ
                 </button>
              </form>
           </div>
           <p className="text-sm text-gray-400 leading-relaxed mb-4">
             Como administrador (Axiss), puedes modificar el perfil de la IA.
           </p>`;
           
code = code.replace(oldModalContent, newModalContent);
fs.writeFileSync('src/components/AdminConfigLizModal.tsx', code);
