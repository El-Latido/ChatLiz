const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "{user?.username?.toUpperCase() === 'AXISS' && (\n                         <button className={`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border ${activeChat === 'cloud_admin'",
  "{user?.username?.toUpperCase() === 'AXISS' && (<>\n                         <button className={`flex items-center justify-center gap-2 text-[#D4AF37] bg-[#121B2A]/80 border ${activeChat === 'cloud_admin'"
);

code = code.replace(
  "                            Creador 3D\n                         </button>\n                     )}",
  "                            Creador 3D\n                         </button>\n                     </>)}"
);

fs.writeFileSync('src/App.tsx', code);
