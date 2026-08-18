const fs = require('fs');

function removeBots() {
    let code = fs.readFileSync('src/components/GamesMenuModal.tsx', 'utf8');

    // Replace chess buttons
    code = code.replace(
        /<div className="flex gap-3">\s*<button onClick=\{\(\) => \{ onSelectGame\(`chessbot_\$\{chessBet\}`\); onClose\(\); \}\} className="flex-1 py-3 rounded-xl bg-\[#121B2A\] border border-\[#D4AF37\]\/50 text-\[#D4AF37\] hover:bg-\[#D4AF37\]\/20 font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">\s*🤖 vs Bot\s*<\/button>\s*<button onClick=\{\(\) => \{ onSelectGame\(`chess_\$\{chessBet\}`\); onClose\(\); \}\} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">\s*<Swords size=\{20\} \/> PvP Global\s*<\/button>\s*<\/div>/g,
        `<button onClick={() => { onSelectGame(\`chess_\${chessBet}\`); onClose(); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">\n                          <Swords size={20} /> Crear Reto Global\n                      </button>`
    );

    // Replace pool buttons
    code = code.replace(
        /<div className="flex gap-3">\s*<button onClick=\{\(\) => \{ onSelectGame\('poolsolo'\); onClose\(\); \}\} className="flex-1 py-3 rounded-xl bg-\[#121B2A\] border border-green-500\/50 text-green-400 hover:bg-green-500\/20 font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">\s*Práctica\s*<\/button>\s*<button onClick=\{\(\) => \{ onSelectGame\(`pool_\$\{chessBet\}`\); onClose\(\); \}\} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">\s*<Trophy size=\{20\} \/> PvP Global\s*<\/button>\s*<\/div>/g,
        `<button onClick={() => { onSelectGame(\`pool_\${chessBet}\`); onClose(); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">\n                          <Trophy size={20} /> Crear Reto Global\n                      </button>`
    );

    fs.writeFileSync('src/components/GamesMenuModal.tsx', code);
    console.log("Removed bot/solo modes from GamesMenuModal.tsx");
}

removeBots();
