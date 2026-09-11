const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The first regex might have failed due to specific string matching in Ad bypass logic
const oldAdButtonFallbackRegex = /<button[\s\S]*?onClick=\{\(\) => \{[\s\S]*?Ver Anuncio Nativo \(\+100 Monedas\)[\s\S]*?<\/button>/;

const newAdButton = `<button
              onClick={() => setShowRealAdModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-95 animate-pulse"
            >
              <PlaySquare size={20} />
              Ver Video (+100 Monedas)
            </button>`;

if (oldAdButtonFallbackRegex.test(code)) {
    code = code.replace(oldAdButtonFallbackRegex, newAdButton);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed App button regex fallback");
} else {
    console.log("Regex fallback not needed or still failing");
}
