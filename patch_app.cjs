const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("import { Builder3D } from './components/Builder3D';\n", "");

// Find and remove the Builder3D activeChat check
const builderRegex = /if\s*\(activeChat\s*===\s*'builder'\)\s*\{\s*return\s*\(\s*<div[^>]*>\s*<Builder3D[^>]*\/>\s*<\/div>\s*\);\s*\}/g;
code = code.replace(builderRegex, "");

// Find the Creador 3D button 1 (hidden sm:flex)
const btn1 = /<button onClick=\{\(\) => \{ closeAllModals\(\); setActiveChat\('builder'\); \}\} className="hidden sm:flex[^>]*>\s*<Home[^>]*\/>\s*<span[^>]*>Creador 3D<\/span>\s*<\/button>/g;
code = code.replace(btn1, "");

// Find the Creador 3D button 2 (sm:hidden)
const btn2 = /<button onClick=\{\(\) => \{ closeAllModals\(\); setActiveChat\('builder'\); \}\} className="sm:hidden[^>]*>\s*<Home[^>]*\/>\s*<\/button>/g;
code = code.replace(btn2, "");

// Find the Creador 3D button 3 (AXISS sidebar button)
const btn3 = /<button className=\{`flex items-center justify-center gap-2 text-\[#D4AF37\] bg-\[#121B2A\]\/80 border \$\{activeChat === 'builder'[^\}]+\} px-3 py-2 rounded-2xl hover:bg-white\/5 hover:text-\[#E8D9B0\] transition-all text-sm font-medium shadow-sm`\} onClick=\{\(\) => \{ closeAllModals\(\); setIsSidebarOpen\(false\); setActiveChat\('builder'\); \}\}>\s*<Box[^>]*\/>\s*Creador 3D\s*<\/button>/g;
code = code.replace(btn3, "");

// Find the Creador 3D button 4 (AXISS floating button)
const btn4 = /\{user\?.username\?.toUpperCase\(\) === 'AXISS' && \(\s*<button\s*onClick=\{\(\) => \{ closeAllModals\(\); setActiveChat\('builder'\); \}\}\s*className="fixed bottom-6 left-6 z-\[9000\][^>]*\s*title="Abrir Creador 3D"\s*>\s*<Box[^>]*\/>\s*<\/button>\s*\)\}/g;
code = code.replace(btn4, "");

fs.writeFileSync('src/App.tsx', code);
