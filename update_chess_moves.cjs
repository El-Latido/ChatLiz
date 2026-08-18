const fs = require('fs');

function updateChessFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    // 1. Enable dragging
    code = code.replace(/arePiecesDraggable=\{false\}/g, "arePiecesDraggable={true}\n                    onPieceDrop={onPieceDrop}");

    // 2. Add onPieceDrop function before onSquareClick
    const onDropCode = `
  function onPieceDrop(sourceSquare: string, targetSquare: string) {
    const myColor = isHost ? 'w' : 'b';
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
        socket.emit('chess_move', { gameId, move, fen: newGame.fen() });
        if (newGame.isGameOver()) {
          socket.emit('chess_game_over', { gameId, result: newGame.isCheckmate() ? 'checkmate' : 'draw', winner: user.username });
        }
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  function onSquareClick`;

    code = code.replace(/  function onSquareClick/g, onDropCode);

    // 3. Fix onSquareClick logic
    const oldTryCatch = `    try {
      const move = game.move({
        from: moveFrom as any,
        to: square as any,
        promotion: 'q',
      });
      
      if (move) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setMoveFrom('');
        setOptionSquares({});
        
        socket.emit('chess_move', { gameId, move, fen: newGame.fen() });
        if (newGame.isGameOver()) {
          socket.emit('chess_game_over', { gameId, result: newGame.isCheckmate() ? 'checkmate' : 'draw', winner: user.username });
        }
      } else {
         const piece = game.get(square as any);
         if (piece && piece.color === myColor) {
           setMoveFrom(square);
           setOptionSquares(getOptionSquares(square));
         } else {
           setMoveFrom('');
           setOptionSquares({});
         }
      }
    } catch (e) {
      console.error("Movimiento inválido:", e);
      setMoveFrom('');
      setOptionSquares({});
    }`;

    const newTryCatch = `    try {
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
        
        socket.emit('chess_move', { gameId, move, fen: newGame.fen() });
        if (newGame.isGameOver()) {
          socket.emit('chess_game_over', { gameId, result: newGame.isCheckmate() ? 'checkmate' : 'draw', winner: user.username });
        }
      }
    } catch (e) {
      const piece = game.get(square as any);
      if (piece && piece.color === myColor) {
        setMoveFrom(square);
        setOptionSquares(getOptionSquares(square));
      } else {
        setMoveFrom('');
        setOptionSquares({});
      }
    }`;

    code = code.replace(oldTryCatch, newTryCatch);

    fs.writeFileSync(filePath, code);
}

updateChessFile('src/components/ChessGameModal.tsx');

