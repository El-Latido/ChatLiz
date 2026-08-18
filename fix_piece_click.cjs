const fs = require('fs');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    // Add onPieceClick
    if (!code.includes('onPieceClick={onPieceClick}')) {
        code = code.replace(/onSquareClick=\{onSquareClick\}/, "onSquareClick={onSquareClick}\n                    onPieceClick={onPieceClick}");
        
        const pieceClickFunc = `
  function onPieceClick(piece: string, square: string) {
    onSquareClick(square);
  }
`;
        code = code.replace(/function onSquareClick/, pieceClickFunc + "\n  function onSquareClick");
        fs.writeFileSync(filePath, code);
        console.log("Fixed " + filePath);
    }
}

fixFile('src/components/ChessBotModal.tsx');
fixFile('src/components/ChessGameModal.tsx');
