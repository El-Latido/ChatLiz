const fs = require('fs');

function fix(filePath, isBot) {
    let file = fs.readFileSync(filePath, 'utf8');

    const clickSig = "function onSquareClick(square: string) {";
    const oldCode = file.substring(file.indexOf(clickSig), file.indexOf("  const sendChat = ") - 2);

    const colorDef = isBot ? "const myColor = 'w';" : "const myColor = isHost ? 'w' : 'b';";

    const newCode = `function onSquareClick(square: string) {
    console.log('Pieza tocada en:', square);
    ${colorDef}
    if (status !== 'playing' || game.turn() !== myColor) return;

    function getOptionSquares(sq: string) {
      const moves = game.moves({ square: sq as any, verbose: true }) as any[];
      const newSquares: Record<string, any> = {};
      moves.forEach((m) => {
        newSquares[m.to] = {
          background:
            game.get(m.to as any) && game.get(m.to as any).color !== myColor
              ? 'radial-gradient(circle, rgba(255,0,0,.5) 85%, transparent 85%)'
              : 'radial-gradient(circle, rgba(0,255,0,.5) 25%, transparent 25%)',
          borderRadius: '50%',
          zIndex: 10,
        };
      });
      newSquares[sq] = { background: 'rgba(255, 255, 0, 0.6)' };
      return newSquares;
    }

    if (!moveFrom) {
      // Paso 1: Seleccionar pieza
      const piece = game.get(square as any);
      if (piece && piece.color === myColor) {
        setMoveFrom(square);
        setOptionSquares(getOptionSquares(square));
      }
      return;
    }

    // Paso 2: Intentar mover
    try {
      const move = game.move({
        from: moveFrom as any,
        to: square as any,
        promotion: 'q',
      });
      
      // Paso 3: Resetear selección (sea éxito o error)
      setMoveFrom('');
      setOptionSquares({});

      if (move) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        ${isBot ? `
        if (newGame.isGameOver()) {
          const isDraw = newGame.isDraw() || newGame.isStalemate() || newGame.isThreefoldRepetition();
          socket.emit('chess_bot_game_over', { gameId, result: isDraw ? 'draw' : 'user_won', winner: user.username });
          setStatus(isDraw ? 'draw' : 'won');
        } else {
          makeBotMove(newGame);
        }` : `
        socket.emit('chess_move', { gameId, move, fen: newGame.fen() });
        if (newGame.isGameOver()) {
          socket.emit('chess_game_over', { gameId, result: newGame.isCheckmate() ? 'checkmate' : 'draw', winner: user.username });
        }`}
      } else {
         // Si el movimiento falló pero tocaron otra pieza de su color, seleccionarla
         const piece = game.get(square as any);
         if (piece && piece.color === myColor) {
           setMoveFrom(square);
           setOptionSquares(getOptionSquares(square));
         }
      }
    } catch (e) {
      setMoveFrom('');
      setOptionSquares({});
    }
  }`;

    file = file.replace(oldCode, newCode);
    fs.writeFileSync(filePath, file);
}

fix('src/components/ChessGameModal.tsx', false);
fix('src/components/ChessBotModal.tsx', true);
