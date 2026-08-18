const fs = require('fs');

function fixFile(filePath, isBot) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    // Remove onPieceClick entirely, it might be interfering
    code = code.replace(/onPieceClick=\{onPieceClick\}/g, "");
    code = code.replace(/function onPieceClick\([\s\S]*?\}\s*function onSquareClick/g, "function onSquareClick");

    // Ensure dragging is enabled again, maybe the library requires it to register clicks properly, 
    // but we can just let it be draggable. The user said "No quiero arrastrar el peon solo quiero moverlo con toques".
    // If it's draggable, they can STILL tap to move! The library supports tap to move by default even if draggable.
    code = code.replace(/arePiecesDraggable=\{false\}/g, "arePiecesDraggable={true}");

    fs.writeFileSync(filePath, code);
}

fixFile('src/components/ChessBotModal.tsx', true);
fixFile('src/components/ChessGameModal.tsx', false);
