const { Chess } = require('chess.js');
const game = new Chess();
console.log(game.moves({ square: 'e2', verbose: true }));
