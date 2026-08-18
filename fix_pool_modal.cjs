const fs = require('fs');

function fixApp() {
    let code = fs.readFileSync('src/App.tsx', 'utf8');

    // 1. Add import
    if (!code.includes("import { PoolGameModal }")) {
        code = code.replace(
            "import { ChessGameModal } from './components/ChessGameModal';",
            "import { ChessGameModal } from './components/ChessGameModal';\nimport { PoolGameModal } from './components/PoolGameModal';"
        );
    }

    // 3. Render modal
    if (!code.includes("<PoolGameModal")) {
        const modalRender = `
      {poolData && (
          <PoolGameModal
              gameId={poolData.gameId}
              isHost={poolData.isHost}
              opponentName={poolData.opponentName}
              bet={poolData.bet}
              socket={socket}
              user={user}
              onClose={() => { setPoolData(null); setActiveChat('global'); }}
          />
      )}
`;
        code = code.replace("{activeChessGame && !activeChessGame.isBot && (", modalRender + "\n      {activeChessGame && !activeChessGame.isBot && (");
    }

    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed PoolGameModal rendering in App.tsx");
}

fixApp();
