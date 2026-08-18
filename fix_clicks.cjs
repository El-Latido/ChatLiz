const fs = require('fs');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    // React-chessboard passes multiple arguments to onSquareClick (square) and onPieceClick (piece, square)
    // We want to make sure we're getting the right ones.
    
    // Also, we should add console logs to see if it triggers
    code = code.replace(/function onSquareClick\(square: string\) {/, `function onSquareClick(square: string) {
    console.log("Clicked square", square, "current selection:", moveFrom);`);
    
    code = code.replace(/function onPieceClick\(piece: string, square: string\) {/, `function onPieceClick(piece: string, square: string) {
    console.log("Clicked piece", piece, "on square", square);`);

    fs.writeFileSync(filePath, code);
}

fixFile('src/components/ChessBotModal.tsx');
fixFile('src/components/ChessGameModal.tsx');
