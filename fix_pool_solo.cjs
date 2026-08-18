const fs = require('fs');

function updateApp() {
    let code = fs.readFileSync('src/App.tsx', 'utf8');

    // Add poolsolo to onSelectGame
    const soloLogic = `
                  } else if (gameId === 'poolsolo') {
                      setPoolData({ gameId: \`pool_solo_\${Date.now()}\`, isHost: true, opponentName: 'Práctica', bet: 0 });
`;
    if (!code.includes("gameId === 'poolsolo'")) {
        code = code.replace("} else if (gameId.startsWith('pool_')) {", soloLogic + "                  } else if (gameId.startsWith('pool_')) {");
        fs.writeFileSync('src/App.tsx', code);
        console.log("App.tsx updated");
    }

    let menuCode = fs.readFileSync('src/components/GamesMenuModal.tsx', 'utf8');
    const newButtons = `
                      <div className="flex gap-3">
                          <button onClick={() => { onSelectGame('poolsolo'); onClose(); }} className="flex-1 py-3 rounded-xl bg-[#121B2A] border border-green-500/50 text-green-400 hover:bg-green-500/20 font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">
                              Práctica
                          </button>
                          <button onClick={() => { onSelectGame(\`pool_\${chessBet}\`); onClose(); }} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">
                              <Trophy size={20} /> PvP Global
                          </button>
                      </div>
`;
    if (!menuCode.includes("poolsolo")) {
        menuCode = menuCode.replace(/<button onClick=\{\(\) => \{ onSelectGame\(`pool_\$\{chessBet\}`\); onClose\(\); \}\} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">\s*<Trophy size=\{20\} \/> PvP Global\s*<\/button>/g, newButtons);
        fs.writeFileSync('src/components/GamesMenuModal.tsx', menuCode);
        console.log("Menu updated");
    }
}

updateApp();
