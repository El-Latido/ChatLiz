const fs = require('fs');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    // Manually replace background with backgroundImage and backgroundColor
    code = code.replace(/background: isCapture\n\s*\?\s*'radial-gradient/g, "backgroundImage: isCapture\n          ? 'radial-gradient");
    code = code.replace(/background: isCapture\s*\n\s*\?\s*'radial-gradient/g, "backgroundImage: isCapture\n          ? 'radial-gradient");
    
    // Just to be sure, let's use a more robust replacement
    const blockToReplace = `      newSquares[m.to] = {
        background: isCapture
          ? 'radial-gradient(circle, rgba(255,0,0,.5) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(0,255,0,.5) 25%, transparent 25%)',
        borderRadius: '50%',
        zIndex: 10,
      };`;
      
    const newBlock = `      newSquares[m.to] = {
        backgroundImage: isCapture
          ? 'radial-gradient(circle, rgba(255,0,0,.5) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(0,255,0,.5) 25%, transparent 25%)',
        borderRadius: '50%',
      };`;
      
    code = code.replace(blockToReplace, newBlock);
    
    const blockToReplace2 = `newSquares[sq] = { background: 'rgba(255, 255, 0, 0.6)' };`;
    const newBlock2 = `newSquares[sq] = { backgroundColor: 'rgba(255, 255, 0, 0.6)' };`;
    code = code.replace(blockToReplace2, newBlock2);
    
    // Disable drag
    code = code.replace(/arePiecesDraggable=\{true\}/g, "arePiecesDraggable={false}");

    fs.writeFileSync(filePath, code);
}

fixFile('src/components/ChessBotModal.tsx');
fixFile('src/components/ChessGameModal.tsx');
