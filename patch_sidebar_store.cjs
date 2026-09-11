const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `          {/* AI Characters Button */}
          <div className="px-4 py-2">
            <button
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-3 py-2.5 rounded-xl font-bold shadow-lg transition-transform active:scale-95"
              onClick={() => {
                closeAllModals();
                setIsAiSelectorOpen(true);
              }}
            >
              <Bot size={18} />
              Personajes IA
            </button>
          </div>`;

const replacement = `          {/* Store Button */}
          <div className="px-4 py-2">
            <button
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-3 py-2.5 rounded-xl font-bold shadow-lg transition-transform active:scale-95 shadow-orange-500/20"
              onClick={() => {
                closeAllModals();
                setIsStoreOpen(true);
              }}
            >
              <Box size={18} />
              Tienda (Marcos)
            </button>
          </div>

          {/* AI Characters Button */}
          <div className="px-4 py-2">
            <button
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-3 py-2.5 rounded-xl font-bold shadow-lg transition-transform active:scale-95"
              onClick={() => {
                closeAllModals();
                setIsAiSelectorOpen(true);
              }}
            >
              <Bot size={18} />
              Personajes IA
            </button>
          </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched Sidebar Store button");
