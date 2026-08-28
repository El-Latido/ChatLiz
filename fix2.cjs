const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldBlock = `                     {user?.username?.toUpperCase() === 'AXISS' && (
                         <button className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${activeChat === 'cloud_admin' ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'border-[#D4AF37]/30'} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm\`} onClick={() => { closeAllModals(); setIsSidebarOpen(false); setActiveChat('cloud_admin'); }}>
                            <Cloud size={16} strokeWidth={1.5} />
                            Panel Cloud
                         </button>
                         <button className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${activeChat === 'builder' ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'border-[#D4AF37]/30'} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm\`} onClick={() => { closeAllModals(); setIsSidebarOpen(false); setActiveChat('builder'); }}>
                            <Box size={16} strokeWidth={1.5} />
                            Creador 3D
                         </button>
                     </>)}`;

const newBlock = `                     {user?.username?.toUpperCase() === 'AXISS' && (
                         <>
                         <button className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${activeChat === 'cloud_admin' ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'border-[#D4AF37]/30'} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm\`} onClick={() => { closeAllModals(); setIsSidebarOpen(false); setActiveChat('cloud_admin'); }}>
                            <Cloud size={16} strokeWidth={1.5} />
                            Panel Cloud
                         </button>
                         <button className={\`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border \${activeChat === 'builder' ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'border-[#D4AF37]/30'} px-3 py-2 rounded-2xl hover:bg-white/5 hover:text-[#E8D9B0] transition-all text-sm font-medium shadow-sm\`} onClick={() => { closeAllModals(); setIsSidebarOpen(false); setActiveChat('builder'); }}>
                            <Box size={16} strokeWidth={1.5} />
                            Creador 3D
                         </button>
                         </>
                     )}`;

if (code.includes(oldBlock)) {
    code = code.replace(oldBlock, newBlock);
} else {
    console.log("OLD BLOCK NOT FOUND. TRYING REGEX.");
    code = code.replace(
        /\{user\?\.username\?\.toUpperCase\(\) === 'AXISS' && \([\s\S]*?Creador 3D\s*<\/button>\s*<\/>\)\}/m,
        newBlock
    );
}

fs.writeFileSync('src/App.tsx', code);
