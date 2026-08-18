const fs = require('fs');

function fixFile(filePath, isBot) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    // Regex to match from `function onPieceDrop` to the end of `function onSquareClick` 
    // This can be tricky with Regex, so let's do string replacement between clear markers.

    // Let's replace the whole block by splitting.
    const startDrop = code.indexOf('function onPieceDrop');
    if (startDrop === -1) return; // Something's wrong

    const endSquareClick = code.indexOf('const sendChat', startDrop);
    if (endSquareClick === -1) return;

    const before = code.substring(0, startDrop);
    const after = code.substring(endSquareClick);

    const botLogicMove = `
        if (newGame.isGameOver()) {
          const isDraw = newGame.isDraw() || newGame.isStalemate() || newGame.isThreefoldRepetition();
          socket.emit('chess_bot_game_over', { gameId, result: isDraw ? 'draw' : 'user_won', winner: user.username });
          setStatus(isDraw ? 'draw' : 'won');
        } else {
          makeBotMove(newGame);
        }
`;

    const multiLogicMove = `
        socket.emit('chess_move', { gameId, move, fen: newGame.fen() });
        if (newGame.isGameOver()) {
          socket.emit('chess_game_over', { gameId, result: newGame.isCheckmate() ? 'checkmate' : 'draw', winner: user.username });
        }
`;

    const nextActionCode = isBot ? botLogicMove : multiLogicMove;
    const myColorCode = isBot ? `const myColor = 'w';` : `const myColor = isHost ? 'w' : 'b';`;

    const newLogic = `
  function onPieceDrop(sourceSquare: string, targetSquare: string) {
    ${myColorCode}
    if (status !== 'playing' || game.turn() !== myColor) return false;

    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });
      
      if (move) {
        setGame(newGame);
        setMoveFrom('');
        setOptionSquares({});
        ${nextActionCode}
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  function getOptionSquares(sq: string, currentGame: any) {
    const moves = currentGame.moves({ square: sq as any, verbose: true }) as any[];
    const newSquares: Record<string, any> = {};
    ${myColorCode}
    moves.forEach((m: any) => {
      const isCapture = currentGame.get(m.to) && currentGame.get(m.to).color !== myColor;
      newSquares[m.to] = {
        background: isCapture
          ? 'radial-gradient(circle, rgba(255,0,0,.5) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(0,255,0,.5) 25%, transparent 25%)',
        borderRadius: '50%',
        zIndex: 10,
      };
    });
    newSquares[sq] = { background: 'rgba(255, 255, 0, 0.6)' };
    return newSquares;
  }

  function onSquareClick(square: string) {
    ${myColorCode}
    if (status !== 'playing' || game.turn() !== myColor) return;

    // Si no hay nada seleccionado, intentamos seleccionar
    if (!moveFrom) {
      const piece = game.get(square as any);
      if (piece && piece.color === myColor) {
        setMoveFrom(square);
        setOptionSquares(getOptionSquares(square, game));
      }
      return;
    }

    // Si ya hay algo seleccionado, intentamos mover
    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move({
        from: moveFrom as any,
        to: square as any,
        promotion: 'q',
      });
      
      if (move) {
        setGame(newGame);
        setMoveFrom('');
        setOptionSquares({});
        ${nextActionCode}
      }
    } catch (e) {
      // Si falla (movimiento invalido), chequeamos si tocaste otra pieza tuya
      const piece = game.get(square as any);
      if (piece && piece.color === myColor) {
        setMoveFrom(square);
        setOptionSquares(getOptionSquares(square, game));
      } else {
        // Tocaste un lugar vacío invalido, deseleccionar
        setMoveFrom('');
        setOptionSquares({});
      }
    }
  }

  `;

    fs.writeFileSync(filePath, before + newLogic + after);
    console.log("Fixed " + filePath);
}

fixFile('src/components/ChessBotModal.tsx', true);
fixFile('src/components/ChessGameModal.tsx', false);
