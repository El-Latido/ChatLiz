const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  '<div className="flex-1 flex items-center pl-3 pr-1 h-full">',
  '<div className="flex-1 flex items-center pl-3 pr-2 h-full">'
);
code = code.replace(
  '<div className="flex items-center gap-0.5 text-[#D4AF37]/80 shrink-0">',
  '<div className="flex items-center gap-0.5 text-[#D4AF37]/80 shrink-0 ml-1">'
);
code = code.replace(
  '<button onClick={() => setIsGamesMenuOpen(true)} className="hover:text-[#D4AF37] p-1.5 transition-colors" title="Juegos"><Gamepad2 size={20} strokeWidth={1.5} /></button>',
  '<button onClick={() => setIsGamesMenuOpen(true)} className="flex items-center justify-center hover:text-[#D4AF37] p-1.5 transition-colors" title="Juegos"><Gamepad2 size={18} strokeWidth={1.5} /></button>'
);
code = code.replace(
  '<button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="hover:text-[#D4AF37] p-1.5 transition-colors"><Smile size={20} strokeWidth={1.5} /></button>',
  '<button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex items-center justify-center hover:text-[#D4AF37] p-1.5 transition-colors"><Smile size={18} strokeWidth={1.5} /></button>'
);
code = code.replace(
  '<button onClick={() => fileInputRef.current?.click()} className="hover:text-[#D4AF37] p-1.5 transition-colors"><Paperclip size={20} strokeWidth={1.5} /></button>',
  '<button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center hover:text-[#D4AF37] p-1.5 transition-colors"><Paperclip size={18} strokeWidth={1.5} /></button>'
);
fs.writeFileSync('src/App.tsx', code);
console.log('Fixed');
