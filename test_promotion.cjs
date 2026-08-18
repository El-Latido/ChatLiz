const { Chess } = require('chess.js');
const game = new Chess();
try {
  const move = game.move({ from: 'e2', to: 'e4', promotion: 'q' });
  console.log("Move success:", move.san);
} catch(e) {
  console.log("Move error:", e.message);
}
try {
  const move = game.move({ from: 'e2', to: 'e4' });
  console.log("Move without promotion success:", move.san);
} catch(e) {
  console.log("Move without promotion error:", e.message);
}
