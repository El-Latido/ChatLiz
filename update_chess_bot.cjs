const fs = require('fs');

function updateChessFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    // 1. Enable dragging
    code = code.replace(/arePiecesDraggable=\{false\}/g, "arePiecesDraggable={true}\n                    onPieceDrop={onPieceDrop}");

    // 2. Add onPieceDrop function before onSquareClick
    const onDropCode = `
  function onPieceDrop(sourceSquare: string, targetSquare: string) {
    const myColor = 'w';
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
        
        if (newGame.isGameOver()) {
          socket.emit('chess_bot_game_over', { gameId, result: newGame.isCheckmate() ? 'user_won' : 'draw', winner: user.username });
        } else {
            // Trigger bot move
            setTimeout(() => {
                const fen = newGame.fen();
                fetch('https://stockfish.online/api/s/v2.php?fen=' + encodeURIComponent(fen) + '&depth=5')
                  .then(res => res.json())
                  .then(data => {
                     if (data.success && data.bestmove) {
                         const match = data.bestmove.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
                         if (match) {
                             const botMove = match[1];
                             const botGame = new Chess(newGame.fen());
                             botGame.move(botMove);
                             setGame(botGame);
                             
                             if (botGame.isGameOver()) {
                               socket.emit('chess_bot_game_over', { gameId, result: botGame.isCheckmate() ? 'bot_won' : 'draw', winner: 'Elizabeth_Bot' });
                             }
                         }
                     }
                  }).catch(e => console.error("Bot error:", e));
            }, 500);
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
        
        if (newGame.isGameOver()) {
          socket.emit('chess_bot_game_over', { gameId, result: newGame.isCheckmate() ? 'user_won' : 'draw', winner: user.username });
        } else {
            // Trigger bot move
            setTimeout(() => {
                const fen = newGame.fen();
                fetch('https://stockfish.online/api/s/v2.php?fen=' + encodeURIComponent(fen) + '&depth=5')
                  .then(res => res.json())
                  .then(data => {
                     if (data.success && data.bestmove) {
                         const match = data.bestmove.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
                         if (match) {
                             const botMove = match[1];
                             const botGame = new Chess(newGame.fen());
                             botGame.move(botMove);
                             setGame(botGame);
                             
                             if (botGame.isGameOver()) {
                               socket.emit('chess_bot_game_over', { gameId, result: botGame.isCheckmate() ? 'bot_won' : 'draw', winner: 'Elizabeth_Bot' });
                             }
                         }
                     }
                  }).catch(e => console.error("Bot error:", e));
            }, 500);
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
        
        if (newGame.isGameOver()) {
          socket.emit('chess_bot_game_over', { gameId, result: newGame.isCheckmate() ? 'user_won' : 'draw', winner: user.username });
        } else {
            // Trigger bot move
            setTimeout(() => {
                const fen = newGame.fen();
                fetch('https://stockfish.online/api/s/v2.php?fen=' + encodeURIComponent(fen) + '&depth=5')
                  .then(res => res.json())
                  .then(data => {
                     if (data.success && data.bestmove) {
                         const match = data.bestmove.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
                         if (match) {
                             const botMove = match[1];
                             const botGame = new Chess(newGame.fen());
                             botGame.move(botMove);
                             setGame(botGame);
                             
                             if (botGame.isGameOver()) {
                               socket.emit('chess_bot_game_over', { gameId, result: botGame.isCheckmate() ? 'bot_won' : 'draw', winner: 'Elizabeth_Bot' });
                             }
                         }
                     }
                  }).catch(e => console.error("Bot error:", e));
            }, 500);
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

updateChessFile('src/components/ChessBotModal.tsx');

