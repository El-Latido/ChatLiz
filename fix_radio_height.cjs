const fs = require('fs');
let file = fs.readFileSync('src/components/InlineRadio.tsx', 'utf8');

const target = `height: '400px', overflowY: 'scroll'`;
const replacement = `maxHeight: '180px', overflowY: 'auto'`;

file = file.replace(target, replacement);

const targetContainer = `className="absolute bottom-[104px] left-0 w-64 bg-[#121B2A]/95 backdrop-blur-xl border border-[#D4AF37]/50 rounded-[16px] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2"`;
const replaceContainer = `className="absolute bottom-[104px] left-0 w-64 max-h-[60vh] overflow-y-auto scrollbar-thin bg-[#121B2A]/95 backdrop-blur-xl border border-[#D4AF37]/50 rounded-[16px] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2"`;

file = file.replace(targetContainer, replaceContainer);

fs.writeFileSync('src/components/InlineRadio.tsx', file);
