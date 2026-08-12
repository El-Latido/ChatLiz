const fs = require('fs');

function fix(filePath) {
    let file = fs.readFileSync(filePath, 'utf8');

    const brokenCode = `          background:
            game.get(m.to as any) && game.get(m.to as any).color !== myColor
              ? 'radial-gradient(circle, rgba(255,0,0,.5) 85%, transparent 85%)',
          zIndex: 10
              : 'radial-gradient(circle, rgba(0,255,0,.5) 25%, transparent 25%)',
          zIndex: 10,
          borderRadius: '50%',`;

    const fixedCode = `          background:
            game.get(m.to as any) && game.get(m.to as any).color !== myColor
              ? 'radial-gradient(circle, rgba(255,0,0,.5) 85%, transparent 85%)'
              : 'radial-gradient(circle, rgba(0,255,0,.5) 25%, transparent 25%)',
          borderRadius: '50%',
          zIndex: 10,`;

    file = file.replace(brokenCode, fixedCode);
    
    // Some lines might have different whitespace, let's also do a regex just in case
    file = file.replace(/\? 'radial-gradient\(circle, rgba\(255,0,0,\.5\) 85%, transparent 85%\)',\s*zIndex: 10\s*: 'radial-gradient\(circle, rgba\(0,255,0,\.5\) 25%, transparent 25%\)',\s*zIndex: 10,/g, 
    "? 'radial-gradient(circle, rgba(255,0,0,.5) 85%, transparent 85%)'\n              : 'radial-gradient(circle, rgba(0,255,0,.5) 25%, transparent 25%)',\n          zIndex: 10,");

    fs.writeFileSync(filePath, file);
}

fix('src/components/ChessGameModal.tsx');
fix('src/components/ChessBotModal.tsx');
