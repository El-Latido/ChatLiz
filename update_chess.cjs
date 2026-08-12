const fs = require('fs');

function updateFile(filePath, isBot) {
    let file = fs.readFileSync(filePath, 'utf8');

    // Add state variables for touch interaction
    if (!file.includes('moveFrom')) {
        file = file.replace(
            "const [winner, setWinner] = useState('');",
            "const [winner, setWinner] = useState('');\n  const [moveFrom, setMoveFrom] = useState('');\n  const [optionSquares, setOptionSquares] = useState({});"
        );
        file = file.replace(
            "const [status, setStatus] = useState('playing');",
            "const [status, setStatus] = useState('playing');\n  const [moveFrom, setMoveFrom] = useState('');\n  const [optionSquares, setOptionSquares] = useState({});"
        );
    }

    // Replace onDrop with onSquareClick
    const onDropRegex = /function onDrop\([\s\S]*?return false;\n\s*\}/m;
    
    let replacement = `function onSquareClick(square: string) {
    const myColor = ${isBot ? "'w'" : "isHost ? 'w' : 'b'"};
    if (status !== 'playing' || game.turn() !== myColor) return;

    function getOptionSquares(sq: string) {
      const moves = game.moves({ square: sq, verbose: true }) as any[];
      const newSquares: Record<string, any> = {};
      moves.forEach((m) => {
        newSquares[m.to] = {
          background:
            game.get(m.to as any) && game.get(m.to as any).color !== myColor
              ? 'radial-gradient(circle, rgba(255,0,0,.5) 85%, transparent 85%)'
              : 'radial-gradient(circle, rgba(0,0,0,.3) 25%, transparent 25%)',
          borderRadius: '50%',
        };
      });
      newSquares[sq] = { background: 'rgba(255, 255, 0, 0.4)' };
      return newSquares;
    }

    // If clicked on same square, deselect
    if (moveFrom === square) {
      setMoveFrom('');
      setOptionSquares({});
      return;
    }

    // Try selecting piece
    const piece = game.get(square as any);
    if (piece && piece.color === myColor) {
      setMoveFrom(square);
      setOptionSquares(getOptionSquares(square));
      return;
    }

    // If no piece selected yet, and we didn't just select one, do nothing
    if (!moveFrom) return;

    // Try to move
    try {
      const move = game.move({
        from: moveFrom,
        to: square,
        promotion: 'q',
      });
      
      if (move === null) {
        setMoveFrom('');
        setOptionSquares({});
        return;
      }

      const newGame = new Chess(game.fen());
      setGame(newGame);
      setMoveFrom('');
      setOptionSquares({});
      
      ${isBot ? `
      if (newGame.isGameOver()) {
        const isDraw = newGame.isDraw() || newGame.isStalemate() || newGame.isThreefoldRepetition();
        socket.emit('chess_bot_game_over', { gameId, result: isDraw ? 'draw' : 'user_won', winner: user.username });
        setStatus(isDraw ? 'draw' : 'won');
      } else {
        makeBotMove(newGame);
      }
      ` : `
      socket.emit('chess_move', { gameId, move, fen: newGame.fen() });
      if (newGame.isGameOver()) {
        socket.emit('chess_game_over', { gameId, result: newGame.isCheckmate() ? 'checkmate' : 'draw', winner: user.username });
      }
      `}
    } catch (e) {
      setMoveFrom('');
      setOptionSquares({});
    }
  }`;

    file = file.replace(onDropRegex, replacement);

    // Update ChessboardAny props
    const boardRegex = /<ChessboardAny[\s\S]*?onPieceDrop={onDrop}[\s\S]*?\/>/g;
    
    file = file.replace(boardRegex, (match) => {
        let updated = match.replace(/onPieceDrop={onDrop}/, 'onSquareClick={onSquareClick}\n                    arePiecesDraggable={false}');
        
        if (!updated.includes('customSquareStyles')) {
             updated = updated.replace('/>', 'customSquareStyles={optionSquares}\n                />');
        } else {
             // We need to merge customSquareStyles
             updated = updated.replace(/customSquareStyles=\{([^}]+)\}/, 'customSquareStyles={{...$1, ...optionSquares}}');
        }
        return updated;
    });

    // Remove old onDrop if it still exists (some cases might not match the regex)
    file = file.replace(/onPieceDrop={onDrop}/g, '');

    fs.writeFileSync(filePath, file);
}

updateFile('src/components/ChessGameModal.tsx', false);
updateFile('src/components/ChessBotModal.tsx', true);

