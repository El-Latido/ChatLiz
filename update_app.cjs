const fs = require('fs');

function updateApp() {
    let code = fs.readFileSync('src/App.tsx', 'utf8');

    // Add imports
    if (!code.includes("import { PoolGameModal }")) {
        code = code.replace("import { ChessGameModal }", "import { ChessGameModal }\nimport { PoolGameModal } from './components/PoolGameModal';");
    }

    // Add state
    if (!code.includes("poolData")) {
        code = code.replace("const [chessData, setChessData]", "const [poolData, setPoolData] = useState<{ gameId: string; isHost: boolean; opponentName: string; bet: number } | null>(null);\n  const [chessData, setChessData]");
    }

    // Add pool_invite_accepted socket listener
    if (!code.includes("pool_invite_accepted")) {
        const poolAccepted = `
    socket.on('pool_invite_accepted', (data) => {
      setPoolData({ gameId: data.gameId, isHost: true, opponentName: data.opponent, bet: data.bet });
      setActiveChat('pool');
    });
`;
        code = code.replace("socket.on('chess_invite_accepted'", poolAccepted + "    socket.on('chess_invite_accepted'");
    }

    // Add pool selection logic
    if (!code.includes("gameId.startsWith('pool_')")) {
        const poolLogic = `
                  } else if (gameId.startsWith('pool_')) {
                      const parsedBet = parseInt(gameId.split('_')[1], 10);
                      const bet = isNaN(parsedBet) ? 10 : parsedBet;
                      if ((user.lizCoins || 0) < bet) {
                          alert("No tienes suficientes Liz-Moneditas.");
                          return;
                      }
                      socket.emit('send_global', { 
                          text: bet > 0 ? \`¡Reto de Billar por \${bet * 2} LM!\` : \`¡Reto de Billar Amistoso!\`,
                          type: 'pool_invite',
                          inviteData: { gameId: \`pool_\${Date.now()}_\${user.username}\`, bet, host: user.username, gameType: 'pool' }
                      });
`;
        code = code.replace(/\} else if \(gameId\.startsWith\('chessbot_'\)\) \{/g, poolLogic + "                  } else if (gameId.startsWith('chessbot_')) {");
    }

    // Add Pool message render logic
    if (!code.includes("msg.type === 'pool_invite'")) {
        const poolMsg = `
                  {msg.type === 'pool_invite' && msg.inviteData && msg.inviteData.host !== user.username && (
                    <div className="mt-3">
                      <button 
                        onClick={() => {
                          const inviteData = msg.inviteData!;
                          socket.emit('accept_pool_invite', inviteData, (response: any) => {
                            if (response.success) {
                              setPoolData({ gameId: inviteData.gameId, isHost: false, opponentName: inviteData.host, bet: inviteData.bet });
                            } else {
                              alert(response.error);
                            }
                          });
                        }}
                        className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
                      >
                        🎱 Aceptar Reto de Billar
                      </button>
                    </div>
                  )}
`;
        code = code.replace(/\{msg\.type === 'chess_invite'/g, poolMsg + "                  {msg.type === 'chess_invite'");
    }

    // Render PoolGameModal
    if (!code.includes("<PoolGameModal")) {
        const poolModal = `
      {poolData && (
        <PoolGameModal
          gameId={poolData.gameId}
          isHost={poolData.isHost}
          opponentName={poolData.opponentName}
          bet={poolData.bet}
          socket={socket}
          user={user}
          onClose={() => setPoolData(null)}
        />
      )}
`;
        code = code.replace("{chessData &&", poolModal + "      {chessData &&");
    }

    fs.writeFileSync('src/App.tsx', code);
    console.log("Updated App.tsx");
}

updateApp();
