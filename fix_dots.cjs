const fs = require('fs');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    // Make pieces NOT draggable for mobile tap-to-move optimization
    code = code.replace(/arePiecesDraggable=\{true\}/g, "arePiecesDraggable={false}");

    // Fix the option squares styling to use backgroundImage so it doesn't break the board color
    code = code.replace(/background: isCapture\s*\n\s*\? 'radial-gradient\\(circle, rgba\\(255,0,0,\\.5\\) 85%, transparent 85%\\)'\s*\n\s*: 'radial-gradient\\(circle, rgba\\(0,255,0,\\.5\\) 25%, transparent 25%\\)'/g, 
        `backgroundImage: isCapture
          ? 'radial-gradient(circle, rgba(255,0,0,.5) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(0,255,0,.5) 25%, transparent 25%)'`);

    // Fix the selected square
    code = code.replace(/background: 'rgba\\(255, 255, 0, 0\\.6\\)'/g, "backgroundColor: 'rgba(255, 255, 0, 0.6)'");

    fs.writeFileSync(filePath, code);
    console.log("Fixed " + filePath);
}

fixFile('src/components/ChessBotModal.tsx');
fixFile('src/components/ChessGameModal.tsx');
