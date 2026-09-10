const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    '<nav className="flex items-center justify-between px-4 py-3 shrink-0 z-[100] relative w-full">',
    '<nav className="flex items-center justify-between px-4 py-3 shrink-0 z-[100] relative w-full border-b border-white/5 bg-[#0B0B0C]/80 backdrop-blur-md">'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched nav");
