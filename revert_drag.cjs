const fs = require('fs');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    // Make sure arePiecesDraggable is true so mobile touch events are registered by the library
    code = code.replace(/arePiecesDraggable=\{false\}/g, "arePiecesDraggable={true}");
    
    // Ensure onPieceDrop does what it should if they accidentally drag
    const hasDrop = code.includes('onPieceDrop');
    if (!hasDrop) {
        // Not adding it back if it's too complex, but earlier I did add it.
    }

    fs.writeFileSync(filePath, code);
}

fixFile('src/components/ChessBotModal.tsx');
fixFile('src/components/ChessGameModal.tsx');
