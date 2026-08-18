const fs = require('fs');

function updateMenu() {
    let code = fs.readFileSync('src/components/GamesMenuModal.tsx', 'utf8');

    if (!code.includes("id: 'pool'")) {
        const poolGame = `
    {
      id: 'pool',
      title: 'Billar Multijugador',
      icon: '🎱',
      description: 'Partidas 1v1 con físicas reales, control de potencia y apuestas LM.',
      color: 'from-green-500 to-emerald-500',
      shadow: 'rgba(34,197,94,0.2)',
      bg: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
      border: 'border-green-400/30'
    },`;
        code = code.replace(/const games = \[\n/, "const games = [\n" + poolGame);
        
        const poolRender = `
              {currentGame.id === 'pool' && (
                  <div className="flex flex-col gap-3 mb-4">
                      <select value={chessBet} onChange={(e) => setChessBet(Number(e.target.value))} className="bg-[#121B2A] border border-green-500/30 rounded-xl text-green-300 font-bold p-3 w-full outline-none">
                          <option value={0}>Partida Amistosa (0 LM)</option>
                          <option value={5}>Apuesta: 5 LM</option>
                          <option value={10}>Apuesta: 10 LM</option>
                          <option value={20}>Apuesta: 20 LM</option>
                          <option value={50}>Apuesta: 50 LM</option>
                      </select>
                      <button onClick={() => { onSelectGame(\`pool_\${chessBet}\`); onClose(); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">
                          <Trophy size={20} /> PvP Global
                      </button>
                  </div>
              )}
`;
        code = code.replace(/\{currentGame\.id === 'tutifrutti'/g, poolRender + "              {currentGame.id === 'tutifrutti'");
        
        fs.writeFileSync('src/components/GamesMenuModal.tsx', code);
        console.log("Updated GamesMenuModal");
    }
}

updateMenu();
