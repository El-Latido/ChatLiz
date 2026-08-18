const fs = require('fs');

function hookApp() {
    let code = fs.readFileSync('src/App.tsx', 'utf8');

    // 1. Add import
    if (!code.includes("PoolGameModal")) {
        code = code.replace(
            "import { ChessGameModal } from './components/ChessGameModal';",
            "import { ChessGameModal } from './components/ChessGameModal';\nimport { PoolGameModal } from './components/PoolGameModal';"
        );
    }

    // 2. Add state
    if (!code.includes("const [poolData")) {
        code = code.replace(
            "const [activeChessGame, setActiveChessGame] = useState<any>(null);",
            "const [activeChessGame, setActiveChessGame] = useState<any>(null);\n  const [poolData, setPoolData] = useState<any>(null);"
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
              onClose={() => setPoolData(null)}
          />
      )}
`;
        code = code.replace("{activeChessGame && (", modalRender + "\n      {activeChessGame && (");
    }

    fs.writeFileSync('src/App.tsx', code);
    console.log("Hooked PoolGameModal into App.tsx");
}

hookApp();
